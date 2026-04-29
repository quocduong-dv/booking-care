import cron from 'node-cron';
import reminderService from '../servies/reminderService';

export const initCronJobs = () => {
    const schedule = process.env.REMINDER_CRON || '0 * * * *';
    const tz = process.env.CRON_TZ || 'Asia/Ho_Chi_Minh';

    cron.schedule(schedule, async () => {
        try {
            const res = await reminderService.sendPatient24hReminders();
            console.log('[cron] reminder tick', res);
        } catch (e) {
            console.error('[cron] reminder error', e);
        }
    }, { timezone: tz });

    console.log(`[cron] reminder scheduled "${schedule}" (${tz})`);
};
