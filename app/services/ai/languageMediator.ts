import { z } from 'zod';

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ResolveConversationLanguageInput = {
  conversationHistory: ConversationMessage[];
  latestUserMessage: string;
};

type ResolvedConversationLanguage = {
  sourceLanguageCode: string;
  isEnglish: boolean;
  conversationHistoryForProcessing: ConversationMessage[];
  latestUserMessageForProcessing: string;
  localizeTextsForUser: (texts: string[]) => Promise<string[]>;
};

type FoundryMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const languageDetectionSchema = z.object({
  languageCode: z.string().trim().min(2),
  isEnglish: z.boolean(),
});

const translationBatchSchema = z.object({
  translatedTexts: z.array(z.string()),
});

const FOUNDRY_ENDPOINT = process.env.AZURE_FOUNDRY_PHI4_CHAT_COMPLETIONS_URL;
const FOUNDRY_API_KEY = process.env.AZURE_FOUNDRY_API_KEY;
const FOUNDRY_MODEL = process.env.AZURE_FOUNDRY_MODEL;
const FOUNDRY_API_VERSION = process.env.AZURE_FOUNDRY_API_VERSION;
const FOUNDRY_AUTH_SCHEME = process.env.AZURE_FOUNDRY_AUTH_SCHEME?.toLowerCase();

const hasFoundryConfig = (): boolean => Boolean(FOUNDRY_ENDPOINT && FOUNDRY_API_KEY);

const getFoundryHeaders = (): HeadersInit => {
  if (!FOUNDRY_API_KEY) {
    return {
      'Content-Type': 'application/json',
    };
  }

  if (FOUNDRY_AUTH_SCHEME === 'bearer') {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${FOUNDRY_API_KEY}`,
    };
  }

  return {
    'Content-Type': 'application/json',
    'api-key': FOUNDRY_API_KEY,
  };
};

const parseResponseContent = (responseJson: unknown): string => {
  if (
    typeof responseJson !== 'object' ||
    responseJson === null ||
    !('choices' in responseJson) ||
    !Array.isArray(responseJson.choices)
  ) {
    return '';
  }

  const firstChoice = responseJson.choices[0] as { message?: { content?: unknown } } | undefined;
  const rawContent = firstChoice?.message?.content;

  if (typeof rawContent === 'string') {
    return rawContent;
  }

  if (Array.isArray(rawContent)) {
    const contentPart = rawContent.find(
      (part): part is { type?: string; text?: string } =>
        typeof part === 'object' && part !== null && 'text' in part
    );

    if (contentPart?.text) {
      return contentPart.text;
    }
  }

  return '';
};

const callFoundryForJson = async <T>(
  messages: FoundryMessage[],
  schema: z.ZodType<T>,
  maxTokens = 800
): Promise<T | null> => {
  if (!FOUNDRY_ENDPOINT) {
    return null;
  }

  const endpointUrl =
    FOUNDRY_API_VERSION && !FOUNDRY_ENDPOINT.includes('api-version=')
      ? `${FOUNDRY_ENDPOINT}${FOUNDRY_ENDPOINT.includes('?') ? '&' : '?'}api-version=${FOUNDRY_API_VERSION}`
      : FOUNDRY_ENDPOINT;

  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: getFoundryHeaders(),
    body: JSON.stringify({
      ...(FOUNDRY_MODEL ? { model: FOUNDRY_MODEL } : {}),
      messages,
      temperature: 0,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    return null;
  }

  const responseJson: unknown = await response.json();
  const textContent = parseResponseContent(responseJson);

  if (!textContent) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(textContent);
    const safeParsed = schema.safeParse(parsed);
    return safeParsed.success ? safeParsed.data : null;
  } catch {
    return null;
  }
};

const detectLanguage = async (text: string) => {
  const payload = {
    text,
    instruction:
      'Detect the language of the input text. If it is English, set isEnglish=true. Return only JSON.',
  };

  return callFoundryForJson(
    [
      {
        role: 'system',
        content:
          'You are a strict language detector. Return JSON only with keys: languageCode, isEnglish.',
      },
      {
        role: 'user',
        content: JSON.stringify(payload),
      },
    ],
    languageDetectionSchema,
    200
  );
};

const translateTexts = async (
  texts: string[],
  targetLanguage: string
): Promise<string[] | null> => {
  if (texts.length === 0) {
    return [];
  }

  const payload = {
    targetLanguage,
    texts,
    rules: [
      'Preserve meaning and intent.',
      'Do not add commentary.',
      'Keep recipe ingredient names precise.',
      'Return array length equal to input texts length.',
    ],
  };

  const translated = await callFoundryForJson(
    [
      {
        role: 'system',
        content:
          'You are a strict translation engine. Return JSON only with key translatedTexts (string array).',
      },
      {
        role: 'user',
        content: JSON.stringify(payload),
      },
    ],
    translationBatchSchema,
    1200
  );

  if (!translated || translated.translatedTexts.length !== texts.length) {
    return null;
  }

  return translated.translatedTexts;
};

export const resolveConversationLanguage = async ({
  conversationHistory,
  latestUserMessage,
}: ResolveConversationLanguageInput): Promise<ResolvedConversationLanguage> => {
  const fallbackResult: ResolvedConversationLanguage = {
    sourceLanguageCode: 'en',
    isEnglish: true,
    conversationHistoryForProcessing: conversationHistory,
    latestUserMessageForProcessing: latestUserMessage,
    localizeTextsForUser: async (texts) => texts,
  };

  if (!hasFoundryConfig()) {
    return fallbackResult;
  }

  try {
    const detectedLanguage = await detectLanguage(latestUserMessage);
    if (!detectedLanguage || detectedLanguage.isEnglish) {
      return fallbackResult;
    }

    const userHistoryIndexes: number[] = [];
    const userHistoryTexts: string[] = [];

    conversationHistory.forEach((message, index) => {
      if (message.role !== 'user') {
        return;
      }

      userHistoryIndexes.push(index);
      userHistoryTexts.push(message.content);
    });

    const translatedUserHistory = await translateTexts(userHistoryTexts, 'English');
    const translatedLatestBatch = await translateTexts([latestUserMessage], 'English');
    const translatedLatestUserMessage = translatedLatestBatch?.[0];

    if (!translatedLatestUserMessage) {
      return fallbackResult;
    }

    const translatedHistory = [...conversationHistory];

    if (translatedUserHistory) {
      userHistoryIndexes.forEach((historyIndex, translationIndex) => {
        const translatedMessage = translatedUserHistory[translationIndex];
        if (!translatedMessage) {
          return;
        }

        translatedHistory[historyIndex] = {
          ...translatedHistory[historyIndex],
          content: translatedMessage,
        };
      });
    }

    return {
      sourceLanguageCode: detectedLanguage.languageCode.toLowerCase(),
      isEnglish: false,
      conversationHistoryForProcessing: translatedHistory,
      latestUserMessageForProcessing: translatedLatestUserMessage,
      localizeTextsForUser: async (texts) => {
        const translated = await translateTexts(texts, detectedLanguage.languageCode);
        return translated ?? texts;
      },
    };
  } catch {
    return fallbackResult;
  }
};
