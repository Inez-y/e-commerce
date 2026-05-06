import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRoutes } from './auth/auth.routes';
import { productRoutes } from './products/product.routes';
import { orderRoutes } from './orders/order.routes';
import { notificationRoutes } from './notifications/notification.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';

export const app = express();

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

app.use(
  cors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  })
);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/notifications', notificationRoutes);
