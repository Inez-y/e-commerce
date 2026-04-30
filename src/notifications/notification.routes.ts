/**
 * Admin only notifications now.
 */
import { Router } from 'express';
import { prisma } from '../prisma';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

export const notificationRoutes = Router();

/**
 * GET /notifications
 * Admin can inspect all notifications
 */
notificationRoutes.get('/', auth, requireRole('ADMIN'), async(req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return res.json(notifications);
    }
    catch(error) {
        console.error(error);

        return res.status(500).json({
            message: '[Notification] Failed to fetch notifications.',
        });
    }
});

/**
 * GET /notifications/:id
 * Admin can inspect one notification
 */
notificationRoutes.get('/:id', auth, requireRole('ADMIN'), async(req, res) => {
    try {
        const notificationId = req.params.id;
        if (typeof notificationId !== 'string') {
            return res.status(400).json({
                message: '[Notification] Invalid notification id.'
            });
        }

        const notification = await prisma.notification.findUnique({
            where: {
                id: notificationId,
            },
        });
        if (!notification) {
            return res.status(404).json({
                message: '[Notification] not found.'
            });
        }

        return res.json(notification);
    }
    catch(error) {
        console.error(error);

        return res.status(500).json({
            message: '[Notification] Failed to fetch notifications.',
        });
    }
});
