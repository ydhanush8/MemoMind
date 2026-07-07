import { Router } from 'express';
import { dailyReminders } from '../controllers/cron.controller.js';

const router = Router();
router.get('/daily-reminders', dailyReminders);

export default router;
