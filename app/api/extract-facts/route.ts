import { NextRequest, NextResponse } from 'next/server';
import { DeepSeekClient } from '@/lib/deepseek';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, apiKey, apiUrl, model } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
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

    // Get recent user messages (last 5)
    const recentMessages = messages
      .filter((m: any) => m.role === 'user')
      .slice(-5)
      .map((m: any) => m.content)
      .join('\n\n');

    const extractionPrompt = `Analyze these recent user messages and extract ONLY NEW, SPECIFIC, and IMPORTANT information. Do not extract vague or general statements.

User messages:
${recentMessages}

Extract the following types of facts if present (return empty arrays if not found):

1. **People**: Names of people mentioned (friends, family, colleagues)
2. **Places**: Specific locations mentioned (cities, venues, workplaces)
3. **Things**: Important objects, items, or concepts (job, car, pet, hobby)
4. **Events**: Specific events (test, interview, party, trip, meeting)
5. **Moods**: Specific mood states mentioned (feeling anxious, happy, stressed, excited)
6. **Actions**: Things the user did or plans to do (went to gym, studying for test, applying to jobs)
7. **Dates**: Time references (tomorrow, next week, Monday, specific dates)

Rules:
- Be SPECIFIC. Extract "test on Friday" not just "test"
- Extract IMPORTANT information only (not casual mentions)
- For events, include context in parentheses
- For dates, include what the date is about
- Only extract NEW information, not assumptions
- Importance: "high" for urgent/emotional items, "medium" for notable items, "low" for minor details

Return ONLY valid JSON in this exact format:
{
  "facts": [
    {
      "type": "event",
      "content": "job interview",
      "context": "at tech company",
      "importance": "high"
    },
    {
      "type": "mood",
      "content": "feeling anxious",
      "context": "about interview",
      "importance": "high"
    },
    {
      "type": "person",
      "content": "Sarah (roommate)",
      "importance": "medium"
    }
  ]
}

If NO important facts are found, return: {"facts": []}

Response (JSON only):`;

    const response = await deepseek.createChatCompletion(
      [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts specific, important facts from conversations. Return ONLY valid JSON.'
        },
        {
          role: 'user',
          content: extractionPrompt
        }
      ],
      {
        temperature: 0.2,
        max_tokens: 800
      }
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from AI');
    }

    // Parse JSON response
    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch (jsonError) {
      console.error('Failed to parse JSON from AI:', content, jsonError);
      return NextResponse.json(
        { facts: [] },
        { status: 200 }
      );
    }

  } catch (error: any) {
    console.error('Extract facts API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to extract facts',
        details: error.message,
        facts: []
      },
      { status: 500 }
    );
  }
}

