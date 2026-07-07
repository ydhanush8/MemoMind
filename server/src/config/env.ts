import 'dotenv/config';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

/**
 * Hard requirements (fail fast at boot): DB + Clerk auth.
 * Per-feature keys (OpenRouter, Razorpay, VAPID, cron) stay optional and are
 * validated at call time so each feature returns the same status code the
 * Next.js version did (e.g. 503 / 500) instead of crashing the whole server.
 */
const schema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  CLERK_PUBLISHABLE_KEY: z.string().min(1, 'CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  OPENROUTER_API_KEY: z.string().optional(),
  APP_URL: z.string().default('https://memomind.vercel.app'),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_PLAN_ID_MONTHLY: z.string().optional(),
  RAZORPAY_PLAN_ID_YEARLY: z.string().optional(),

  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_EMAIL: z.string().optional(),

  CRON_SECRET: z.string().optional(),
  ENABLE_CRON: z
    .string()
    .default('true')
    .transform((v) => v.toLowerCase() === 'true'),
  LOG_LEVEL: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  logger.fatal(
    { issues: parsed.error.flatten().fieldErrors },
    'Invalid environment configuration — aborting startup',
  );
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const corsOrigins = env.CORS_ORIGINS.split(',')
  .map((o) => o.trim())
  .filter(Boolean);
