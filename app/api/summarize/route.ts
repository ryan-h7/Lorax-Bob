import { NextRequest, NextResponse } from 'next/server';
import { DeepSeekClient } from '@/lib/deepseek';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, apiKey, apiUrl, model } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Initialize DeepSeek client
    const deepseek = new DeepSeekClient({
      apiKey,
      baseURL: apiUrl || 'https://api.deepseek.com/v1',
      model: model || 'deepseek-v3'
    });

    // Create conversation text
    const conversationText = messages
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    // Request summary from DeepSeek
    const summaryPrompt = `Please analyze the following therapy conversation and create a journal entry. Provide:

1. A concise summary (2-3 sentences) focusing on:
   - What happened that day (important events the user mentioned)
   - How the user was feeling emotionally
   - The overall tone of the conversation

2. Key points discussed (3-5 specific topics or events mentioned)

3. Developments or insights (2-4 bullet points about:
   - Any progress or breakthroughs
   - Important realizations
   - Emotional changes during conversation)

Write as if this is a personal journal memo that captures the essence of the day.

Format your response as JSON with this structure:
{
  "summary": "concise memo-style summary here",
  "keyPoints": ["specific event or topic 1", "event or topic 2", "event or topic 3"],
  "developments": ["insight or progress 1", "insight or progress 2"]
}

Conversation:
${conversationText}

Response (JSON only):`;

    const response = await deepseek.createChatCompletion(
      [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes therapy conversations. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: summaryPrompt
        }
      ],
      {
        temperature: 0.3,
        max_tokens: 800
      }
    );

    const summaryText = response.choices[0]?.message?.content || '{}';
    
    // Try to parse JSON response
    let summaryData;
    try {
      // Remove markdown code blocks if present
      const cleanedText = summaryText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      summaryData = JSON.parse(cleanedText);
    } catch (e) {
      // If parsing fails, create a basic summary
      summaryData = {
        summary: summaryText.substring(0, 200),
        keyPoints: ['Conversation summary generated'],
        developments: ['User shared their thoughts and feelings']
      };
    }

    return NextResponse.json({
      summary: summaryData.summary || 'No summary available',
      keyPoints: summaryData.keyPoints || [],
      developments: summaryData.developments || []
    });

  } catch (error: any) {
    console.error('Summarization error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate summary',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

