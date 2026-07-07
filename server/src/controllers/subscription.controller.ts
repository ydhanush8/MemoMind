import { asyncHandler } from '../utils/asyncHandler.js';
import { getUserId } from '../middlewares/auth.middleware.js';
import { sendData } from '../utils/response.js';
import * as subscriptionService from '../services/subscription.service.js';
import type { PlanType } from '../utils/constants.js';

export const create = asyncHandler(async (req, res) => {
  const result = await subscriptionService.createSubscription(
    getUserId(req),
    req.body.planType as PlanType,
  );
  sendData(res, result);
});

export const verify = asyncHandler(async (req, res) => {
  sendData(res, await subscriptionService.verifyPayment(getUserId(req), req.body));
});

export const restore = asyncHandler(async (req, res) => {
  const raw = (req.body?.subscriptionId ?? '') as string;
  const manual = raw.trim() || undefined;
  sendData(res, await subscriptionService.restoreSubscription(getUserId(req), manual));
});

export const status = asyncHandler(async (req, res) => {
  sendData(res, await subscriptionService.getStatus(getUserId(req)));
});
