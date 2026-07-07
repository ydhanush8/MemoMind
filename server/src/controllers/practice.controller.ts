import { asyncHandler } from '../utils/asyncHandler.js';
import { getUserId } from '../middlewares/auth.middleware.js';
import { sendData } from '../utils/response.js';
import * as practiceService from '../services/practice.service.js';

export const daily = asyncHandler(async (req, res) => {
  sendData(res, await practiceService.getDailyPractice(getUserId(req)));
});

export const status = asyncHandler(async (req, res) => {
  sendData(res, await practiceService.getPracticeStatus(getUserId(req)));
});
