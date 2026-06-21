import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { AnalysisRequest, AnalysisResponse } from '@/app/lib/types';
import connectDB from '@/app/lib/mongodb';
import UsageLog from '@/app/lib/models/UsageLog';
import { isUserPremium } from '@/app/lib/checkPremium';

const DAILY_LIMIT = 50;
const TITLE_MAX = 200;
const UNDERSTANDING_MAX = 10_000;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-oss-120b:free';

async function checkRateLimit(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const usage = await UsageLog.findOneAndUpdate(
    { userId, action: 'analyze', date: today },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt, userId, action: 'analyze', date: today },
    },
    { upsert: true, new: true }
  );

  return usage.count <= DAILY_LIMIT;
}

async function callOpenRouter(
  apiKey: string,
  prompt: string,
  attempt: number = 1
): Promise<AnalysisResponse> {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://memomind.vercel.app',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    }),
  });

  if (response.status === 429 && attempt < 3) {
    await new Promise((r) => setTimeout(r, 1000 * attempt));
    return callOpenRouter(apiKey, prompt, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(`OpenRouter error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error('No content in AI response');

  return JSON.parse(content) as AnalysisResponse;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
  }

  let body: AnalysisRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { title, understanding } = body;

  if (!title?.trim() || !understanding?.trim()) {
    return NextResponse.json({ error: 'Both title and understanding are required' }, { status: 400 });
  }
  if (title.length > TITLE_MAX) {
    return NextResponse.json({ error: `Title must be under ${TITLE_MAX} characters` }, { status: 400 });
  }
  if (understanding.length > UNDERSTANDING_MAX) {
    return NextResponse.json(
      { error: `Understanding must be under ${UNDERSTANDING_MAX} characters` },
      { status: 400 }
    );
  }

  await connectDB();

  const premium = await isUserPremium(userId);
  if (!premium) {
    return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
  }

  const withinLimit = await checkRateLimit(userId);
  if (!withinLimit) {
    return NextResponse.json(
      { error: 'Daily limit of 50 analyses reached. Try again tomorrow.' },
      { status: 429 }
    );
  }

  const prompt = `Analyze the user's learning note and return ONLY a valid JSON object (no markdown).

Topic: ${title.trim()}
What the user learned: ${understanding.trim()}

Return this exact JSON structure:
{
  "cleaned_explanation": "Clear rewrite of their explanation",
  "key_points_understood": ["point1", "point2"],
  "missing_or_unclear_points": ["gap1", "gap2"],
  "simple_summary": "2-3 sentence summary",
  "difficulty": "Easy|Medium|Hard",
  "accuracy_score": 75,
  "next_concepts_to_learn": ["concept1", "concept2"],
  "quick_quiz": [
    { "q": "Question text?", "answer": "Answer text" },
    { "q": "Question text?", "answer": "Answer text" }
  ]
}`;

  try {
    const result = await callOpenRouter(apiKey, prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json({ error: 'AI analysis failed. Please try again.' }, { status: 500 });
  }
}
