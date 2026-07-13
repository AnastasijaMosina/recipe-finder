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

const translatorDetectResponseSchema = z.array(
  z.object({
    language: z.string().trim().min(2),
    score: z.number().optional(),
    isTranslationSupported: z.boolean().optional(),
  })
);

const translatorTranslateResponseSchema = z.array(
  z.object({
    translations: z.array(
      z.object({
        text: z.string(),
        to: z.string(),
      })
    ),
  })
);

const TRANSLATOR_ENDPOINT = process.env.AZURE_TRANSLATOR_ENDPOINT;
const TRANSLATOR_KEY = process.env.AZURE_TRANSLATOR_KEY;
const TRANSLATOR_REGION = process.env.AZURE_TRANSLATOR_REGION;

const hasTranslatorConfig = (): boolean => Boolean(TRANSLATOR_ENDPOINT && TRANSLATOR_KEY);

const getTranslatorHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': TRANSLATOR_KEY ?? '',
  };

  if (TRANSLATOR_REGION) {
    headers['Ocp-Apim-Subscription-Region'] = TRANSLATOR_REGION;
  }

  return headers;
};

const buildTranslatorUrl = (path: '/detect' | '/translate', query = ''): string => {
  const baseUrl = (TRANSLATOR_ENDPOINT ?? '').replace(/\/+$/, '');
  return `${baseUrl}${path}?api-version=3.0${query}`;
};

const detectLanguage = async (text: string) => {
  if (!TRANSLATOR_ENDPOINT || !TRANSLATOR_KEY) {
    return null;
  }

  const response = await fetch(buildTranslatorUrl('/detect'), {
    method: 'POST',
    headers: getTranslatorHeaders(),
    body: JSON.stringify([{ Text: text }]),
  });

  if (!response.ok) {
    return null;
  }

  const responseJson: unknown = await response.json();
  const parsed = translatorDetectResponseSchema.safeParse(responseJson);

  if (!parsed.success || parsed.data.length === 0) {
    return null;
  }

  return parsed.data[0];
};

const translateTexts = async (
  texts: string[],
  targetLanguage: string
): Promise<string[] | null> => {
  if (!TRANSLATOR_ENDPOINT || !TRANSLATOR_KEY) {
    return null;
  }

  if (texts.length === 0) {
    return [];
  }

  const response = await fetch(
    buildTranslatorUrl('/translate', `&to=${encodeURIComponent(targetLanguage)}`),
    {
      method: 'POST',
      headers: getTranslatorHeaders(),
      body: JSON.stringify(texts.map((text) => ({ Text: text }))),
    }
  );

  if (!response.ok) {
    return null;
  }

  const responseJson: unknown = await response.json();
  const parsed = translatorTranslateResponseSchema.safeParse(responseJson);

  if (!parsed.success || parsed.data.length !== texts.length) {
    return null;
  }

  const translatedTexts = parsed.data.map((entry) => entry.translations[0]?.text ?? '');

  return translatedTexts.every((text) => text.length > 0) ? translatedTexts : null;
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

  if (!hasTranslatorConfig()) {
    return fallbackResult;
  }

  try {
    const detectedLanguage = await detectLanguage(latestUserMessage);
    const sourceLanguageCode = detectedLanguage?.language.toLowerCase();

    if (!sourceLanguageCode || sourceLanguageCode === 'en') {
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

    const translatedUserHistory = await translateTexts(userHistoryTexts, 'en');
    const translatedLatestBatch = await translateTexts([latestUserMessage], 'en');
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
      sourceLanguageCode,
      isEnglish: false,
      conversationHistoryForProcessing: translatedHistory,
      latestUserMessageForProcessing: translatedLatestUserMessage,
      localizeTextsForUser: async (texts) => {
        const translated = await translateTexts(texts, sourceLanguageCode);
        return translated ?? texts;
      },
    };
  } catch {
    return fallbackResult;
  }
};
