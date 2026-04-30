import { Queue } from 'bullmq';
import { redisConnection } from './redis';

export type NotificationJobData = {
    notificationId: string;
};

export const notificationQueue = new Queue<NotificationJobData>(
    'notifications',
    {
        connection: redisConnection,
    }
);

export async function enqueueNotificationJob(notificationId: string) {
    await notificationQueue.add(
        'send-notification',
        {
            notificationId,
        },
        {
            attempts: 3,
            // wait longer between retries
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        }
    );
};
