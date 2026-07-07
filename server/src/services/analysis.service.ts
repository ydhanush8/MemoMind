import UsageLog from '../models/UsageLog.js';
import { AppError } from '../utils/appError.js';
import { LIMITS } from '../utils/constants.js';
import { isoDateKey } from '../utils/date.js';
import { isUserPremium } from './subscription.service.js';
import { generateAnalysis } from './ai.service.js';

async function checkRateLimit(userId: string): Promise<boolean> {
  const today = isoDateKey();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const usage = await UsageLog.findOneAndUpdate(
    { userId, action: 'analyze', date: today },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt, userId, action: 'analyze', date: today },
    },
    { upsert: true, new: true },
  );

  return (usage?.count ?? 0) <= LIMITS.ANALYZE_DAILY_LIMIT;
}

export async function analyze(
  userId: string,
  apiKey: string,
  title: string,
  understanding: string,
) {
  const premium = await isUserPremium(userId);
  if (!premium) throw new AppError(403, 'Premium subscription required');

  const withinLimit = await checkRateLimit(userId);
  if (!withinLimit) {
    throw new AppError(429, 'Daily limit of 50 analyses reached. Try again tomorrow.');
  }

  return generateAnalysis(apiKey, title, understanding);
}
