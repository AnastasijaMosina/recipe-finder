export interface AiProviderConfig {
  apiKey: string;
  endpoint?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function callAiProvider(prompt: string, config: AiProviderConfig): Promise<string> {
  const apiKey =
    config.apiKey || process.env.AZURE_AI_FOUNDRY_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'AI API key is not configured. Set AZURE_AI_FOUNDRY_API_KEY or OPENAI_API_KEY.'
    );
  }

  const endpoint = config.endpoint || process.env.AZURE_AI_FOUNDRY_ENDPOINT;
  const isAzure = Boolean(endpoint);

  let url: string;
  if (isAzure) {
    // Detect format: GPT-4o-mini uses /deployments/, Phi-4 uses /v1/
    if (endpoint.includes('/deployments/')) {
      // GPT-4o-mini format with api-version
      url = `${endpoint}/chat/completions?api-version=2024-12-01-preview`;
    } else {
      // Phi-4 format: endpoint already has /openai/v1, just append /chat/completions
      url = `${endpoint}/chat/completions`;
    }
  } else {
    url = 'https://api.openai.com/v1/chat/completions';
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(isAzure ? { 'api-key': apiKey } : { Authorization: `Bearer ${apiKey}` }),
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model:
        config.model ||
        process.env.AZURE_AI_FOUNDRY_MODEL ||
        process.env.OPENAI_MODEL ||
        'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful recipe assistant. Return ONLY valid JSON. No markdown, no explanation.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`AI provider error: ${response.status} ${JSON.stringify(errorData)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const message = data?.choices?.[0]?.message?.content;
  if (typeof message !== 'string') {
    throw new Error('Unexpected response format from AI provider');
  }

  return message;
}
