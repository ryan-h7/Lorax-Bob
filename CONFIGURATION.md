# ⚙️ Configuration Guide

The AI Mental Health Chatbot is designed to be easily customizable. This guide explains how to configure various aspects of the application.

## Quick Configuration

Most configuration is centralized in `lib/config.ts`. Edit this file to customize behavior without touching core application code.

## Configuration Sections

### 1. Memory Management (`MemoryConfig`)

Controls how conversation history is managed and summarized.

```typescript
MAX_RECENT_MESSAGES: 10        // Keep last 10 messages in full
SUMMARIZE_THRESHOLD: 8         // Summarize after 8 messages
MAX_SUMMARIES: 3               // Keep up to 3 summaries
MESSAGES_TO_KEEP_ON_SUMMARIZE: 4  // Keep 4 recent when summarizing
```

**When to adjust:**
- **Longer context needed?** Increase `MAX_RECENT_MESSAGES` and `SUMMARIZE_THRESHOLD`
- **Running into token limits?** Decrease these values
- **Want more summarization?** Decrease `SUMMARIZE_THRESHOLD`

### 2. AI Model Settings (`AIConfig`)

Controls the AI's response generation parameters.

```typescript
CHAT_TEMPERATURE: 0.8      // Creativity level (0.0-1.0)
MAX_TOKENS: 1000           // Maximum response length
SUMMARY_TEMPERATURE: 0.3   // Summarization creativity
SUMMARY_MAX_TOKENS: 500    // Maximum summary length
```

**Temperature guide:**
- **0.0-0.3**: Very focused, consistent, deterministic
- **0.4-0.6**: Balanced creativity and consistency
- **0.7-0.9**: Creative, varied, more natural
- **1.0+**: Highly creative, potentially unpredictable

**Recommendations:**
- For therapy/support: `0.7-0.8` (current default)
- For information: `0.3-0.5`
- For creative responses: `0.9-1.0`

### 3. Crisis Detection (`CrisisConfig`)

Customize crisis keyword detection and severity thresholds.

```typescript
CRISIS_KEYWORDS: [
  'suicide',
  'kill myself',
  // ... add more
]

SEVERITY_THRESHOLDS: {
  LOW: 1,       // 1 keyword = low
  MODERATE: 2,  // 2 keywords = moderate
  HIGH: 3,      // 3+ keywords = high
}
```

**How to customize:**

1. **Add region-specific terms:**
```typescript
CRISIS_KEYWORDS: [
  ...existing keywords,
  'regional phrase 1',
  'regional phrase 2',
]
```

2. **Adjust sensitivity:**
```typescript
SEVERITY_THRESHOLDS: {
  LOW: 1,
  MODERATE: 3,  // Require more keywords for moderate
  HIGH: 5,      // Require more for high
}
```

### 4. UI Configuration (`UIConfig`)

Customize the user interface text and behavior.

```typescript
APP_TITLE: 'Supportive Listener'
APP_DESCRIPTION: 'A safe space...'
WELCOME_MESSAGE: 'Welcome! I\'m here to listen.'
// ... more options
```

**Easy customizations:**

**Brand it:**
```typescript
APP_TITLE: 'MindfulChat'
APP_DESCRIPTION: 'Your personal support companion'
```

**Different tone:**
```typescript
WELCOME_MESSAGE: 'Hey there! What\'s on your mind?'
INPUT_PLACEHOLDER: 'Type anything...'
```

### 5. Crisis Resources (`CrisisResources`)

Configure region-specific crisis helplines.

```typescript
RESOURCES: [
  {
    region: 'US',
    name: '988 Suicide & Crisis Lifeline',
    contact: 'Call or text 988',
  },
  // Add more regions
]
```

**Adding regions:**

```typescript
RESOURCES: [
  // ... existing resources
  {
    region: 'UK',
    name: 'Samaritans',
    contact: 'Call 116 123',
    url: 'https://www.samaritans.org',
  },
  {
    region: 'Canada',
    name: 'Crisis Services Canada',
    contact: 'Call 1-833-456-4566',
    url: 'https://www.crisisservicescanada.ca',
  },
]
```

### 6. Storage Configuration (`StorageConfig`)

Control local data persistence.

```typescript
CONVERSATION_KEY: 'ai-therapist-conversation'
SESSION_KEY: 'ai-therapist-session-id'
ENABLE_PERSISTENCE: true
```

**Disable persistence:**
```typescript
ENABLE_PERSISTENCE: false
```

### 7. Feature Flags (`FeatureFlags`)

Enable/disable features easily.

```typescript
ENABLE_CRISIS_DETECTION: true
ENABLE_PERSISTENCE: true
ENABLE_AUTO_SUMMARIZATION: true
SHOW_TIMESTAMPS: true
ENABLE_CLEAR_CHAT: true
```

**Quick toggles:**
- Turn off crisis detection: `ENABLE_CRISIS_DETECTION: false`
- Hide timestamps: `SHOW_TIMESTAMPS: false`
- Remove clear button: `ENABLE_CLEAR_CHAT: false`

### 8. System Prompt (`SystemPromptConfig`)

Customize the AI's core instructions and personality.

```typescript
ROLE: 'You are a compassionate listener...'
PRINCIPLES: [
  'Principle 1',
  'Principle 2',
]
```

**Customization examples:**

**Formal tone:**
```typescript
ROLE: 'You are a professional support assistant...'
STYLE_GUIDELINES: [
  'Maintain a professional demeanor',
  'Use structured responses',
  'Be respectful and formal',
]
```

**Casual tone:**
```typescript
ROLE: 'You\'re a friendly, supportive companion...'
STYLE_GUIDELINES: [
  'Keep it casual and friendly',
  'Use everyday language',
  'Be warm and approachable',
]
```

**Specific focus:**
```typescript
ROLE: 'You are a supportive listener specializing in work-related stress and anxiety...'
PRINCIPLES: [
  'Focus on work-life balance topics',
  'Understand career-related pressures',
  // ... more specific guidelines
]
```

## Environment Variables

Set in `.env.local`:

```env
# Required
DEEPSEEK_API_KEY=sk-your-key-here

# Optional
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

### Available Models

DeepSeek offers different models:
- `deepseek-chat` - Standard chat model (recommended)
- `deepseek-coder` - Code-focused (not recommended for therapy)

## Advanced Customization

### Modify the System Prompt (Beyond Config)

For complete control over the system prompt, edit `lib/memory.ts`:

```typescript
private getSystemPrompt(): string {
  return `Your completely custom system prompt here...`;
}
```

### Custom Memory Logic

To change how memory is managed, edit `lib/memory.ts`:

```typescript
shouldSummarize(): boolean {
  // Add custom logic
  return this.memory.recentMessages.length > 15 
    || this.calculateTokens() > 2000;
}
```

### Enhanced Crisis Detection

For more sophisticated detection, modify `lib/deepseek.ts`:

```typescript
async detectCrisisLanguage(userMessage: string) {
  // Add ML-based detection
  // Add sentiment analysis
  // Add pattern matching
}
```

## Example Configurations

### 1. Quick Support Bot (Short Context)

```typescript
// lib/config.ts
Memory: {
  MAX_RECENT_MESSAGES: 6,
  SUMMARIZE_THRESHOLD: 5,
},
AI: {
  CHAT_TEMPERATURE: 0.9,
  MAX_TOKENS: 500,
},
```

### 2. Deep Conversation Bot (Long Context)

```typescript
// lib/config.ts
Memory: {
  MAX_RECENT_MESSAGES: 20,
  SUMMARIZE_THRESHOLD: 15,
  MAX_SUMMARIES: 5,
},
AI: {
  MAX_TOKENS: 2000,
},
```

### 3. Crisis-Focused Bot

```typescript
// lib/config.ts
Features: {
  ENABLE_CRISIS_DETECTION: true,
  SHOW_CRISIS_RESOURCES_ON_WELCOME: true,
},
Crisis: {
  SEVERITY_THRESHOLDS: {
    LOW: 1,
    MODERATE: 1,  // Treat everything as moderate+
    HIGH: 2,
  },
},
```

### 4. Minimal Bot (No Persistence, Simple)

```typescript
// lib/config.ts
Features: {
  ENABLE_PERSISTENCE: false,
  ENABLE_AUTO_SUMMARIZATION: false,
  SHOW_TIMESTAMPS: false,
  ENABLE_CLEAR_CHAT: false,
},
Memory: {
  MAX_RECENT_MESSAGES: 5,
},
```

## Testing Your Configuration

After making changes:

1. **Restart the dev server:**
```bash
npm run dev
```

2. **Test specific scenarios:**
- Send 10+ messages to test summarization
- Try crisis keywords to test detection
- Refresh page to test persistence
- Check browser console for logs

3. **Build and verify:**
```bash
npm run build
```

## Configuration Best Practices

### 1. Start Conservative
- Use default values first
- Make small incremental changes
- Test thoroughly after each change

### 2. Monitor Performance
- Higher `MAX_RECENT_MESSAGES` = more tokens = slower/costlier
- Higher `CHAT_TEMPERATURE` = more varied but less predictable
- More crisis keywords = more false positives

### 3. Balance Context vs Cost
```
More context = Better continuity BUT Higher API costs
Less context = Lower costs BUT May lose context
```

### 4. Test Edge Cases
- Very long messages
- Rapid-fire messages
- Crisis language
- Conversation persistence
- Memory summarization

### 5. Document Your Changes
Keep notes on why you changed settings for future reference.

## Troubleshooting

### Issue: AI responses are too random
**Solution:** Lower `CHAT_TEMPERATURE` (try 0.5-0.6)

### Issue: AI responses are too robotic
**Solution:** Increase `CHAT_TEMPERATURE` (try 0.8-0.9)

### Issue: Context gets lost too quickly
**Solution:** Increase `MAX_RECENT_MESSAGES` and `SUMMARIZE_THRESHOLD`

### Issue: Too many false crisis alerts
**Solution:** Remove overly broad keywords or increase severity thresholds

### Issue: Messages are too short
**Solution:** Increase `MAX_TOKENS` (try 1500-2000)

### Issue: Responses are too slow
**Solution:** Decrease `MAX_TOKENS` (try 500-700)

## Production Considerations

### Security
- Never commit `.env.local` to version control
- Use environment variables in production
- Rotate API keys regularly

### Performance
- Monitor API usage and costs
- Implement rate limiting
- Consider caching for summaries

### Monitoring
- Log API errors
- Track crisis detection frequency
- Monitor conversation lengths

### Compliance
- Review crisis resources for accuracy
- Ensure disclaimers are prominent
- Consider legal requirements for your region

---

**Questions or issues?** Check the main README.md or SETUP_GUIDE.md for more information.

