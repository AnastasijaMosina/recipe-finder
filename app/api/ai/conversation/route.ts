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
  extractedFilters: aiConversationStateSchema.shape.extractedFilters.optional(),
  isReadyToSearch: z.boolean(),
});

export type AiConversationRequest = z.infer<typeof aiConversationRequestSchema>;
export type AiConversationRouteResponse = z.infer<typeof aiConversationRouteResponseSchema>;

const FALLBACK_ASSISTANT_RESPONSE: AiConversationRouteResponse = {
  assistantReply:
    'I could not process that request safely. Please try again with a short recipe preference.',
  followUpQuestions: ['What meal type do you want (breakfast, lunch, dinner)?'],
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

    // Step 3 skeleton: build strict JSON prompt now, and swap the mock provider later.
    const prompt = buildAiConversationPrompt({ conversationHistory, latestUserMessage });
    void prompt;

    // Placeholder model call; replaced by real provider call in the integration step.
    const rawProviderResponse = createMockProviderJsonResponse(latestUserMessage);
    const parsedProviderResponse = parseAiProviderResponse(rawProviderResponse);

    if (!parsedProviderResponse.success) {
      return NextResponse.json(FALLBACK_ASSISTANT_RESPONSE);
    }

    const normalizedProviderResponse = aiProviderResponseSchema.parse(parsedProviderResponse.data);

    // Skeleton response only. Model integration and slot filling are added in later steps.
    const conversationState = aiConversationStateSchema.parse({
      ...createInitialAiConversationState(),
      intentText: latestUserMessage,
      extractedFilters: normalizedProviderResponse.extractedFilters ?? {},
      followUpQuestions:
        normalizedProviderResponse.followUpQuestions.length > 0
          ? normalizedProviderResponse.followUpQuestions
          : ['Any preferred cuisine?'],
      isReadyToSearch: normalizedProviderResponse.isReadyToSearch,
    });

    const responsePayload: AiConversationRouteResponse = {
      assistantReply: `Got it. ${conversationState.followUpQuestions[0]}`,
      followUpQuestions: conversationState.followUpQuestions,
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
