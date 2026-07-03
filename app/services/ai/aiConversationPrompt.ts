import { type AiProviderResponse, aiProviderResponseSchema } from '../../domain/ai/aiProviderResponseSchema';
import type { SupportedLanguage } from '../../domain/ai/conversationLanguage';

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type BuildPromptInput = {
  conversationHistory: ConversationMessage[];
  latestUserMessage: string;
  language: SupportedLanguage;
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
  language,
}: BuildPromptInput): string => {
  const serializedHistory = JSON.stringify(conversationHistory);

  return [
    'You are a recipe assistant.',
    `The user communicates in language code: ${language}.`,
    'If the user writes in a language other than English, translate their message to English internally before extracting filters.',
    'Always reply to the user in their language.',
    'Always normalize extracted filter values to English inside the JSON fields (e.g. "pollo" → chicken, "cena" → dinner).',
    'Return STRICT JSON only. Do not include markdown fences or extra text.',
    'Use this exact JSON shape:',
    JSON.stringify(RESPONSE_SHAPE_EXAMPLE),
    'If data is missing, ask concise follow-up questions in the user\'s language and set isReadyToSearch=false.',
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


