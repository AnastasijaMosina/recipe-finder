import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  aiConversationStateSchema,
  createInitialAiConversationState,
} from '../../../domain/ai/conversationContract';
import { aiProviderResponseSchema } from '../../../domain/ai/aiProviderResponseSchema';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../../../domain/ai/conversationLanguage';
import { ApiError, errorResponse } from '../../../utils/apiErrorHandler';
import {
  buildAiConversationPrompt,
  parseAiProviderResponse,
} from '../../../services/ai/aiConversationPrompt';
import { callAiProvider } from '../../../services/ai/aiProvider';
import { callAiFallbackProvider } from '../../../services/ai/aiProviderFallback';
import {
  OPTIONAL_PREFERENCE_SLOTS,
  type OptionalPreferenceSlot,
  detectAskedSlotFromAssistantMessage,
  detectMissingSlots,
  generateFollowUpQuestions,
  generatePossibleAnswers,
  isNegativePreferenceAnswer,
  isReadyToSearch,
} from '../../../services/ai/slotFilling';
import { extractFiltersFromConversation } from '../../../services/ai/ruleBasedFilterExtractor';

const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1, 'Message content is required.'),
});

const aiConversationRequestSchema = z.object({
  conversationHistory: z.array(conversationMessageSchema).default([]),
  latestUserMessage: z.string().trim().min(1, 'Latest user message is required.'),
  language: z.enum(SUPPORTED_LANGUAGES).default(DEFAULT_LANGUAGE),
});

const deriveDeclinedOptionalSlots = (
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  latestUserMessage: string
): Set<OptionalPreferenceSlot> => {
  const declinedSlots = new Set<OptionalPreferenceSlot>();

  for (let index = 0; index < conversationHistory.length - 1; index += 1) {
    const currentMessage = conversationHistory[index];
    const nextMessage = conversationHistory[index + 1];

    if (currentMessage.role !== 'assistant' || nextMessage.role !== 'user') {
      continue;
    }

    const askedSlot = detectAskedSlotFromAssistantMessage(currentMessage.content);
    if (!askedSlot || !OPTIONAL_PREFERENCE_SLOTS.includes(askedSlot)) {
      continue;
    }

    if (isNegativePreferenceAnswer(nextMessage.content)) {
      declinedSlots.add(askedSlot);
    }
  }

  const lastAssistantMessage = [...conversationHistory]
    .reverse()
    .find((message) => message.role === 'assistant');

  const latestAskedSlot = lastAssistantMessage
    ? detectAskedSlotFromAssistantMessage(lastAssistantMessage.content)
    : undefined;

  if (
    latestAskedSlot &&
    OPTIONAL_PREFERENCE_SLOTS.includes(latestAskedSlot) &&
    isNegativePreferenceAnswer(latestUserMessage)
  ) {
    declinedSlots.add(latestAskedSlot);
  }

  return declinedSlots;
};

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

    const { conversationHistory, latestUserMessage, language } = parsedRequest.data;

    // Build the language-aware prompt.
    const prompt = buildAiConversationPrompt({ conversationHistory, latestUserMessage, language });

    // Call the real LLM provider; fallback if unavailable (firewall, no API key, etc).
    let rawProviderResponse: string;
    try {
      rawProviderResponse = await callAiProvider(prompt, {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 500,
      });
    } catch (err) {
      console.warn('LLM provider failed, using fallback:', String(err));
      rawProviderResponse = callAiFallbackProvider(
        conversationHistory,
        latestUserMessage,
        language
      );
    }

    const parsedProviderResponse = parseAiProviderResponse(rawProviderResponse);

    if (!parsedProviderResponse.success) {
      return NextResponse.json(FALLBACK_ASSISTANT_RESPONSE);
    }

    const normalizedProviderResponse = aiProviderResponseSchema.parse(parsedProviderResponse.data);

    const extractedFilters = extractFiltersFromConversation({
      conversationHistory,
      latestUserMessage,
      baseFilters: normalizedProviderResponse.extractedFilters ?? {},
    });
    const declinedOptionalSlots = deriveDeclinedOptionalSlots(
      conversationHistory,
      latestUserMessage
    );
    const missingSlots = detectMissingSlots(extractedFilters, [...declinedOptionalSlots]);
    const readyToSearch = isReadyToSearch(extractedFilters);
    const followUpQuestions = generateFollowUpQuestions(missingSlots);
    const possibleAnswers = generatePossibleAnswers(missingSlots);

    const conversationState = aiConversationStateSchema.parse({
      ...createInitialAiConversationState(),
      intentText: latestUserMessage,
      extractedFilters,
      missingSlots,
      followUpQuestions,
      isReadyToSearch: readyToSearch,
    });

    const assistantReply =
      conversationState.followUpQuestions.length > 0
        ? `Got it. ${conversationState.followUpQuestions[0]}`
        : 'Great, I have enough details. I can search recipes now.';

    const responsePayload: AiConversationRouteResponse = {
      assistantReply,
      followUpQuestions: conversationState.followUpQuestions,
      possibleAnswers,
      isReadyToSearch: conversationState.isReadyToSearch,
      ...(Object.keys(conversationState.extractedFilters).length > 0
        ? { extractedFilters: conversationState.extractedFilters }
        : {}),
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
