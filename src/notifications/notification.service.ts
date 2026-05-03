import { prisma } from '../prisma';
import { enqueueNotificationJob } from '../jobs/notification.queue';

type CreateNotificationInput = {
  type: 'ORDER_CREATED' | 'ORDER_CANCELLED' | 'LOW_STOCK';
  recipientEmail: string;
  subject: string;
  body: string;
};

export async function createNotification(input: CreateNotificationInput) {
  console.log('[Notification service] Creating notification row...');

  const notification = await prisma.notification.create({
    data: {
      type: input.type,
      status: 'PENDING',
      recipientEmail: input.recipientEmail,
      subject: input.subject,
      body: input.body,
    },
  });

  console.log('[Notification service] Notification created:', notification.id);
  console.log('[Notification service] Enqueueing notification job...');

  if (process.env.NODE_ENV === 'test') {
    console.log('[Notification service] Skipping queue in test environment.');
    return notification;
  }

  console.log('[Notification service] Enqueueing notification job...');
  
  await enqueueNotificationJob(notification.id);

  console.log('[Notification service] Notification job enqueued.');

  return notification;
}
