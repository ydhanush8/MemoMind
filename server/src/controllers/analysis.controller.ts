import { asyncHandler } from '../utils/asyncHandler.js';
import { getUserId } from '../middlewares/auth.middleware.js';
import { sendData, sendError } from '../utils/response.js';
import { getOpenRouterApiKey } from '../config/openrouter.js';
import { validateAnalysis } from '../validators/analysis.validator.js';
import { analyze } from '../services/analysis.service.js';

// Order mirrors the original route: apiKey (503) → body validation (400) → service.
export const analyzeNote = asyncHandler(async (req, res) => {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    sendError(res, 'AI service not configured', 503);
    return;
  }

  const validationError = validateAnalysis(req.body ?? {});
  if (validationError) {
    sendError(res, validationError, 400);
    return;
  }

  const { title, understanding } = req.body as { title: string; understanding: string };
  const result = await analyze(getUserId(req), apiKey, title, understanding);
  sendData(res, result);
});
