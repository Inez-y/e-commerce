import { Router } from 'express';
import { prisma } from '../prisma';

export const productRoutes = Router();

productRoutes.get('/', async (req, res) => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      inventory: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return res.json(products);
});

productRoutes.get('/:id', async (req, res) => {
  const product = await prisma.product.findFirst({
    where: {
      id: req.params.id,
      isActive: true,
    },
    include: {
      inventory: true,
    },
  });

  if (!product) {
    return res.status(404).json({
      message: 'Product not found',
    });
  }

  return res.json(product);
});
