import { env } from './env.js';

export const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const OPENROUTER_MODEL = 'openai/gpt-oss-120b:free';

export function getOpenRouterApiKey(): string | undefined {
  return env.OPENROUTER_API_KEY;
}

export function getAppReferer(): string {
  return env.APP_URL;
}
