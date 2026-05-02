import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app';
import env from 'dotenv';

describe('E-commerce API flow', () => {
    it('Allows admin to create a product and custoemr to create an order.', async() => {
        // Admin
        const adminLogin = await request(app)
            .post('/auth/login')
            .send({
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
            })
            .expect(200);

        const adminToken = adminLogin.body.accessToken;
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
                email: process.env.CUSTOMER_LOGIN,
                password: process.env.CUSTOMER_PASSWORD,
            })
            .expect(200);

    })
});