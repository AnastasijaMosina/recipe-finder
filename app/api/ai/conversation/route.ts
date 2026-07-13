import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  aiConversationStateSchema,
  createInitialAiConversationState,
} from '../../../domain/ai/conversationContract';
import { aiProviderResponseSchema } from '../../../domain/ai/aiProviderResponseSchema';
import { ApiError, errorResponse } from '../../../utils/apiErrorHandler';
import {
  buildAiConversationPrompt,
  createMockProviderJsonResponse,
  parseAiProviderResponse,
} from '../../../services/ai/aiConversationPrompt';
import {
  detectMissingSlots,
  generateFollowUpQuestions,
  generatePossibleAnswers,
  isReadyToSearch,
} from '../../../services/ai/slotFilling';
import { extractFiltersFromConversation } from '../../../services/ai/ruleBasedFilterExtractor';
import { resolveConversationLanguage } from '../../../services/ai/languageMediator';

const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1, 'Message content is required.'),
});

const aiConversationRequestSchema = z.object({
  conversationHistory: z.array(conversationMessageSchema).default([]),
  latestUserMessage: z.string().trim().min(1, 'Latest user message is required.'),
});

const aiConversationRouteResponseSchema = z.object({
  assistantReply: z.string().trim().min(1),
  followUpQuestions: z.array(z.string().trim().min(1)),
  possibleAnswers: z.array(z.string().trim().min(1)),
  extractedFilters: aiConversationStateSchema.shape.extractedFilters.optional(),
  isReadyToSearch: z.boolean(),
});

export type AiConversationRequest = z.infer<typeof aiConversationRequestSchema>;
export type AiConversationRouteResponse = z.infer<typeof aiConversationRouteResponseSchema>;

const FALLBACK_ASSISTANT_RESPONSE: AiConversationRouteResponse = {
  assistantReply:
    'I could not process that request safely. Please try again with a short recipe preference.',
  followUpQuestions: ['What meal type do you want (breakfast, lunch, dinner)?'],
  possibleAnswers: ['breakfast', 'lunch', 'dinner', 'snack'],
  isReadyToSearch: false,
};

export async function POST(request: NextRequest) {
  try {
    const rawBody: unknown = await request.json();
    const parsedRequest = aiConversationRequestSchema.safeParse(rawBody);

    if (!parsedRequest.success) {
      return errorResponse(
        new ApiError(400, 'Invalid conversation payload. Please check your input.')
      );
    }

    const { conversationHistory, latestUserMessage } = parsedRequest.data;

    const languageContext = await resolveConversationLanguage({
      conversationHistory,
      latestUserMessage,
    });

    const processingConversationHistory = languageContext.conversationHistoryForProcessing;
    const processingLatestUserMessage = languageContext.latestUserMessageForProcessing;

    // Step 3 skeleton: build strict JSON prompt now, and swap the mock provider later.
    const prompt = buildAiConversationPrompt({
      conversationHistory: processingConversationHistory,
      latestUserMessage: processingLatestUserMessage,
    });
    void prompt;

    // Placeholder model call; replaced by real provider call in the integration step.
    const rawProviderResponse = createMockProviderJsonResponse(processingLatestUserMessage);
    const parsedProviderResponse = parseAiProviderResponse(rawProviderResponse);

    const normalizedProviderResponse = parsedProviderResponse.success
      ? aiProviderResponseSchema.parse(parsedProviderResponse.data)
      : null;

    const extractedFilters = extractFiltersFromConversation({
      conversationHistory: processingConversationHistory,
      latestUserMessage: processingLatestUserMessage,
      baseFilters: normalizedProviderResponse?.extractedFilters ?? {},
    });
    const missingSlots = detectMissingSlots(extractedFilters);
    const readyToSearch = isReadyToSearch(extractedFilters);
    const followUpQuestions = generateFollowUpQuestions(missingSlots);
    const possibleAnswers = generatePossibleAnswers(missingSlots);

    const conversationState = aiConversationStateSchema.parse({
      ...createInitialAiConversationState(),
      intentText: processingLatestUserMessage,
      extractedFilters,
      missingSlots,
      followUpQuestions,
      isReadyToSearch: readyToSearch,
    });

    const assistantReply =
      conversationState.followUpQuestions.length > 0
        ? `Got it. ${conversationState.followUpQuestions[0]}`
        : 'Great, I have enough details. I can search recipes now.';

    const localizableTexts = [
      assistantReply,
      ...conversationState.followUpQuestions,
      ...possibleAnswers,
    ];
    const localizedTexts = await languageContext.localizeTextsForUser(localizableTexts);

    const localizedAssistantReply = localizedTexts[0] ?? assistantReply;
    const localizedFollowUpQuestions = localizedTexts.slice(
      1,
      1 + conversationState.followUpQuestions.length
    );
    const localizedPossibleAnswers = localizedTexts.slice(
      1 + conversationState.followUpQuestions.length
    );

    const localizedFallbackTexts = await languageContext.localizeTextsForUser([
      FALLBACK_ASSISTANT_RESPONSE.assistantReply,
      ...FALLBACK_ASSISTANT_RESPONSE.followUpQuestions,
      ...FALLBACK_ASSISTANT_RESPONSE.possibleAnswers,
    ]);

    const localizedFallbackAssistantReply =
      localizedFallbackTexts[0] ?? FALLBACK_ASSISTANT_RESPONSE.assistantReply;
    const localizedFallbackFollowUpQuestions = localizedFallbackTexts.slice(
      1,
      1 + FALLBACK_ASSISTANT_RESPONSE.followUpQuestions.length
    );
    const localizedFallbackPossibleAnswers = localizedFallbackTexts.slice(
      1 + FALLBACK_ASSISTANT_RESPONSE.followUpQuestions.length
    );

    const responsePayload: AiConversationRouteResponse = {
      assistantReply: parsedProviderResponse.success
        ? localizedAssistantReply
        : localizedFallbackAssistantReply,
      followUpQuestions: parsedProviderResponse.success
        ? localizedFollowUpQuestions
        : localizedFallbackFollowUpQuestions,
      possibleAnswers: parsedProviderResponse.success
        ? localizedPossibleAnswers
        : localizedFallbackPossibleAnswers,
      isReadyToSearch: conversationState.isReadyToSearch,
      extractedFilters: conversationState.extractedFilters,
    };

    const validatedResponsePayload = aiConversationRouteResponseSchema.parse(responsePayload);

    return NextResponse.json(validatedResponsePayload);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return errorResponse(
        new ApiError(400, 'Invalid JSON body. Please check your request format.')
      );
    }

    return errorResponse(
      new ApiError(500, 'An unexpected error occurred. Please try again.', String(err))
    );
  }
}
