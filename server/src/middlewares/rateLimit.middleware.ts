import rateLimit from 'express-rate-limit';

/**
 * General network-level protection for the whole API. This is separate from the
 * business rule in the analysis feature (50 AI analyses/day via UsageLog), which
 * is preserved exactly.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
