import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { validateCreateSubscription } from '../validators/subscription.validator.js';
import * as controller from '../controllers/subscription.controller.js';

const router = Router();

router.post('/create', requireAuth, validate(validateCreateSubscription), controller.create);
router.post('/verify', requireAuth, controller.verify);
router.post('/restore', requireAuth, controller.restore);
router.get('/status', requireAuth, controller.status);

export default router;
