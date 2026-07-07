import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { validatePushSubscription } from '../validators/notification.validator.js';
import * as controller from '../controllers/notification.controller.js';

const router = Router();

// Mirrors the original single /subscribe path with GET/POST/PATCH/DELETE verbs.
router.get('/subscribe', requireAuth, controller.getStatus);
router.post('/subscribe', requireAuth, validate(validatePushSubscription), controller.subscribe);
router.patch('/subscribe', requireAuth, controller.updatePreferences);
router.delete('/subscribe', requireAuth, controller.remove);

router.post('/send', requireAuth, controller.send);

export default router;
