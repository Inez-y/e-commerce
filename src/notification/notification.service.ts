import { prisma } from '../prisma';
import { enqueueNotificationJob } from '../jobs/notification.queue';

type CreateNotificationInput = {
    type: 'ORDER_CREATED' | 'ORDER_CANCELLED' | 'LOW_STOCK';
    recipientEmail: string;
    subject: string;
    body: string;
};

export async function createNotification(input: CreateNotificationInput){
    const notification = await prisma.notification.create({
        data: {
            type: input.type,
            status: 'PENDING',
            recipientEmail: input.recipientEmail,
            subject: input.subject,
            body: input.body,
        },
    });

    await enqueueNotificationJob(notification.id);

    return notification;
}
