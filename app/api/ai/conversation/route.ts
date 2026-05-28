import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  aiConversationStateSchema,
  createInitialAiConversationState,
} from '../../../domain/ai/conversationContract';
import { ApiError, errorResponse } from '../../../utils/apiErrorHandler';

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

export async function POST(request: NextRequest) {
  try {
    const rawBody: unknown = await request.json();
    const parsedRequest = aiConversationRequestSchema.safeParse(rawBody);

    if (!parsedRequest.success) {
      return errorResponse(
        new ApiError(400, 'Invalid conversation payload. Please check your input.')
      );
    }

    const { latestUserMessage } = parsedRequest.data;

    // Skeleton response only. Model integration and slot filling are added in later steps.
    const conversationState = aiConversationStateSchema.parse({
      ...createInitialAiConversationState(),
      intentText: latestUserMessage,
      followUpQuestions: [
        'What meal type do you want (breakfast, lunch, dinner)?',
        'Any preferred cuisine?',
      ],
    });

    const responsePayload: AiConversationRouteResponse = {
      assistantReply: `Got it. ${conversationState.followUpQuestions[0]}`,
      followUpQuestions: conversationState.followUpQuestions,
      isReadyToSearch: conversationState.isReadyToSearch,
      ...(Object.keys(conversationState.extractedFilters).length > 0
        ? { extractedFilters: conversationState.extractedFilters }
        : {}),
    };

    return NextResponse.json(responsePayload);
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
