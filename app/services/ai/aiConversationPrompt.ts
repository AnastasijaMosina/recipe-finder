import { type AiProviderResponse, aiProviderResponseSchema } from '../../domain/ai/aiProviderResponseSchema';

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type BuildPromptInput = {
  conversationHistory: ConversationMessage[];
  latestUserMessage: string;
};

const RESPONSE_SHAPE_EXAMPLE: AiProviderResponse = {
  assistantReply: 'Got it. What meal type do you want (breakfast, lunch, dinner)?',
  followUpQuestions: ['What meal type do you want (breakfast, lunch, dinner)?'],
  extractedFilters: {
    includeIngredients: 'chicken',
  },
  isReadyToSearch: false,
};

export const buildAiConversationPrompt = ({
  conversationHistory,
  latestUserMessage,
}: BuildPromptInput): string => {
  const serializedHistory = JSON.stringify(conversationHistory);

  return [
    'You are a recipe assistant.',
    'Return STRICT JSON only. Do not include markdown fences or extra text.',
    'Use this exact JSON shape:',
    JSON.stringify(RESPONSE_SHAPE_EXAMPLE),
    'If data is missing, ask concise follow-up questions and set isReadyToSearch=false.',
    `Conversation history: ${serializedHistory}`,
    `Latest user message: ${latestUserMessage}`,
  ].join('\n');
};

export const parseAiProviderResponse = (rawText: string) => {
  try {
    const parsedJson: unknown = JSON.parse(rawText);
    return aiProviderResponseSchema.safeParse(parsedJson);
  } catch {
    return aiProviderResponseSchema.safeParse(undefined);
  }
};

export const createMockProviderJsonResponse = (latestUserMessage: string): string =>
  JSON.stringify({
    assistantReply: `Got it: ${latestUserMessage}. What meal type do you want (breakfast, lunch, dinner)?`,
    followUpQuestions: ['What meal type do you want (breakfast, lunch, dinner)?'],
    extractedFilters: {},
    isReadyToSearch: false,
  } satisfies AiProviderResponse);
