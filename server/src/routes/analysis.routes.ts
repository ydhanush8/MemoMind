import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { analyzeNote } from '../controllers/analysis.controller.js';

const router = Router();
router.post('/', requireAuth, analyzeNote);

export default router;
