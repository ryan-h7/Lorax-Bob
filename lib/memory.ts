// Memory management system for conversation continuity with summarization

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ConversationMemory {
  recentMessages: Message[];
  summaries: string[];
  sessionStart: number;
}

const MAX_RECENT_MESSAGES = 10; // Keep last 10 messages in full context
const SUMMARIZE_THRESHOLD = 8; // Summarize when we have more than this many messages

/**
 * Manages conversation memory with automatic summarization
 * to prevent context overflow while maintaining continuity
 */
export class MemoryManager {
  private memory: ConversationMemory;

  constructor() {
    this.memory = {
      recentMessages: [],
      summaries: [],
      sessionStart: Date.now()
    };
  }

  /**
   * Add a new message to memory
   */
  addMessage(role: 'user' | 'assistant', content: string) {
    this.memory.recentMessages.push({
      role,
      content,
      timestamp: Date.now()
    });
  }

  /**
   * Get messages formatted for API call
   * Returns system prompt + summaries + recent messages
   */
  getMessagesForAPI(journalContext?: string, tone?: string, avatar?: { name: string; personality: string }): Message[] {
    const messages: Message[] = [];

    // Add system prompt with memory context, journal context, tone, and avatar
    messages.push({
      role: 'system',
      content: this.getSystemPrompt(journalContext, tone, avatar)
    });

    // Add summary of older conversations if exists
    if (this.memory.summaries.length > 0) {
      messages.push({
        role: 'system',
        content: `Previous conversation summary:\n${this.memory.summaries.join('\n\n')}`
      });
    }

    // Add recent messages
    messages.push(...this.memory.recentMessages);

    return messages;
  }

  /**
   * Check if we need to summarize old messages
   */
  shouldSummarize(): boolean {
    return this.memory.recentMessages.length > SUMMARIZE_THRESHOLD;
  }

  /**
   * Prepare messages to be summarized (older messages that will be compressed)
   */
  getMessagesToSummarize(): Message[] {
    const toSummarize = this.memory.recentMessages.slice(0, -4); // Keep last 4 messages
    return toSummarize;
  }

  /**
   * Store a summary and remove old messages from active memory
   */
  storeSummary(summary: string) {
    // Keep only the last 4 messages
    const recentToKeep = this.memory.recentMessages.slice(-4);
    this.memory.recentMessages = recentToKeep;
    
    // Add new summary
    this.memory.summaries.push(summary);
    
    // Keep only last 3 summaries to prevent context overflow
    if (this.memory.summaries.length > 3) {
      this.memory.summaries = this.memory.summaries.slice(-3);
    }
  }

  /**
   * Get the system prompt with empathetic, supportive instructions
   */
  getSystemPrompt(journalContext?: string, tone?: string, avatar?: { name: string; personality: string }): string {
    // Avatar introduction
    let prompt = '';
    if (avatar) {
      prompt = `You are ${avatar.name}. ${avatar.personality}\n\n`;
    }
    
    // Tone-specific introductions
    const toneIntros = {
      'empathetic': 'You are a compassionate, deeply empathetic listener providing emotional support. You prioritize warmth, understanding, and emotional validation.',
      'humorous': 'You are a supportive listener with a light-hearted, humorous touch. While you take their feelings seriously, you use gentle humor to lighten the mood when appropriate. Be playful but never dismissive.',
      'blunt': 'You are a direct, honest listener who provides straightforward emotional support. You say things as they are without sugar-coating, but always remain respectful and supportive.',
      'therapist-like': 'You are a thoughtful, professional listener who uses therapeutic techniques. You ask probing questions, identify patterns, and help them develop insight into their emotions and behaviors.'
    };

    prompt += toneIntros[tone as keyof typeof toneIntros] || toneIntros['empathetic'];
    prompt += ' Your role is to be "someone to talk to" for people who need to vent, process feelings, or work through difficult emotions.';
    
    if (journalContext) {
      prompt += `\n\n${journalContext}\n\nUse this context to show continuity and remember past conversations. Reference previous topics naturally when relevant.`;
    }
    
    return prompt + `\n

Core principles:
- You are NOT a therapist, counselor, or medical professional. Never present yourself as one.
- You provide emotional support through active listening and reflective dialogue.
- Be warm, non-judgmental, and validating of feelings.
- Use reflective listening: mirror emotions, validate experiences, ask open-ended questions.
- Encourage self-expression without offering direct advice or solutions unless specifically asked.
- If someone is in crisis or mentions self-harm/suicide, respond with care:
  * Acknowledge their pain: "I hear that you're going through something really difficult."
  * Gently suggest professional help: "It sounds like talking to a counselor or therapist could be really helpful. Have you considered reaching out to a crisis line?"
  * Provide perspective: "Many people have found that professional support makes a real difference."
  * Never be directive or alarming. Stay calm and supportive.

Your conversational style:
- Be conversational and natural, not clinical
- Match the user's emotional tone when appropriate
- Ask thoughtful follow-up questions to help them explore their feelings
- Validate emotions without minimizing struggles
- Celebrate small wins and progress
- Remember and reference things from earlier in the conversation

Remember: You're here to listen, validate, and provide a safe space for expression. You're not here to diagnose, treat, or provide clinical interventions.`;
  }

  /**
   * Get the current memory state (for debugging or persistence)
   */
  getMemoryState(): ConversationMemory {
    return { ...this.memory };
  }

  /**
   * Load memory state (for session restoration)
   */
  loadMemoryState(state: ConversationMemory) {
    this.memory = state;
  }

  /**
   * Clear all memory
   */
  clearMemory() {
    this.memory = {
      recentMessages: [],
      summaries: [],
      sessionStart: Date.now()
    };
  }
}

/**
 * Create a prompt for summarizing conversation history
 */
export function createSummarizationPrompt(messages: Message[]): string {
  const conversation = messages
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  return `Please create a concise summary of this conversation segment, focusing on:
1. Key topics and concerns discussed
2. Important emotions and feelings expressed
3. Any significant progress or insights
4. Context needed for continuity

Keep the summary brief but preserve emotional context and important details.

Conversation:
${conversation}

Summary:`;
}

