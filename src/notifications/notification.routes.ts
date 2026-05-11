/**
 * Admin only notifications now.
 */
import { Router } from 'express';
import { prisma } from '../prisma';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

export const notificationRoutes = Router();

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: List notifications
 *     description: Admin-only endpoint for viewing notification job records.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
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
 * @openapi
 * /notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     description: Admin-only endpoint for viewing one notification record.
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification details
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Notification not found
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
