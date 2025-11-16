# AI Therapist Webapp - Supportive Listener

An empathetic mental health AI chatbot built with Next.js, providing emotional support through reflective dialogue and long-term conversation continuity.

## Features

### 🤗 Empathetic Support
- Acts as a compassionate listener for venting and emotional support
- Uses reflective dialogue and active listening techniques
- Provides a non-judgmental space for self-expression

### 🧠 Smart Memory Management
- Automatic conversation summarization to prevent context overflow
- Maintains long-term continuity across sessions
- Stores summaries of older conversations while keeping recent messages in full context
- Prevents token limits from interrupting meaningful conversations
- **Persistent conversations** using localStorage - your conversation continues even after closing the browser

### 🚨 Crisis-Safe Design
- Detects concerning language patterns (self-harm, suicidal ideation)
- Responds with care and validation, never directive or alarming
- Gently suggests professional resources when appropriate
- Displays crisis hotline information when needed

### ⚕️ Non-Clinical Approach
- Never presents as a therapist or medical professional
- Clearly communicates its role as supportive listener only
- Encourages professional help for serious mental health concerns

### 🎨 Modern UI
- Built with Next.js 15, React 18, and TypeScript
- Styled with Tailwind CSS and shadcn/ui components
- Responsive design that works on all devices
- Clean, calming interface

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **AI Provider**: DeepSeek API (OpenAI-compatible)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- DeepSeek API key (get one at [https://platform.deepseek.com](https://platform.deepseek.com))

### Installation

1. Clone the repository or navigate to the project directory:

```bash
cd "AI therapist webapp"
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Add your DeepSeek API key to `.env`:

```env
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Memory Management

The app uses a sophisticated memory system to maintain conversation continuity without hitting context limits:

1. **Recent Messages**: Keeps the last 4-10 messages in full context
2. **Automatic Summarization**: When message count exceeds threshold, older messages are summarized
3. **Summary Storage**: Stores up to 3 conversation summaries for long-term context
4. **Seamless Continuity**: AI can reference earlier conversations through summaries

### Crisis Detection

The system monitors for concerning language patterns:

- Keyword detection for self-harm, suicidal ideation, etc.
- Severity assessment (low, moderate, high)
- Adaptive response that's caring but not alarmist
- Automatic display of crisis resources

### System Prompt

The AI is guided by a comprehensive system prompt that ensures:

- Warm, empathetic, non-judgmental responses
- Reflective listening and validation
- Open-ended questions to encourage exploration
- Clear boundaries (not a therapist)
- Appropriate crisis response protocols

## Project Structure

```
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── components/
│   ├── ui/                        # shadcn/ui components
│   └── chat-interface.tsx         # Main chat interface
├── lib/
│   ├── deepseek.ts               # DeepSeek API client
│   ├── memory.ts                 # Memory management system
│   └── utils.ts                  # Utility functions
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## API Routes

### POST /api/chat

Send a message and receive a response.

**Request:**
```json
{
  "message": "I'm feeling really overwhelmed today",
  "sessionId": "session-123"
}
```

**Response:**
```json
{
  "message": "I hear you - feeling overwhelmed can be really difficult...",
  "sessionId": "session-123",
  "crisisDetected": false,
  "crisisSeverity": "none"
}
```

### DELETE /api/chat?sessionId=session-123

Clear the conversation history for a session.

## Configuration

### Environment Variables

- `DEEPSEEK_API_KEY`: Your DeepSeek API key (required)
- `DEEPSEEK_API_BASE`: API base URL (default: https://api.deepseek.com/v1)

### Memory Settings

Adjust in `lib/memory.ts`:

- `MAX_RECENT_MESSAGES`: Number of recent messages to keep (default: 10)
- `SUMMARIZE_THRESHOLD`: Trigger summarization after this many messages (default: 8)

### Crisis Detection

Customize crisis keywords in `lib/deepseek.ts`:

- Add or remove keywords in the `crisisKeywords` array
- Adjust severity thresholds

## Important Notes

### Limitations

- **Not a substitute for professional help**: This is a supportive tool, not therapy
- **No emergency response**: Cannot call emergency services or intervene in crises
- **Privacy**: Conversations are stored locally in browser localStorage and in server memory during the session
- **AI limitations**: May occasionally provide imperfect responses
- **Browser storage**: Clearing browser data will erase conversation history

### Ethical Considerations

This app is designed with care for vulnerable users:

- Never claims to be a medical professional
- Encourages seeking professional help when appropriate
- Provides crisis resources proactively
- Uses non-directive, supportive language
- Respects user autonomy and feelings

### Production Deployment

For production use, consider:

- Implementing persistent session storage (Redis, database)
- Adding user authentication
- Implementing rate limiting
- Adding conversation encryption
- Monitoring for abuse or misuse
- Legal review and compliance (HIPAA, etc.)
- Professional consultation for mental health use cases

## Crisis Resources

If you or someone you know is in crisis:

- **988 Suicide & Crisis Lifeline**: Call or text 988 (US)
- **Crisis Text Line**: Text HOME to 741741 (US)
- **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

## License

This project is provided as-is for educational and supportive purposes.

## Disclaimer

This application is not a substitute for professional mental health care. If you are experiencing a mental health crisis or emergency, please contact emergency services or a crisis hotline immediately.

The AI responses are generated by machine learning and may not always be appropriate or accurate. Users should exercise judgment and seek professional help for serious mental health concerns.

