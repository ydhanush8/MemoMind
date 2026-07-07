import Note from '../models/Note.js';
import { AppError } from '../utils/appError.js';
import { LIMITS } from '../utils/constants.js';
import { utcMidnight } from '../utils/date.js';
import { isUserPremium } from './subscription.service.js';
import type { PracticeStatus } from '../types/note.types.js';

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function getDailyPractice(userId: string) {
  try {
    const premium = await isUserPremium(userId);
    if (!premium) throw new AppError(403, 'Premium subscription required');

    const today = utcMidnight();

    // Once today's goal is met, practice is done — keeps daily/status consistent.
    const reviewedToday = await Note.countDocuments({ userId, lastReviewedAt: { $gte: today } });
    if (reviewedToday >= LIMITS.PRACTICE_DAILY_GOAL) return [];

    const candidates = await Note.find({
      userId,
      $or: [{ lastReviewedAt: { $lt: today } }, { lastReviewedAt: null }],
    })
      .select('title understanding analysis lastReviewedAt reviewCount createdAt updatedAt')
      .sort({ lastReviewedAt: 1 })
      .limit(10)
      .lean();

    if (candidates.length === 0) return [];

    const shuffled = fisherYatesShuffle(candidates);
    const count = Math.min(Math.max(2, Math.ceil(Math.random() * 4) + 1), shuffled.length);
    return shuffled.slice(0, count);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to fetch practice notes');
  }
}

export async function getPracticeStatus(userId: string): Promise<PracticeStatus> {
  try {
    const premium = await isUserPremium(userId);
    if (!premium) throw new AppError(403, 'Premium subscription required');

    const today = utcMidnight();
    const [reviewedToday, totalNotes, notesNeedingReview] = await Promise.all([
      Note.countDocuments({ userId, lastReviewedAt: { $gte: today } }),
      Note.countDocuments({ userId }),
      Note.countDocuments({
        userId,
        $or: [{ lastReviewedAt: { $lt: today } }, { lastReviewedAt: null }],
      }),
    ]);

    return {
      completed: reviewedToday >= LIMITS.PRACTICE_DAILY_GOAL,
      reviewedToday,
      totalNotes,
      notesNeedingReview,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'Failed to fetch practice status');
  }
}
