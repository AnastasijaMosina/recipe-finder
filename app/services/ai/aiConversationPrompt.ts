import {
  type AiProviderResponse,
  aiProviderResponseSchema,
} from '../../domain/ai/aiProviderResponseSchema';

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * Simple heuristic to detect if text is likely in English.
 * Checks if text is mostly ASCII characters (Latin alphabet + basic punctuation).
 * Not perfect but efficient for detecting non-Latin scripts (Cyrillic, Arabic, CJK, etc.)
 */
function isLikelyEnglish(text: string): boolean {
  if (!text) return false;

  // Count ASCII vs non-ASCII characters
  let asciiCount = 0;
  let totalCount = 0;

  for (const char of text) {
    totalCount++;
    const code = char.charCodeAt(0);
    // ASCII printable range: 32-126, plus common whitespace
    if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) {
      asciiCount++;
    }
  }

  // If more than 80% ASCII, likely English or other Latin-based language
  return totalCount > 0 && asciiCount / totalCount > 0.8;
}

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
  const likelyEnglish = isLikelyEnglish(latestUserMessage);

  return [
    'You are a recipe assistant.',
    'CRITICAL: Return ONLY a raw JSON object. No markdown, no code blocks, no explanations, no text before or after.',
    likelyEnglish
      ? 'The user wrote in English. No translation needed.'
      : 'Detect the language the user is writing in. If not English, translate their message to English internally before extracting filters.',
    'Always reply to the user in their detected language.',
    'Always normalize extracted filter values to English inside the JSON fields (e.g. "pollo" → chicken, "cena" → dinner, "poulet" → chicken).',
    'Use this exact JSON shape:',
    JSON.stringify(RESPONSE_SHAPE_EXAMPLE),
    "If data is missing, ask concise follow-up questions in the user's detected language and set isReadyToSearch=false.",
    `Conversation history: ${serializedHistory}`,
    `Latest user message: ${latestUserMessage}`,
  ].join('\n');
};

export const parseAiProviderResponse = (rawText: string) => {
  try {
    // Try direct parse first
    const parsedJson: unknown = JSON.parse(rawText);
    return aiProviderResponseSchema.safeParse(parsedJson);
  } catch {
    // If direct parse fails, try to extract JSON from text
    // (model might wrap it in markdown or explanations)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsedJson: unknown = JSON.parse(jsonMatch[0]);
        return aiProviderResponseSchema.safeParse(parsedJson);
      } catch {
        return aiProviderResponseSchema.safeParse(undefined);
      }
    }
    return aiProviderResponseSchema.safeParse(undefined);
  }
};
