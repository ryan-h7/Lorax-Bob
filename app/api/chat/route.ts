import { NextRequest, NextResponse } from 'next/server';
import { DeepSeekClient } from '@/lib/deepseek';
import { MemoryManager, createSummarizationPrompt, Message } from '@/lib/memory';
import { getRecentJournalContext } from '@/lib/greeting';

// Store memory per session (in production, use Redis or similar)
const sessionMemories = new Map<string, MemoryManager>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, apiKey, apiUrl, model } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    if (!apiUrl || typeof apiUrl !== 'string') {
      return NextResponse.json(
        { error: 'API URL is required' },
        { status: 400 }
      );
    }

    // Get or create memory manager for this session
    const effectiveSessionId = sessionId || 'default';
    if (!sessionMemories.has(effectiveSessionId)) {
      sessionMemories.set(effectiveSessionId, new MemoryManager());
    }
    const memory = sessionMemories.get(effectiveSessionId)!;

    // Initialize DeepSeek client with user's API key, URL, and model
    const deepseek = new DeepSeekClient({
      apiKey,
      baseURL: apiUrl,
      model: model || 'deepseek-v3'
    });

    // Check for crisis language
    const crisisCheck = await deepseek.detectCrisisLanguage(message);
    
    // Add user message to memory
    memory.addMessage('user', message);

    // Check if we need to summarize old messages
    if (memory.shouldSummarize()) {
      const messagesToSummarize = memory.getMessagesToSummarize();
      const summaryPrompt = createSummarizationPrompt(messagesToSummarize);
      
      try {
        const summary = await deepseek.summarizeConversation(
          messagesToSummarize,
          summaryPrompt
        );
        memory.storeSummary(summary);
      } catch (error) {
        console.error('Summarization failed:', error);
        // Continue without summarization if it fails
      }
    }

    // Get journal context for continuity
    const journalContext = getRecentJournalContext();
    
    // Get messages for API call with journal context
    const apiMessages = memory.getMessagesForAPI(journalContext);

    // If crisis detected, add a system message to guide the response
    if (crisisCheck.isCrisis) {
      apiMessages.push({
        role: 'system',
        content: `Note: The user's message contains concerning language. Respond with extra care, validation, and gently suggest professional resources without being directive or alarming. Remember you are not a therapist - be supportive and caring.`
      });
    }

    // Get response from DeepSeek
    const response = await deepseek.createChatCompletion(apiMessages, {
      temperature: 0.8,
      max_tokens: 1000
    });

    const assistantMessage = response.choices[0]?.message?.content || 
      "I'm here to listen. Could you tell me more about what's on your mind?";

    // Add assistant response to memory
    memory.addMessage('assistant', assistantMessage);

    return NextResponse.json({
      message: assistantMessage,
      sessionId: effectiveSessionId,
      crisisDetected: crisisCheck.isCrisis,
      crisisSeverity: crisisCheck.severity
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Clear session memory endpoint
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || 'default';

    if (sessionMemories.has(sessionId)) {
      sessionMemories.delete(sessionId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to clear session' },
      { status: 500 }
    );
  }
}

