import { type AiProviderResponse } from '../../domain/ai/aiProviderResponseSchema';
import type { SupportedLanguage } from '../../domain/ai/conversationLanguage';

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export interface AiProviderConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Calls OpenAI's chat completion API with a language-aware prompt.
 * Returns raw JSON text from the model.
 */
export async function callAiProvider(prompt: string, config: AiProviderConfig): Promise<string> {
  const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Set OPENAI_API_KEY environment variable.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful recipe assistant. Return ONLY valid JSON. No markdown, no explanation.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${response.status} ${JSON.stringify(errorData)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const message = data?.choices?.[0]?.message?.content;

  if (typeof message !== 'string') {
    throw new Error('Unexpected response format from OpenAI API');
  }

  return message;
}
