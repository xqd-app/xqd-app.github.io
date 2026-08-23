export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export type AIProvider = 'openai' | 'claude' | 'gemini' | 'ollama';

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI GPT',
    defaultModel: 'gpt-3.5-turbo',
    requiresApiKey: true,
    description: 'GPT-3.5 or GPT-4',
  },
  claude: {
    name: 'Claude',
    defaultModel: 'claude-3-haiku-20240307',
    requiresApiKey: true,
    description: 'Claude 3 Haiku or Sonnet',
  },
  gemini: {
    name: 'Google Gemini',
    defaultModel: 'gemini-pro',
    requiresApiKey: true,
    description: 'Gemini Pro',
  },
  ollama: {
    name: 'Ollama (Local)',
    defaultModel: 'llama2',
    requiresApiKey: false,
    description: 'Free local AI models',
  },
};

export const DEFAULT_SYSTEM_PROMPT = `You are a friendly digital pet companion. Keep responses short, playful, and engaging. Use casual language and show personality. Keep responses under 2 sentences when possible.`;

export async function sendAIMessage(
  messages: AIMessage[],
  config: AIConfig
): Promise<string> {
  const { provider, apiKey, baseUrl, model } = config;
  
  const systemMessage = messages.find(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');

  try {
    switch (provider) {
      case 'openai':
        return await sendToOpenAI(conversationMessages, apiKey!, baseUrl, model || 'gpt-3.5-turbo', systemMessage?.content);
      case 'claude':
        return await sendToClaude(conversationMessages, apiKey!, model || 'claude-3-haiku-20240307', systemMessage?.content);
      case 'gemini':
        return await sendToGemini(conversationMessages, apiKey!, model || 'gemini-pro', systemMessage?.content);
      case 'ollama':
        return await sendToOllama(conversationMessages, baseUrl || 'http://localhost:11434', model || 'llama2', systemMessage?.content);
      default:
        throw new Error('Unsupported AI provider');
    }
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
}

async function sendToOpenAI(
  messages: AIMessage[],
  apiKey: string,
  baseUrl?: string,
  model?: string,
  systemPrompt?: string
): Promise<string> {
  const url = baseUrl ? `${baseUrl}/v1/chat/completions` : 'https://api.openai.com/v1/chat/completions';
  
  const formattedMessages = systemPrompt 
    ? [{ role: 'system', content: systemPrompt }, ...messages.map(m => ({ role: m.role, content: m.content }))]
    : messages.map(m => ({ role: m.role, content: m.content }));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-3.5-turbo',
      messages: formattedMessages,
      max_tokens: 500,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API Error');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'I am not sure how to respond.';
}

async function sendToClaude(
  messages: AIMessage[],
  apiKey: string,
  model?: string,
  systemPrompt?: string
): Promise<string> {
  const url = 'https://api.anthropic.com/v1/messages';
  
  const formattedMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: model || 'claude-3-haiku-20240307',
      messages: formattedMessages,
      max_tokens: 500,
      system: systemPrompt,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Claude API Error');
  }

  const data = await response.json();
  return data.content[0]?.text || 'I am not sure how to respond.';
}

async function sendToGemini(
  messages: AIMessage[],
  apiKey: string,
  model?: string,
  systemPrompt?: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-pro'}:generateContent?key=${apiKey}`;
  
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  interface GeminiRequestBody {
    contents: typeof contents;
    systemInstruction?: {
      parts: Array<{ text: string }>;
    };
  }

  const requestBody: GeminiRequestBody = { contents };
  if (systemPrompt) {
    requestBody.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API Error');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I am not sure how to respond.';
}

async function sendToOllama(
  messages: AIMessage[],
  baseUrl?: string,
  model?: string,
  systemPrompt?: string
): Promise<string> {
  const url = `${baseUrl || 'http://localhost:11434'}/api/chat`;
  
  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  if (systemPrompt) {
    formattedMessages.unshift({ role: 'system', content: systemPrompt });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'llama2',
      messages: formattedMessages,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error('Ollama API Error');
  }

  const data = await response.json();
  return data.message?.content || 'I am not sure how to respond.';
}
