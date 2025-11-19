import { NextRequest, NextResponse } from 'next/server';
import type { AnalysisRequest, AnalysisResponse } from '@/app/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { title, understanding } = body;

    // Validate input
    if (!title || !understanding) {
      return NextResponse.json(
        { error: 'Both title and understanding are required' },
        { status: 400 },
      );
    }

    // Check for API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    // Create the prompt for AI analysis
    const prompt = `Analyze the user's learning note.

Topic Title:
${title}

What the User Learned:
${understanding}

Your task:
1. Clean and rewrite their explanation clearly.
2. List the key points the user understood correctly.
3. Point out missing information or misunderstandings.
4. Give a simple 2–3 sentence summary of the topic.
5. Rate the difficulty (Easy, Medium, Hard).
6. Estimate their understanding accuracy (0–100%).
7. Suggest what they should learn next.
8. Create 2 short quiz questions.

Return ONLY this JSON (no markdown, no code blocks, just the raw JSON):

{
  "cleaned_explanation": "",
  "key_points_understood": [],
  "missing_or_unclear_points": [],
  "simple_summary": "",
  "difficulty": "",
  "accuracy_score": 0,
  "next_concepts_to_learn": [],
  "quick_quiz": [
    { "q": "", "answer": "" }
  ]
}`;

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://memomind.app',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000, // Free tier limit is 4000, keeping it under
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return NextResponse.json({ error: `OpenRouter API error: ${error}` }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Parse the AI response as JSON
    let analysisResult: AnalysisResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      analysisResult = JSON.parse(cleanedResponse);
    } catch {
      console.error('Failed to parse AI response:', aiResponse);
      return NextResponse.json({ error: 'Invalid response format from AI' }, { status: 500 });
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Error in analyze API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
