import 'dotenv/config';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app';

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
                    }
                ]
            })
            .expect(201);

        const order = createOrder.body;
        expect(order.id).toBeTruthy();
        expect(order.totalCents).toBe(5000);
        expect(order.items).toHaveLength(1);
        expect(order.items[0].quantity).toBe(2);

        const getProduct = await request(app)
            .get(`/products/${product.id}`)
            .expect(200);

        expect(getProduct.body.inventory.quantity).toBe(8);
    });
});
