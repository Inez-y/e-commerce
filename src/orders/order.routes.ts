import { Router } from 'express';
import { prisma } from '../prisma';
import { auth } from '../middleware/auth';
import { createNotification } from '../notifications/notification.service';

export const orderRoutes = Router();

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Create an order
 *     description: Customer creates an order from cart items. Inventory is decremented transactionally.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: e4b05094-20a1-49c4-81d8-d0e4e4fa993d
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Order created
 *       400:
 *         description: Invalid order or insufficient inventory
 *       401:
 *         description: Missing or invalid token
 */
orderRoutes.post('/', auth, async(req, res)=> {
    try {
        const { items } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: 'Items must be a non-empty array.'
            });
        }

        const userId = req.user!.sub;
        
        console.log('[Orders] Creating order...');
        const result = await prisma.$transaction(async(tx) => {
            let totalCents = 0;
            const createdItems = [];

            const order = await tx.order.create({
                data: {
                    userId,
                    status: 'PENDING',
                    totalCents: 0,
                },
            });

            for (const item of items) {
                const { productId, quantity } = item;
                
                if (!productId || !quantity || quantity <= 0) {
                    throw new Error('Invalid order item');
                }

                const product = await tx.product.findFirst({
                    where: {
                        id: productId,
                        isActive: true,
                    },
                    include: {
                        inventory: true,
                    },
                });

                if (!product) {
                    throw new Error(`Product not found: ${productId}`);
                }
                if (!product.inventory) {
                    throw new Error(`Inventory not found for product: ${productId}`);
                }

                const availableQuantity = product.inventory.quantity - product.inventory.reserved;

                if (availableQuantity < quantity) {
                    throw new Error(`Not enough inventory for product: ${product.name}`);
                }

                const subtotalCents = product.priceCents * quantity;
                totalCents += subtotalCents;

                const orderItem = await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: product.id,
                        quantity,
                        unitPriceCents: product.priceCents,
                        subtotalCents,
                    },
                });

                await tx.inventory.update({
                    where: {
                        productId: product.id,
                    },
                    data: {
                        quantity: {
                            decrement: quantity,
                        },
                    },
                });

                createdItems.push(orderItem);
            }

            const updateOrder = await tx.order.update({
                where: {
                    id: order.id,
                },
                data: {
                    totalCents,
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            await tx.auditLog.create({
                data: {
                    userId,
                    action: 'ORDER_CREATED',
                    entityType: 'Order',
                    entityId: updateOrder.id,
                    metadata: {
                        totalCents,
                        itemCount: createdItems.length,
                    },
                },
            });

            return updateOrder;
        });

        console.log('[Orders] Order created:', result.id);
        console.log('[Orders] Creating notification...');

        // Working with notification worker
        await createNotification({
            type: 'ORDER_CREATED',
            recipientEmail: req.user!.email,
            subject: 'Your order was created',
            body: `Your order ${result.id} was created successfully. 
                    Total: $${( result.totalCents / 100 ).toFixed(2)}`,
        });
        
        console.log('[Orders] Notification queued.');

        return res.status(201).json(result);
    }
    catch (error: any) {
        console.error(error);

        return res.status(400).json({
            message: error.message || 'Failed to create order.',
        });
    }
});

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: List orders
 *     description: Admins see all orders. Customers see only their own orders.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Missing or invalid token
 */
orderRoutes.get('/', auth, async(req, res)=> {
    try {
        const user = req.user!;
        const orders = await prisma.order.findMany({
            where:
                user.role === 'ADMIN' ? {} :  { userId: user.sub, },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return res.json(orders);
    }
    catch (error: any) {
        console.error(error);

        return res.status(500).json({
            message: 'Failed to create order.',
        });
    }
});

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Admins can view any order. Customers can view only their own order.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Order not found
 */
orderRoutes.get('/:id', auth, async (req, res) => {
  try {
    const orderId = req.params.id;

    if (typeof orderId !== 'string') {
      return res.status(400).json({
        message: 'Invalid order id',
      });
    }

    const user = req.user!;

    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            ...(user.role !== 'ADMIN' && { userId: user.sub, }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
            });
        }

        return res.json(order);
    }
    catch (error: any) {
        console.error(error);

        return res.status(500).json({
            message: 'Failed to fetch order.',
        });
    }
});
