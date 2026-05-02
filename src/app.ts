import 'dotenv/config';
import express from 'express';
import { authRoutes } from './auth/auth.routes';
import { productRoutes } from './products/product.routes';
import { orderRoutes } from './orders/order.routes';
import { notificationRoutes } from './notifications/notification.routes';

export const app = express();

app.get('/', (req, res) => {
    res.json({
        message: "E-commcer API is running.",
        // Chrome safety setting
        routes: {
            health: '/health',
            login: 'POST /auth/login',
            products: 'GET /products',
        },
    });
});

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/notifications', notificationRoutes);
