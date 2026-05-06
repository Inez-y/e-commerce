import { Router } from 'express';
import { prisma } from '../prisma';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

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

productRoutes.post('/', auth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, description, sku, priceCents, quantity } = req.body;

    if (!name || !sku || priceCents == null || quantity == null) {
      return res.status(400).json({
        message: 'name, sku, priceCents, and quantity are required',
      });
    }

    if (priceCents < 0 || quantity < 0) {
      return res.status(400).json({
        message: 'priceCents and quantity must be non-negative',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name,
          description,
          sku,
          priceCents,
          isActive: true,
        },
      });

      const inventory = await tx.inventory.create({
        data: {
          productId: product.id,
          quantity,
          reserved: 0,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: req.user!.sub,
          action: 'PRODUCT_CREATED',
          entityType: 'Product',
          entityId: product.id,
          metadata: {
            name,
            sku,
            priceCents,
            quantity,
          },
        },
      });

      return {
        ...product,
        inventory,
      };
    });

    return res.status(201).json(result);
  } catch (error: any) {
    console.error(error);

    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'A product with this SKU already exists',
      });
    }

    return res.status(500).json({
      message: 'Failed to create product',
    });
  }
});
