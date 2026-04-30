import dotenv from 'dotenv';
import { Worker } from 'bullmq';
import { prisma } from '../prisma';
import { redisConnection } from './redis';
import type { NotificationJobData } from './notification.queue';

dotenv.config();

const worker = new Worker<NotificatinoJObData>(
    'notifications',
    async (job) => {}
);

worker.on('completed', (job) => {
    console.log(`[Notification worker] Job completed for: ${job.id}`);
});

worker.on('failed', async (job, error) => {
    console.error(`[Notification worker] Job failed: ${job?.id}`, error);

    const notificationId = job?.data.notificationId;
    if (notificationId) {
        await prisma.notification.update({
            where: {
                id: notificationId,
            },
            data: {
                status: 'FAILED',
                errorMessage: error.message,
            },
        });
    }
});

console.log('[Notification worker] Running smoothly.')