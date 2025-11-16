import { NextRequest, NextResponse } from 'next/server';
import { DeepSeekClient } from '@/lib/deepseek';
import { MemoryManager, createSummarizationPrompt, Message } from '@/lib/memory';
import { getRecentJournalContext } from '@/lib/greeting';
import { formatFactsForContext, UserFact } from '@/lib/user-memory';
import { JournalEntry } from '@/lib/journal';

// Store memory per session (in production, use Redis or similar)
const sessionMemories = new Map<string, MemoryManager>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId, apiKey, apiUrl, model, tone, isGreeting, userFacts, journalEntries, avatar } = body;

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

    // Handle greeting request specially
    if (isGreeting && message === '[GREETING_REQUEST]') {
      // Use user facts and journal entries sent from client
      const allUserFacts = userFacts || [];
      const allJournalEntries = journalEntries || [];
      
      console.log('🔍 [GREETING] Total user facts received from client:', allUserFacts.length);
      console.log('🔍 [GREETING] User facts:', JSON.stringify(allUserFacts, null, 2));
      console.log('📖 [GREETING] Total journal entries received from client:', allJournalEntries.length);
      
      let userFactsSection = '';
      
      if (allUserFacts.length > 0) {
        userFactsSection = '\n\n=== REMEMBERED FACTS ABOUT USER ===\n';
        
        // Group by type for better organization
        const factsByType = {
          person: allUserFacts.filter((f: UserFact) => f.type === 'person'),
          place: allUserFacts.filter((f: UserFact) => f.type === 'place'),
          thing: allUserFacts.filter((f: UserFact) => f.type === 'thing'),
          event: allUserFacts.filter((f: UserFact) => f.type === 'event'),
          mood: allUserFacts.filter((f: UserFact) => f.type === 'mood'),
          action: allUserFacts.filter((f: UserFact) => f.type === 'action'),
          date: allUserFacts.filter((f: UserFact) => f.type === 'date')
        };
        
        if (factsByType.person.length > 0) {
          userFactsSection += '\nPeople in their life:\n' + factsByType.person.map((f: UserFact) => 
            `  - ${f.content}${f.context ? ` (${f.context})` : ''}`
          ).join('\n');
        }
        if (factsByType.place.length > 0) {
          userFactsSection += '\n\nPlaces:\n' + factsByType.place.map((f: UserFact) => 
            `  - ${f.content}${f.context ? ` (${f.context})` : ''}`
          ).join('\n');
        }
        if (factsByType.event.length > 0) {
          userFactsSection += '\n\nUpcoming/Recent Events:\n' + factsByType.event.map((f: UserFact) => 
            `  - ${f.content}${f.context ? ` (${f.context})` : ''} [Importance: ${f.importance}]`
          ).join('\n');
        }
        if (factsByType.mood.length > 0) {
          userFactsSection += '\n\nRecent Emotional States:\n' + factsByType.mood.map((f: UserFact) => 
            `  - ${f.content}${f.context ? ` (${f.context})` : ''}`
          ).join('\n');
        }
        if (factsByType.action.length > 0) {
          userFactsSection += '\n\nActions/Goals:\n' + factsByType.action.map((f: UserFact) => 
            `  - ${f.content}${f.context ? ` (${f.context})` : ''}`
          ).join('\n');
        }
        if (factsByType.thing.length > 0) {
          userFactsSection += '\n\nImportant Things/Topics:\n' + factsByType.thing.map((f: UserFact) => 
            `  - ${f.content}${f.context ? ` (${f.context})` : ''}`
          ).join('\n');
        }
        if (factsByType.date.length > 0) {
          userFactsSection += '\n\nImportant Dates:\n' + factsByType.date.map((f: UserFact) => 
            `  - ${f.content}${f.context ? ` (${f.context})` : ''}`
          ).join('\n');
        }
      }
      
      // Journal entries already loaded from client above
      let journalSection = '';
      
      if (allJournalEntries.length > 0) {
        journalSection = '\n\n=== PAST CONVERSATION SUMMARIES ===\n';
        
        // Get up to 10 most recent entries for context (to avoid token overflow)
        const recentEntries = allJournalEntries.slice(0, 10);
        
        journalSection += recentEntries.map((entry: JournalEntry, index: number) => {
          const daysAgo = Math.floor((Date.now() - entry.timestamp) / (1000 * 60 * 60 * 24));
          const timeAgo = daysAgo === 0 ? 'earlier today' : 
                          daysAgo === 1 ? 'yesterday' : 
                          `${daysAgo} days ago`;
          
          let entryText = `\n[${timeAgo}] Mood: ${entry.startMood} → ${entry.endMood}`;
          entryText += `\nSummary: ${entry.summary}`;
          
          if (entry.keyPoints && entry.keyPoints.length > 0) {
            entryText += `\nKey points: ${entry.keyPoints.join('; ')}`;
          }
          
          if (entry.developments && entry.developments.length > 0) {
            entryText += `\nDevelopments: ${entry.developments.join('; ')}`;
          }
          
          if (entry.aiInterpretation) {
            entryText += `\n⚠️ Improvement note: ${entry.aiInterpretation}`;
          }
          
          return entryText;
        }).join('\n---\n');
        
        if (allJournalEntries.length > 10) {
          journalSection += `\n\n(${allJournalEntries.length - 10} older conversations not shown)`;
        }
      }
      
      // Get current time info for personalized greeting
      const hour = new Date().getHours();
      const timeOfDay = 
        hour >= 0 && hour < 4 ? 'late at night' :
        hour >= 4 && hour < 8 ? 'early morning' :
        hour >= 8 && hour < 12 ? 'morning' :
        hour >= 12 && hour < 17 ? 'afternoon' :
        hour >= 17 && hour < 21 ? 'evening' : 'night';
      
      // Combine ALL context
      const comprehensiveContext = userFactsSection + journalSection;
      
      console.log('📝 [GREETING] User Facts Section:');
      console.log(userFactsSection || '(No user facts)');
      console.log('\n📝 [GREETING] Journal Section:');
      console.log(journalSection || '(No journal entries)');
      console.log('\n📝 [GREETING] Complete comprehensive context:');
      console.log(comprehensiveContext || '(No prior context available)');
      
      // Create greeting prompt with full context
      const avatarInfo = avatar ? `

YOUR CHARACTER:
You are ${avatar.name}. ${avatar.personality}
Embody this character naturally in your greeting and responses.` : '';

      const greetingMessages = [
        {
          role: 'system' as const,
          content: `You are a compassionate, empathetic listener. The user is starting a NEW conversation with you right now.${avatarInfo}

Below is EVERYTHING you know about this user from past conversations and extracted facts. Use this information to create a personalized, natural greeting.

${comprehensiveContext || '(This is the user\'s first conversation with you - no prior context available)'}

Current time: It's ${timeOfDay} (${hour}:00 hours).

INSTRUCTIONS FOR GREETING:
- Keep it conversational and natural (1-2 sentences max)
- If it's very late/early, acknowledge that thoughtfully
- If you know about recent events (especially high-importance ones), you can naturally ask about them
- If you remember recent moods or concerns, you can check in on them
- Ask an open-ended question to start the conversation
- Be warm, welcoming, and show you remember them
- Don't list everything you know - just naturally reference ONE relevant thing if appropriate

Example tones:
- Late night: "What has you up so late tonight?"
- With recent event: "Hey! How did that job interview go?"
- With recent mood: "Hi there! Are you still feeling anxious about the presentation?"
- First time/no context: "How are you feeling this ${timeOfDay}?"

Generate ONLY the greeting message, nothing else.`
        },
        {
          role: 'user' as const,
          content: 'Generate a greeting for me.'
        }
      ];
      
      console.log('📤 [GREETING] Complete greeting messages being sent to AI:');
      console.log(JSON.stringify(greetingMessages, null, 2));
      
      // Get AI-generated greeting
      const greetingResponse = await deepseek.createChatCompletion(greetingMessages, {
        temperature: 0.9,
        max_tokens: 150
      });
      
      const greeting = greetingResponse.choices[0]?.message?.content || 
        `Hey! How are you doing this ${timeOfDay}?`;
      
      console.log('✅ [GREETING] AI generated greeting:', greeting);
      
      // Add greeting to memory
      memory.addMessage('assistant', greeting);
      
      return NextResponse.json({
        message: greeting
      });
    }
    
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

    // Build context from client-sent data (userFacts and journalEntries)
    const allUserFacts = userFacts || [];
    const allJournalEntries = journalEntries || [];
    
    console.log('💬 [CHAT] User facts count:', allUserFacts.length);
    console.log('💬 [CHAT] Journal entries count:', allJournalEntries.length);
    
    // Format user facts for context
    let userFactsContext = '';
    if (allUserFacts.length > 0) {
      const factsByType = {
        person: allUserFacts.filter((f: UserFact) => f.type === 'person'),
        place: allUserFacts.filter((f: UserFact) => f.type === 'place'),
        event: allUserFacts.filter((f: UserFact) => f.type === 'event'),
        mood: allUserFacts.filter((f: UserFact) => f.type === 'mood'),
        action: allUserFacts.filter((f: UserFact) => f.type === 'action'),
      };
      
      const factParts = [];
      if (factsByType.person.length > 0) {
        factParts.push('People: ' + factsByType.person.map((f: UserFact) => f.content).join(', '));
      }
      if (factsByType.place.length > 0) {
        factParts.push('Places: ' + factsByType.place.map((f: UserFact) => f.content).join(', '));
      }
      if (factsByType.event.length > 0) {
        factParts.push('Events: ' + factsByType.event.map((f: UserFact) => 
          f.content + (f.context ? ` (${f.context})` : '')
        ).join('; '));
      }
      if (factsByType.mood.length > 0) {
        factParts.push('Recent moods: ' + factsByType.mood.map((f: UserFact) => f.content).join(', '));
      }
      if (factsByType.action.length > 0) {
        factParts.push('Actions/Goals: ' + factsByType.action.map((f: UserFact) => f.content).join('; '));
      }
      
      if (factParts.length > 0) {
        userFactsContext = '\n\nRemembered facts: ' + factParts.join('\n');
      }
    }
    
    // Format journal entries for context (last 3)
    let journalContext = '';
    if (allJournalEntries.length > 0) {
      const recentEntries = allJournalEntries.slice(0, 3);
      const contextParts = recentEntries.map((entry: JournalEntry) => {
        const daysAgo = Math.floor((Date.now() - entry.timestamp) / (1000 * 60 * 60 * 24));
        const timeAgo = daysAgo === 0 ? 'earlier today' : 
                        daysAgo === 1 ? 'yesterday' : 
                        `${daysAgo} days ago`;
        return `${timeAgo}: ${entry.summary.substring(0, 100)}`;
      });
      
      journalContext = '\n\nRecent conversations: ' + contextParts.join('; ');
    }
    
    // Combine all context
    const fullContext = userFactsContext + journalContext;
    
    // Get messages for API call with full context, tone, and avatar
    const apiMessages = memory.getMessagesForAPI(fullContext, tone || 'empathetic', avatar);

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

