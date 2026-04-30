import dotenv from 'dotenv';
import { Worker } from 'bullmq';
import { prisma } from '../prisma';
import { redisConnection } from './redis';
import type { NotificationJobData } from './notification.queue';

dotenv.config();

const worker = new Worker<NotificationJobData>(
    'notifications',
    async (job) => {
        const { notificationId } = job.data;

        const notification = await prisma.notification.findUnique({
            where: {
                id: notificationId,
            },
        });

        if (!notification) {
            throw new Error(`[Notification worker] Notification not found: ${notificationId}`);
        }

        if (notification.status === 'SENT') {
            return { skipped: true, reason: 'Notification already sent.', };
        }

        console.log('[Notification worker] Sending notification now...');
        console.log({
            to: notification.recipientEmail,
            subject: notification.subject,
            body: notification.body,
        });

        // TODO: replace update for real email providers
        await prisma.notification.update({
            where: {
                id: notificationId,
            },
            data: {
                status: 'SENT',
                sentAt: new Date(),
                errorMessage: null,
            },
        });

        return { sent: true, notificationId: notification.id, };
    },
    {
        connection: redisConnection,
    }
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

console.log('[Notification worker] Running smoothly.');
