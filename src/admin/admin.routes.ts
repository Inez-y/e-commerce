import { Router } from 'express';
import { prisma } from '../prisma';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

export const adminRoutes = Router();

/**
 * @openapi
 * /admin/products:
 *   get:
 *     summary: List all products for admin
 *     description: Returns all products, including inactive or soft-deleted products.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin product list
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 */
adminRoutes.get('/products', auth, requireRole('ADMIN'), async(req,res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                inventory: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return res.json(products);
    }
    catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Failed to fetch admin products.'
        });
    }
});

/**
 * @openapi
 * /admin/audit-logs:
 *   get:
 *     summary: List audit logs
 *     description: Returns recent audit logs for admin visibility.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of audit logs
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 */
adminRoutes.get('/audit-logs', auth, requireRole('ADMIN'), async (req, res) => {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return res.json(auditLogs);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Failed to fetch audit logs',
    });
  }
});
