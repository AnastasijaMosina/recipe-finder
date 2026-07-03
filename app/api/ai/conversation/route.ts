import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { aiConversationStateSchema } from '../../../domain/ai/conversationContract';
import { aiProviderResponseSchema } from '../../../domain/ai/aiProviderResponseSchema';
import { ApiError, errorResponse } from '../../../utils/apiErrorHandler';
import {
  buildAiConversationPrompt,
  parseAiProviderResponse,
} from '../../../services/ai/aiConversationPrompt';
import { callAiProvider } from '../../../services/ai/aiProvider';
import {
  detectMissingSlots,
  generatePossibleAnswers,
  isReadyToSearch,
} from '../../../services/ai/slotFilling';

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

    const prompt = buildAiConversationPrompt({ conversationHistory, latestUserMessage });

    let rawProviderResponse: string;
    try {
      rawProviderResponse = await callAiProvider(prompt, {
        apiKey: process.env.AZURE_AI_FOUNDRY_API_KEY,
        endpoint: process.env.AZURE_AI_FOUNDRY_ENDPOINT,
        model: process.env.AZURE_AI_FOUNDRY_MODEL,
        temperature: 0.7,
        maxTokens: 500,
      });
    } catch (err) {
      console.warn('LLM provider failed, using fallback:', String(err));
      return NextResponse.json(FALLBACK_ASSISTANT_RESPONSE);
    }

    console.log('Raw provider response:', rawProviderResponse);
    const parsedProviderResponse = parseAiProviderResponse(rawProviderResponse);

    if (!parsedProviderResponse.success) {
      console.error('Failed to parse provider response:', parsedProviderResponse.error);
      console.log('Response was:', rawProviderResponse);
      return NextResponse.json(FALLBACK_ASSISTANT_RESPONSE);
    }

    const normalizedProviderResponse = aiProviderResponseSchema.parse(parsedProviderResponse.data);
    const extractedFilters = normalizedProviderResponse.extractedFilters ?? {};

    const missingSlots = detectMissingSlots(extractedFilters);
    const readyToSearch = isReadyToSearch(extractedFilters);
    const possibleAnswers = generatePossibleAnswers(missingSlots);

    const responsePayload: AiConversationRouteResponse = {
      assistantReply: normalizedProviderResponse.assistantReply,
      followUpQuestions: normalizedProviderResponse.followUpQuestions,
      possibleAnswers,
      isReadyToSearch: readyToSearch,
      ...(Object.keys(extractedFilters).length > 0 ? { extractedFilters } : {}),
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
