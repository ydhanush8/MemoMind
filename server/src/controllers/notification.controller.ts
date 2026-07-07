import { asyncHandler } from '../utils/asyncHandler.js';
import { getUserId } from '../middlewares/auth.middleware.js';
import { sendData } from '../utils/response.js';
import * as notificationService from '../services/notification.service.js';

export const subscribe = asyncHandler(async (req, res) => {
  sendData(res, await notificationService.subscribe(getUserId(req), req.body));
});

export const getStatus = asyncHandler(async (req, res) => {
  sendData(res, await notificationService.getStatus(getUserId(req)));
});

export const updatePreferences = asyncHandler(async (req, res) => {
  sendData(res, await notificationService.updatePreferences(getUserId(req), req.body ?? {}));
});

export const remove = asyncHandler(async (req, res) => {
  const endpoint = typeof req.body?.endpoint === 'string' ? req.body.endpoint : undefined;
  sendData(res, await notificationService.remove(getUserId(req), endpoint));
});

export const send = asyncHandler(async (req, res) => {
  sendData(res, await notificationService.send(getUserId(req), req.body ?? {}));
});
