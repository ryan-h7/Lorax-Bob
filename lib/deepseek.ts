// DeepSeek API integration
import { Message } from './memory';

export interface DeepSeekConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * DeepSeek API client using OpenAI-compatible interface
 */
export class DeepSeekClient {
  private config: DeepSeekConfig;

  constructor(config: Partial<DeepSeekConfig> = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.DEEPSEEK_API_KEY || '',
      baseURL: config.baseURL || process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com/v1',
      model: config.model || 'deepseek-chat'
    };

    if (!this.config.apiKey) {
      throw new Error('DeepSeek API key is required');
    }
  }

  /**
   * Send a chat completion request to DeepSeek
   */
  async createChatCompletion(
    messages: Message[],
    options: {
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 2000,
        stream: options.stream ?? false
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Create a streaming chat completion
   */
  async createStreamingChatCompletion(
    messages: Message[],
    options: {
      temperature?: number;
      max_tokens?: number;
    } = {}
  ): Promise<ReadableStream> {
    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 2000,
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    return response.body;
  }

  /**
   * Generate a summary of conversation history
   */
  async summarizeConversation(messages: Message[], summaryPrompt: string): Promise<string> {
    const summaryMessages: Message[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant that creates concise, contextual summaries of conversations.'
      },
      {
        role: 'user',
        content: summaryPrompt
      }
    ];

    const response = await this.createChatCompletion(summaryMessages, {
      temperature: 0.3,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || 'Unable to generate summary';
  }

  /**
   * Detect crisis language and assess if additional support is needed
   */
  async detectCrisisLanguage(userMessage: string): Promise<{
    isCrisis: boolean;
    severity: 'none' | 'low' | 'moderate' | 'high';
    concerns: string[];
  }> {
    // Crisis keywords
    const crisisKeywords = [
      'suicide', 'kill myself', 'end my life', 'want to die',
      'self harm', 'hurt myself', 'no reason to live',
      'better off dead', 'can\'t go on'
    ];

    const messageLower = userMessage.toLowerCase();
    const foundKeywords = crisisKeywords.filter(keyword => 
      messageLower.includes(keyword)
    );

    if (foundKeywords.length === 0) {
      return {
        isCrisis: false,
        severity: 'none',
        concerns: []
      };
    }

    // Determine severity based on keywords found
    const severityLevel = foundKeywords.length >= 3 ? 'high' :
                         foundKeywords.length >= 2 ? 'moderate' : 'low';

    return {
      isCrisis: true,
      severity: severityLevel,
      concerns: foundKeywords
    };
  }
}

