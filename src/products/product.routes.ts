import { Router } from 'express';
import { prisma } from '../prisma';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

export const productRoutes = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: List active products
 *     description: Public endpoint that returns active products for the storefront.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of active products
 *       500:
 *         description: Failed to fetch products
 */
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

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Public endpoint that returns one active product by ID.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to fetch product
 */
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

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Create a product
 *     description: Admin-only endpoint for creating a product and initial inventory.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *               - priceCents
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Desk Lamp
 *               description:
 *                 type: string
 *                 example: Adjustable LED desk lamp
 *               sku:
 *                 type: string
 *                 example: LAMP-001
 *               priceCents:
 *                 type: integer
 *                 example: 3499
 *               quantity:
 *                 type: integer
 *                 example: 15
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Missing or invalid product fields
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 *       409:
 *         description: Product SKU already exists
 *       500:
 *         description: Failed to create product
 */
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

/**
 * @openapi
 * /products/{id}:
 *   patch:
 *     summary: Update a product
 *     description: Admin-only endpoint for updating product details, inventory quantity, and active status.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Desk Lamp
 *               description:
 *                 type: string
 *                 example: Adjustable LED desk lamp with USB charging
 *               priceCents:
 *                 type: integer
 *                 example: 3999
 *               quantity:
 *                 type: integer
 *                 example: 20
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid product ID or invalid input
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to update product
 */
productRoutes.patch('/:id', auth, requireRole('ADMIN'), async (req, res) => {
  try {
    const productId = req.params.id;

    if (typeof productId !== 'string') {
      return res.status(400).json({
        message: 'Invalid product id',
      });
    }

    const { name, description, priceCents, quantity, isActive } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        inventory: true,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(priceCents !== undefined && { priceCents }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      let updatedInventory = existingProduct.inventory;

      if (quantity !== undefined) {
        updatedInventory = await tx.inventory.update({
          where: {
            productId,
          },
          data: {
            quantity,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: req.user!.sub,
          action: 'PRODUCT_UPDATED',
          entityType: 'Product',
          entityId: productId,
          metadata: {
            name,
            description,
            priceCents,
            quantity,
            isActive,
          },
        },
      });

      return {
        ...updatedProduct,
        inventory: updatedInventory,
      };
    });

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Failed to update product',
    });
  }
});

/**
 * @openapi
 * /products/{id}/restore:
 *   patch:
 *     summary: Restore an inactive product
 *     description: Admin-only endpoint that changes a product from inactive back to active.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product restored successfully
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to restore product
 */
productRoutes.patch('/:id/restore', auth, requireRole('ADMIN'), async (req, res) => {
    try {
      const productId = req.params.id;

      if (typeof productId !== 'string') {
        return res.status(400).json({
          message: 'Invalid product id',
        });
    }
      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        return res.status(404).json({
          message: 'Product not found',
        });
      }

      const restoredProduct = await prisma.$transaction(async (tx) => {
        const updatedProduct = await tx.product.update({
          where: {
            id: productId,
          },
          data: {
            isActive: true,
          },
          include: {
            inventory: true,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: req.user!.sub,
            action: 'PRODUCT_UPDATED',
            entityType: 'Product',
            entityId: productId,
            metadata: {
              isActive: true,
              reason: 'Restored soft-deleted product',
            },
          },
        });

        return updatedProduct;
      });

      return res.json(restoredProduct);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: 'Failed to restore product',
      });
    }
  }
);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Deactivate a product
 *     description: Admin-only endpoint that marks a product as inactive instead of permanently deleting it.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deactivated successfully
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to deactivate product
 */
productRoutes.delete('/:id', auth, requireRole('ADMIN'), async (req, res) => {
  try {
    const productId = req.params.id;

    if (typeof productId !== 'string') {
      return res.status(400).json({
        message: 'Invalid product id',
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          isActive: false,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: req.user!.sub,
          action: 'PRODUCT_UPDATED',
          entityType: 'Product',
          entityId: productId,
          metadata: {
            isActive: false,
            reason: 'Soft deleted product',
          },
        },
      });

      return updatedProduct;
    });

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Failed to delete product',
    });
  }
});
