import { NextRequest, NextResponse } from 'next/server';
import { DeepSeekClient } from '@/lib/deepseek';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedback, apiKey, apiUrl, model } = body;

    if (!feedback || typeof feedback !== 'string') {
      return NextResponse.json(
        { error: 'Feedback is required' },
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

    const deepseek = new DeepSeekClient({
      apiKey,
      baseURL: apiUrl,
      model: model || 'deepseek-v3'
    });

    const interpretationPrompt = `The user's mood dropped after a therapy conversation. They provided this feedback about how to improve:

"${feedback}"

Please provide a concise interpretation (2-3 sentences) that:
1. Summarizes what the user wants (be specific about their needs)
2. Suggests concrete improvements for future conversations
3. Uses language like "User felt...", "Should improve by...", "Try to..."

Keep it brief and actionable. This will be used to improve future conversations.

Response (2-3 sentences only):`;

    const response = await deepseek.createChatCompletion(
      [
        {
          role: 'system',
          content: 'You are a helpful assistant that interprets user feedback to improve therapy conversations. Provide concise, actionable interpretations.'
        },
        {
          role: 'user',
          content: interpretationPrompt
        }
      ],
      {
        temperature: 0.3,
        max_tokens: 200
      }
    );

    const interpretation = response.choices[0]?.message?.content;
    if (!interpretation) {
      throw new Error('No interpretation received from AI');
    }

    return NextResponse.json({ interpretation: interpretation.trim() });

  } catch (error: any) {
    console.error('Interpret feedback API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to interpret feedback',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

