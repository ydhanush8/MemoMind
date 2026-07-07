import { LIMITS } from '../utils/constants.js';

export function validateAnalysis(body: unknown): string | null {
  const b = (body ?? {}) as { title?: string; understanding?: string };
  if (!b.title?.trim() || !b.understanding?.trim()) return 'Both title and understanding are required';
  if (b.title.length > LIMITS.TITLE_MAX) return `Title must be under ${LIMITS.TITLE_MAX} characters`;
  if (b.understanding.length > LIMITS.UNDERSTANDING_MAX)
    return `Understanding must be under ${LIMITS.UNDERSTANDING_MAX} characters`;
  return null;
}
