import {
  OPENROUTER_URL,
  OPENROUTER_MODEL,
  getAppReferer,
} from '../config/openrouter.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import type { AnalysisResponse } from '../types/note.types.js';

async function callOpenRouter(
  apiKey: string,
  prompt: string,
  attempt = 1,
): Promise<AnalysisResponse> {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': getAppReferer(),
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
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

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content in AI response');

  return JSON.parse(content) as AnalysisResponse;
}

function buildPrompt(title: string, understanding: string): string {
  return `Analyze the user's learning note and return ONLY a valid JSON object (no markdown).

Topic: ${title}
What the user learned: ${understanding}

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
}

export async function generateAnalysis(
  apiKey: string,
  title: string,
  understanding: string,
): Promise<AnalysisResponse> {
  const prompt = buildPrompt(title.trim(), understanding.trim());
  try {
    return await callOpenRouter(apiKey, prompt);
  } catch (error) {
    logger.error({ err: error }, 'AI analysis error');
    throw new AppError(500, 'AI analysis failed. Please try again.');
  }
}
