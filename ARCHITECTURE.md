# 🏗️ Architecture Overview

This document explains how the AI Mental Health Chatbot works under the hood.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Chat Interface Component                     │  │
│  │  (components/chat-interface.tsx)                         │  │
│  │                                                          │  │
│  │  • Renders messages                                      │  │
│  │  • Handles user input                                    │  │
│  │  • Manages UI state                                      │  │
│  │  • Shows crisis alerts                                   │  │
│  │                                                          │  │
│  └────────────┬─────────────────────────────────┬───────────┘  │
│               │                                 │               │
│               │ API Call                        │ LocalStorage  │
│               │ (POST /api/chat)                │               │
│               ▼                                 ▼               │
│  ┌────────────────────────┐      ┌─────────────────────────┐  │
│  │   Conversation State   │◄────►│   Browser localStorage   │  │
│  │                        │      │                          │  │
│  │  • messages[]          │      │  • Persisted messages    │  │
│  │  • isLoading           │      │  • Session ID            │  │
│  │  • crisis info         │      │                          │  │
│  └────────────────────────┘      └─────────────────────────┘  │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS Request
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      NEXT.JS SERVER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             API Route (/api/chat/route.ts)               │  │
│  │                                                          │  │
│  │  1. Receives user message                               │  │
│  │  2. Gets/creates MemoryManager for session              │  │
│  │  3. Checks for crisis language                          │  │
│  │  4. Triggers summarization if needed                    │  │
│  │  5. Calls DeepSeek API                                  │  │
│  │  6. Returns response                                    │  │
│  └─────┬────────────────────────────────────────────┬───────┘  │
│        │                                            │           │
│        │ Uses                                       │ Uses      │
│        │                                            │           │
│  ┌─────▼─────────────────┐             ┌───────────▼────────┐  │
│  │   Memory Manager      │             │  DeepSeek Client   │  │
│  │  (lib/memory.ts)      │             │  (lib/deepseek.ts) │  │
│  │                       │             │                    │  │
│  │  • Store messages     │             │  • API calls       │  │
│  │  • Detect overflow    │             │  • Crisis detect   │  │
│  │  • Summarize old msgs │             │  • Streaming       │  │
│  │  • System prompt      │             │  • Summarization   │  │
│  └───────────────────────┘             └──────────┬─────────┘  │
│                                                    │            │
│  ┌──────────────────────────────────────────┐     │            │
│  │   Session Memory Storage                 │     │            │
│  │   (In-memory Map)                        │     │            │
│  │                                          │     │            │
│  │   sessionId → MemoryManager              │     │            │
│  │                                          │     │            │
│  │   • Temporary per session                │     │            │
│  │   • Production: Use Redis/Database       │     │            │
│  └──────────────────────────────────────────┘     │            │
│                                                    │            │
└────────────────────────────────────────────────────┼────────────┘
                                                     │
                                                     │ HTTPS
                                                     │
                                        ┌────────────▼───────────┐
                                        │   DeepSeek API         │
                                        │   api.deepseek.com     │
                                        │                        │
                                        │  • Process prompts     │
                                        │  • Generate responses  │
                                        │  • Return completions  │
                                        └────────────────────────┘
```

## Component Breakdown

### 1. Frontend Layer

#### Chat Interface (`components/chat-interface.tsx`)
**Responsibilities:**
- Render chat messages
- Handle user input
- Display crisis alerts
- Manage local state
- Persist to localStorage
- Auto-scroll behavior

**State Management:**
```typescript
- messages: Message[]           // Chat history
- input: string                 // Current input
- isLoading: boolean           // API call in progress
- sessionId: string            // Unique session identifier
- crisis: CrisisInfo           // Crisis detection state
```

**Key Functions:**
- `handleSend()`: Send message to API
- `handleClearChat()`: Clear conversation
- `formatTime()`: Format timestamps
- Auto-save to localStorage

#### UI Components (`components/ui/`)
Built with shadcn/ui:
- `Button`: Action buttons
- `Card`: Container components
- `Input`: Text input field
- `Alert`: Crisis resource alerts
- `ScrollArea`: Scrollable message area

### 2. Backend Layer

#### API Route (`app/api/chat/route.ts`)

**Request Flow:**
```
1. Receive POST request with { message, sessionId }
2. Validate input
3. Get or create MemoryManager for session
4. Run crisis language detection
5. Add user message to memory
6. Check if summarization needed
   ├─ If yes: Summarize old messages
   └─ If no: Continue
7. Get messages formatted for API
8. Call DeepSeek API
9. Add response to memory
10. Return JSON response
```

**Endpoints:**
- `POST /api/chat`: Send message, get response
- `DELETE /api/chat?sessionId=X`: Clear session memory

**Response Format:**
```typescript
{
  message: string,           // AI response
  sessionId: string,         // Session identifier
  crisisDetected: boolean,   // Crisis flag
  crisisSeverity: string     // Severity level
}
```

### 3. Core Libraries

#### Memory Manager (`lib/memory.ts`)

**Purpose**: Manage conversation history and prevent context overflow

**Data Structure:**
```typescript
ConversationMemory {
  recentMessages: Message[],    // Last N messages
  summaries: string[],          // Older conversation summaries
  sessionStart: number          // Session timestamp
}
```

**Key Methods:**
- `addMessage()`: Add new message to memory
- `shouldSummarize()`: Check if summarization needed
- `getMessagesToSummarize()`: Get messages to compress
- `storeSummary()`: Save summary, remove old messages
- `getMessagesForAPI()`: Format messages for API call
- `getSystemPrompt()`: Generate system prompt

**Memory Flow:**
```
Message 1  ─┐
Message 2  ─┤
Message 3  ─┤
Message 4  ─┼─► Keep in full context (recent)
Message 5  ─┤
Message 6  ─┤
Message 7  ─┤
Message 8  ─┘
             
Threshold reached (8 messages)
             ↓
             
Summarize messages 1-4
             ↓
             
Summary 1  ─┐
Message 5  ─┤
Message 6  ─┼─► New context window
Message 7  ─┤
Message 8  ─┘
```

#### DeepSeek Client (`lib/deepseek.ts`)

**Purpose**: Interface with DeepSeek API

**Key Methods:**

1. **`createChatCompletion()`**
   - Sends messages to DeepSeek
   - Returns AI response
   - Handles errors

2. **`createStreamingChatCompletion()`**
   - Enables streaming responses
   - Returns ReadableStream
   - For future real-time typing effect

3. **`summarizeConversation()`**
   - Generates conversation summary
   - Uses lower temperature for consistency
   - Preserves emotional context

4. **`detectCrisisLanguage()`**
   - Scans for crisis keywords
   - Assesses severity
   - Returns crisis info

**API Call Structure:**
```typescript
POST https://api.deepseek.com/v1/chat/completions
Headers: {
  Authorization: Bearer <API_KEY>
  Content-Type: application/json
}
Body: {
  model: "deepseek-chat",
  messages: [...],
  temperature: 0.8,
  max_tokens: 1000
}
```

#### Configuration (`lib/config.ts`)

**Purpose**: Centralized configuration management

**Modules:**
- `MemoryConfig`: Memory thresholds
- `AIConfig`: Model parameters
- `CrisisConfig`: Crisis detection
- `UIConfig`: UI text/behavior
- `FeatureFlags`: Toggle features
- `SystemPromptConfig`: AI instructions

## Data Flow Diagrams

### Normal Message Flow

```
User types message
       ↓
Component: Add to local state
       ↓
Component: Display user message
       ↓
Component: Set isLoading = true
       ↓
API: POST /api/chat { message, sessionId }
       ↓
API: Get MemoryManager for session
       ↓
API: Check crisis keywords
       ↓
API: Add message to memory
       ↓
Memory: Check if should summarize
       ├─ Yes → Summarize old messages
       └─ No → Continue
       ↓
Memory: Get messages for API (system + summaries + recent)
       ↓
DeepSeek Client: Call API with messages
       ↓
DeepSeek API: Generate response
       ↓
DeepSeek Client: Return response
       ↓
API: Add response to memory
       ↓
API: Return { message, crisisDetected, ... }
       ↓
Component: Add assistant message to state
       ↓
Component: Update crisis state if needed
       ↓
Component: Set isLoading = false
       ↓
Component: Save to localStorage
       ↓
Component: Display response
```

### Summarization Flow

```
Messages exceed threshold (8)
       ↓
Memory: shouldSummarize() returns true
       ↓
Memory: getMessagesToSummarize()
       ├─ Get messages 1-4 (first half)
       └─ Keep messages 5-8 (recent half)
       ↓
Memory: Generate summary prompt
       ↓
DeepSeek Client: summarizeConversation()
       ├─ Send messages to API
       ├─ Use lower temperature (0.3)
       └─ Request concise summary
       ↓
DeepSeek API: Return summary text
       ↓
Memory: storeSummary()
       ├─ Add summary to summaries[]
       ├─ Remove summarized messages
       └─ Keep only last 4 messages
       ↓
Memory: getMessagesForAPI() now returns:
       ├─ System prompt
       ├─ Summary of messages 1-4
       └─ Messages 5-8 in full
```

### Crisis Detection Flow

```
User sends message with concerning content
       ↓
DeepSeek Client: detectCrisisLanguage()
       ↓
Check message for crisis keywords
       ├─ "suicide" → Found
       ├─ "kill myself" → Found
       └─ "end my life" → Found
       ↓
Count keywords found (3)
       ↓
Assess severity:
       ├─ 1 keyword → Low
       ├─ 2 keywords → Moderate
       └─ 3+ keywords → High
       ↓
Return { isCrisis: true, severity: "high", concerns: [...] }
       ↓
API: Add crisis system message to prompt
       ↓
DeepSeek: Generate extra-careful response
       ↓
API: Return response with crisisDetected: true
       ↓
Component: Display crisis alert
       ├─ Show resources (988, text lines)
       └─ Display response with care
```

### Persistence Flow

```
User sends/receives message
       ↓
Component: messages state updates
       ↓
useEffect triggers (dependency: messages)
       ↓
Check: typeof window !== 'undefined'
       ↓
localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
       ↓
Data persisted to browser
       ↓
User closes/refreshes page
       ↓
Component mounts
       ↓
useEffect triggers (on mount)
       ↓
localStorage.getItem(STORAGE_KEY)
       ↓
Parse JSON to messages array
       ↓
setMessages(parsed)
       ↓
Conversation restored!
```

## Security Considerations

### API Key Protection
```
✅ Stored in .env.local (not committed)
✅ Accessed only on server-side
✅ Never exposed to client
✅ Used via environment variables
```

### Data Privacy
```
✅ No external analytics
✅ localStorage only (user's device)
✅ Server memory temporary (session-based)
✅ No persistent database by default
✅ User can clear data anytime
```

### Input Validation
```
✅ Message length checks
✅ Type validation
✅ Error handling for malformed requests
✅ Session ID validation
```

## Performance Optimization

### Memory Management
- Only recent messages sent to API
- Summaries compress history
- Prevents token limit errors
- Reduces API costs

### UI Optimization
- Auto-scroll with ref
- Loading states
- Optimistic UI updates
- Debouncing possible for future

### Caching Strategy (Future)
```
Consider:
- Cache summaries
- Reuse common responses
- Implement service worker
- Add request deduplication
```

## Scalability Considerations

### Current Architecture
- ✅ Good for development
- ✅ Good for small-medium traffic
- ⚠️ Session memory in-memory (not scalable)

### Production Improvements

**For High Traffic:**
1. **Replace in-memory storage with Redis**
```typescript
// Instead of Map
const sessionMemories = new Map();

// Use Redis
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
```

2. **Add Database for Persistence**
```typescript
// PostgreSQL, MongoDB, etc.
- Store conversations
- Store user data
- Store summaries
```

3. **Implement Rate Limiting**
```typescript
// Prevent abuse
- Per IP
- Per session
- Per user (if auth)
```

4. **Add Caching Layer**
```typescript
// Cache responses
- Common questions
- Summaries
- System prompts
```

5. **Load Balancing**
```
- Multiple server instances
- Distribute traffic
- Session affinity
```

## Error Handling

### Frontend
```typescript
try {
  // API call
} catch (error) {
  // Show user-friendly error
  // Add error message to chat
  // Log to console
  // Don't crash app
}
```

### Backend
```typescript
try {
  // Process request
} catch (error) {
  // Log error details
  // Return appropriate status code
  // Send helpful error message
  // Continue serving other requests
}
```

## Testing Strategy

### Unit Tests (Recommended)
- Memory management functions
- Crisis detection logic
- API client methods
- Utility functions

### Integration Tests (Recommended)
- API routes
- End-to-end message flow
- Summarization workflow
- localStorage persistence

### Manual Tests (Current)
- See QUICKSTART.md for test scenarios
- Verify crisis detection
- Test long conversations
- Check persistence

## Monitoring & Logging

### Development
- Console.log for debugging
- React DevTools for state
- Network tab for API calls

### Production (Recommended)
- Error tracking (Sentry)
- Performance monitoring
- API usage metrics
- User analytics (privacy-conscious)

## Deployment Architecture

### Vercel (Recommended)
```
Code → GitHub → Vercel
           ↓
    Environment Variables
           ↓
    Build & Deploy
           ↓
    Edge Network
           ↓
    Users worldwide
```

### Traditional Server
```
Code → Build → Upload → Server
                          ↓
                    Nginx/Apache
                          ↓
                    Node.js process
                          ↓
                        Users
```

## Future Architecture Improvements

### 1. Microservices (If scaling)
```
API Gateway
    ├─ Chat Service
    ├─ Memory Service
    ├─ Crisis Detection Service
    └─ Analytics Service
```

### 2. Message Queue (For async)
```
User → API → Queue → Worker → DeepSeek API
                 ↓
           Response Queue
                 ↓
           API → User
```

### 3. Multi-tenant (For SaaS)
```
User A ─┐
User B ─┼─ Load Balancer ─┐
User C ─┘                  ├─ Instance 1
                          ├─ Instance 2
                          └─ Instance N
                               ↓
                          Shared Redis
                               ↓
                          Shared Database
```

## Technology Choices Explained

### Why Next.js?
- ✅ Server + client in one project
- ✅ API routes included
- ✅ Great developer experience
- ✅ Easy deployment
- ✅ Good performance

### Why DeepSeek?
- ✅ OpenAI-compatible API
- ✅ Good quality responses
- ✅ Reasonable pricing
- ✅ Supports streaming
- ✅ Active development

### Why localStorage?
- ✅ Simple to implement
- ✅ No backend needed
- ✅ Works offline
- ✅ User has control
- ⚠️ Limited to browser

### Why shadcn/ui?
- ✅ Beautiful components
- ✅ Highly customizable
- ✅ Copy/paste approach
- ✅ TypeScript support
- ✅ Accessible by default

## Summary

This architecture is:
- ✅ **Simple**: Easy to understand and modify
- ✅ **Scalable**: Can grow with your needs
- ✅ **Maintainable**: Well-organized code
- ✅ **Secure**: Protects sensitive data
- ✅ **Performant**: Fast responses
- ✅ **User-friendly**: Great UX

For questions or clarifications, see the other documentation files or review the code with the explanatory comments.

---

**Remember**: Good architecture serves the users. Keep it simple unless complexity is justified!

