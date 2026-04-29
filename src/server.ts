import express from 'express';
import dotenv from 'dotenv';
import { authRoutes } from './auth/auth.routes';
import { productRoutes } from './products/product.routes';
import { orderRoutes } from './orders/order.routes';

dotenv.config();

const app = express();

app.use(express.json());

// For chrome safety setting
app.get('/', (req, res) => {
  res.json({
    message: 'E-commerce API is running',
    routes: {
      health: '/health',
      login: 'POST /auth/login',
      products: 'GET /products',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
