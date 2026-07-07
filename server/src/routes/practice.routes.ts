import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import * as controller from '../controllers/practice.controller.js';

const router = Router();
router.get('/daily', requireAuth, controller.daily);
router.get('/status', requireAuth, controller.status);

export default router;
