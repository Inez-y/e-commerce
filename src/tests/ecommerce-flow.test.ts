import 'dotenv/config';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { app } from '../app';
import { prisma } from '../prisma';

// Prevent timeout error due to open handles 
afterAll(async () => {
  await prisma.$disconnect();
});

describe('E-commerce API flow', () => {
    it('Allows admin to create a product and custoemr to create an order.', async() => {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const customerEmail = process.env.CUSTOMER_EMAIL;
        const customerPassword = process.env.CUSTOMER_PASSWORD;

        expect(adminEmail).toBeTruthy();
        expect(adminPassword).toBeTruthy();
        expect(customerEmail).toBeTruthy();
        expect(customerPassword).toBeTruthy();

        // Admin
        const adminLogin = await request(app)
            .post('/auth/login')
            .send({
                email: adminEmail,
                password: adminPassword,
            })
            .expect(200);

        const adminToken = adminLogin.body.accessToken;
        console.log('ADMIN LOGIN STATUS:', adminLogin.status);
        console.log('ADMIN LOGIN BODY:', adminLogin.body);
        expect(adminToken).toBeTruthy();

        const uniqueSKU = `TEST-${Date.now()}`;

        const createProduct = await request(app)
            .post('/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Product',
                description: 'Created from integration test',
                sku: uniqueSKU,
                priceCents: 2500,
                quantity: 10,
            })
            .expect(201);
        
        const product = createProduct.body;
        expect(product.id).toBeTruthy();
        expect(product.sku).toBe(uniqueSKU);
        expect(product.inventory.quantity).toBe(10);

        // Customer
        const customerLogin = await request(app)
            .post('/auth/login')
            .send({
                email: customerEmail,
                password: customerPassword,
            })
            .expect(200);

        const customerToken = customerLogin.body.accessToken;
        console.log('CUSTOMER LOGIN STATUS:', customerLogin.status);
        console.log('CUSTOMER LOGIN BODY:', customerLogin.body);
        expect(customerToken).toBeTruthy();

        const createOrder = await request(app)
            .post('/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                items: [
                    {
                        productId: product.id,
                        quantity: 2,
                    },
                ],
            })
            .expect(201);

        console.log('[Test] Create order response received.');

        const order = createOrder.body;
        console.log('[Test] Checking order assertions...');

        expect(order.id).toBeTruthy();
        expect(order.totalCents).toBe(5000);
        expect(order.items).toHaveLength(1);
        expect(order.items[0].quantity).toBe(2);
        expect(order.items[0].unitPriceCents).toBe(2500);
        expect(order.items[0].subtotalCents).toBe(5000);

        console.log('[Test] Fetching product after order...');
        const getProduct = await request(app)
            .get(`/products/${product.id}`)
            .expect(200);
        console.log('[Test] Product fetched after order.');

        expect(getProduct.body.inventory.quantity).toBe(8);

        console.log('[Test] Checking notification row...');
        // Notification
        const notifications = await prisma.notification.findMany({
        where: {
            recipientEmail: customerEmail,
            type: 'ORDER_CREATED',
            },
        orderBy: {
            createdAt: 'desc',
            },
        });

        console.log('[Test] Notification rows found:', notifications.length);
        expect(notifications.length).toBeGreaterThan(0);
        expect(notifications[0].status).toBe('PENDING');

        console.log('[Test] Finished all assertions for flow test.');
    }, 10000);
});
