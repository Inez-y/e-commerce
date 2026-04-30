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
    try {}
    catch(error) {
        console.error(error);

        return res.status(500).json({
            message: '[Notification] Failed to fetch notifications',
        });
    }
});

/**
 * GET /notifications/:id
 * Admin can inspect one notification
 */
notificationRoutes.get('/', auth, requireRole('ADMIN'), async(req, res) => {
    try {}
    catch(error) {
        console.error(error);

        return res.status(500).json({
            message: '[Notification] Failed to fetch notifications',
        });
    }
});
