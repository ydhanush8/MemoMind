import cron from 'node-cron';
import { env } from '../config/env.js';
import { CRON } from '../utils/constants.js';
import { logger } from '../utils/logger.js';
import { runDailyReminders } from '../services/notification.service.js';

export function startDailyReminderCron(): void {
  if (!env.ENABLE_CRON) {
    logger.info('Daily reminder cron disabled (ENABLE_CRON=false)');
    return;
  }

  cron.schedule(
    CRON.DAILY_REMINDER_SCHEDULE,
    async () => {
      logger.info('Cron: daily reminders started');
      try {
        const summary = await runDailyReminders();
        logger.info({ summary }, 'Cron: daily reminders finished');
      } catch (err) {
        logger.error({ err }, 'Cron: daily reminders failed');
      }
    },
    { timezone: 'UTC' },
  );

  logger.info(`Daily reminder cron scheduled (${CRON.DAILY_REMINDER_SCHEDULE} UTC)`);
}
