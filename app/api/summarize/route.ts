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
    const summaryPrompt = `Please analyze the following therapy conversation and provide:

1. A brief 2-3 sentence summary of the conversation
2. Key points discussed (3-5 bullet points)
3. Any developments or insights gained (2-4 bullet points)

Format your response as JSON with this structure:
{
  "summary": "brief summary here",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "developments": ["development 1", "development 2"]
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

