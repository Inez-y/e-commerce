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
