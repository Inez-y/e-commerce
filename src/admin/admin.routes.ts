import { Router } from 'express';
import { prisma } from '../prisma';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

export const adminRoutes = Router();

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
