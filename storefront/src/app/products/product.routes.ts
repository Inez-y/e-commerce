import { Router } from 'express';
import { prisma } from '../../../../src/prisma';
import { auth } from '../../../../src/middleware/auth';
import { requireRole } from '../../../../src/middleware/requireRole';

export const productRoutes = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     summary: List active products
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of active products
 */

/**
 * GET /products
 * Public storefront product list
 */
productRoutes.get('/', async(req, res) => {
    try {
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: ' Failed to fetch products.'
        });
    }
});

/**
 * GET /products/:id
 * Public product detail
 */
productRoutes.get('/:id', async(req, res) => {
    console.log('[Products] GET product by id hit:', req.params.id);
    
    try {
        const productId = req.params.id;

        if (typeof productId !== 'string') {
            return res.status(400).json({
                message: 'Invalid product id',
            });
        }

        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                isActive: true,
            },
            include: {
                inventory: true,
            },
        });

        if (!product) {
            return res.status(404).json({
                message: 'Product not found.'
            });
        }

        return res.json(product);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Failed to fetch product.'
        });
    }
});

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Create a product
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
 *                 example: Laptop Stand
 *               description:
 *                 type: string
 *                 example: Adjustable aluminum laptop stand
 *               sku:
 *                 type: string
 *                 example: STAND-001
 *               priceCents:
 *                 type: integer
 *                 example: 5999
 *               quantity:
 *                 type: integer
 *                 example: 20
 *     responses:
 *       201:
 *         description: Product created
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Admin access required
 *       409:
 *         description: SKU already exists
 */

/**
 * POST /products
 * Admin creates product, in
 */
productRoutes.post('/', auth, requireRole('ADMIN'), async(req, res) => {
    try {
        const { name, description, sku, priceCents, quantity } = req.body;

        if (!name || !sku || priceCents == null || quantity == null) {
            return res.status(400).json({
                message: ' name, sku, priceCents, and quantity are required',
            });
        }

        if (priceCents < 0 || quantity < 0) {
            return res.status(400).json({
                message: ' priceCents and quantity must be non-negative',
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
    }
    catch (error: any) {
        console.error(error);

        if (error.code === 'P2002') {
            return res.status(409).json({
                message: ' A product already exists.'
            });
        }

        return res.status(500).json({
            message: ' Failed to create product.'
        });
    }
});

/**
 * PATCH /products/:id
 * Let admin update product and inventory(optional)
 */
productRoutes.patch('/:id', auth, requireRole('ADMIN'), async(req, res) => {
    try {
        const { name, description, priceCents, quantity, isActive } = req.body;

        const productId = req.params.id;
        if (typeof productId !== 'string') {
            return res.status(400).json({
                message: 'Invalid product id',
            });
        }

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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: ' Failed to update product.',
        });
    }
});

/**
 * DELETE /productts/:id
 * Admin soft-deletes product
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
        message: ' Product not found.',
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
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({
      message: ' Failed to delete product',
    });
  }
});
