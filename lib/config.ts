/**
 * Application Configuration
 * 
 * Centralized configuration for the AI Mental Health Chatbot.
 * Modify these values to customize behavior without touching core code.
 */

/**
 * Memory Management Settings
 */
export const MemoryConfig = {
  // Maximum number of recent messages to keep in full context
  MAX_RECENT_MESSAGES: 10,
  
  // Trigger summarization when message count exceeds this threshold
  SUMMARIZE_THRESHOLD: 8,
  
  // Maximum number of summaries to retain
  MAX_SUMMARIES: 3,
  
  // Number of messages to keep when summarizing
  MESSAGES_TO_KEEP_ON_SUMMARIZE: 4,
};

/**
 * AI Model Settings
 */
export const AIConfig = {
  // Temperature for chat responses (0.0 - 1.0)
  // Higher = more creative, Lower = more focused
  CHAT_TEMPERATURE: 0.8,
  
  // Maximum tokens for chat responses
  MAX_TOKENS: 1000,
  
  // Temperature for summarization (0.0 - 1.0)
  SUMMARY_TEMPERATURE: 0.3,
  
  // Maximum tokens for summaries
  SUMMARY_MAX_TOKENS: 500,
};

/**
 * Crisis Detection Settings
 */
export const CrisisConfig = {
  // Keywords to detect crisis situations
  CRISIS_KEYWORDS: [
    'suicide',
    'kill myself',
    'end my life',
    'want to die',
    'self harm',
    'hurt myself',
    'no reason to live',
    'better off dead',
    "can't go on",
    'ending it all',
    'take my own life',
  ],
  
  // Number of keywords for different severity levels
  SEVERITY_THRESHOLDS: {
    LOW: 1,
    MODERATE: 2,
    HIGH: 3,
  },
};

/**
 * UI Configuration
 */
export const UIConfig = {
  // Application title
  APP_TITLE: 'Supportive Listener',
  
  // Application description
  APP_DESCRIPTION: 'A safe space to share what\'s on your mind',
  
  // Welcome message
  WELCOME_MESSAGE: 'Welcome! I\'m here to listen.',
  
  // Welcome subtitle
  WELCOME_SUBTITLE: 'Feel free to share whatever\'s on your mind. This is a judgment-free space where you can express your thoughts and feelings.',
  
  // Welcome disclaimer
  WELCOME_DISCLAIMER: 'Note: I\'m not a therapist or counselor - just a supportive listener.',
  
  // Input placeholder
  INPUT_PLACEHOLDER: 'Share what\'s on your mind...',
  
  // Auto-scroll delay (ms)
  SCROLL_DELAY: 100,
};

/**
 * Crisis Resources
 * Customize these for your region/audience
 */
export const CrisisResources = {
  // Title for crisis alert
  ALERT_TITLE: 'Support Resources Available',
  
  // Resources to display
  RESOURCES: [
    {
      region: 'US',
      name: '988 Suicide & Crisis Lifeline',
      contact: 'Call or text 988',
    },
    {
      region: 'US',
      name: 'Crisis Text Line',
      contact: 'Text HOME to 741741',
    },
    {
      region: 'International',
      name: 'Find A Helpline',
      contact: 'Visit findahelpline.com',
      url: 'https://findahelpline.com',
    },
  ],
  
  // Footer message
  FOOTER_MESSAGE: 'These services are confidential, free, and available 24/7.',
};

/**
 * Storage Configuration
 */
export const StorageConfig = {
  // LocalStorage keys
  CONVERSATION_KEY: 'ai-therapist-conversation',
  SESSION_KEY: 'ai-therapist-session-id',
  
  // Enable/disable persistence
  ENABLE_PERSISTENCE: true,
};

/**
 * API Configuration
 */
export const APIConfig = {
  // Chat endpoint
  CHAT_ENDPOINT: '/api/chat',
  
  // Request timeout (ms)
  REQUEST_TIMEOUT: 30000,
  
  // Retry attempts on failure
  MAX_RETRIES: 2,
};

/**
 * Feature Flags
 * Enable/disable features without code changes
 */
export const FeatureFlags = {
  // Enable crisis detection
  ENABLE_CRISIS_DETECTION: true,
  
  // Enable conversation persistence
  ENABLE_PERSISTENCE: true,
  
  // Enable auto-summarization
  ENABLE_AUTO_SUMMARIZATION: true,
  
  // Show timestamps on messages
  SHOW_TIMESTAMPS: true,
  
  // Enable clear chat button
  ENABLE_CLEAR_CHAT: true,
  
  // Show crisis resources in welcome screen
  SHOW_CRISIS_RESOURCES_ON_WELCOME: false,
};

/**
 * System Prompt Configuration
 * Customize the AI's core instructions
 */
export const SystemPromptConfig = {
  // Core role description
  ROLE: 'You are a compassionate, empathetic listener providing emotional support. Your role is to be "someone to talk to" for people who need to vent, process feelings, or work through difficult emotions.',
  
  // Key principles (will be formatted as bullet points)
  PRINCIPLES: [
    'You are NOT a therapist, counselor, or medical professional. Never present yourself as one.',
    'You provide emotional support through active listening and reflective dialogue.',
    'Be warm, non-judgmental, and validating of feelings.',
    'Use reflective listening: mirror emotions, validate experiences, ask open-ended questions.',
    'Encourage self-expression without offering direct advice or solutions unless specifically asked.',
  ],
  
  // Crisis response guidelines
  CRISIS_GUIDELINES: [
    'Acknowledge their pain: "I hear that you\'re going through something really difficult."',
    'Gently suggest professional help: "It sounds like talking to a counselor or therapist could be really helpful. Have you considered reaching out to a crisis line?"',
    'Provide perspective: "Many people have found that professional support makes a real difference."',
    'Never be directive or alarming. Stay calm and supportive.',
  ],
  
  // Conversational style guidelines
  STYLE_GUIDELINES: [
    'Be conversational and natural, not clinical',
    'Match the user\'s emotional tone when appropriate',
    'Ask thoughtful follow-up questions to help them explore their feelings',
    'Validate emotions without minimizing struggles',
    'Celebrate small wins and progress',
    'Remember and reference things from earlier in the conversation',
  ],
};

/**
 * Export all configs as a single object for easy import
 */
export const AppConfig = {
  Memory: MemoryConfig,
  AI: AIConfig,
  Crisis: CrisisConfig,
  UI: UIConfig,
  CrisisResources,
  Storage: StorageConfig,
  API: APIConfig,
  Features: FeatureFlags,
  SystemPrompt: SystemPromptConfig,
};

export default AppConfig;

