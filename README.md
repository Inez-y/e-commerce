# E-commerce Platform

Full-stack e-commerce platform with a backend API, customer storefront, admin dashboard, background notification worker, PostgreSQL database, Redis queue, Docker Compose, Swagger docs, and integration tests.

## Tech Stack

- Backend: Node.js, Express, TypeScript, Prisma
- Database: PostgreSQL
- Queue/Jobs: Redis, BullMQ
- Frontend: Next.js, React, Tailwind CSS
- Auth: JWT, RBAC
- Testing: Vitest, Supertest
- DevOps: Docker Compose
- Docs: Swagger / OpenAPI

## Features

### Customer
- Browse active products
- View product details
- Add products to cart
- Login
- Checkout and create orders
- View order confirmation

### Admin
- Admin login
- Create products
- Edit products
- Soft-delete products
- View orders
- View notifications
- View audit logs

### Backend
- JWT authentication
- Role-based access control
- Product and inventory management
- Order creation with inventory decrement
- Audit logging
- Background notification jobs
- PostgreSQL persistence
- Redis queue processing
- OpenAPI documentation

## Architecture

```txt
Customer Storefront / Admin Dashboard
              |
              v
        Express API
              |
   -------------------------
   |           |           |
Postgres     Redis     Worker
Products     Queue     Notifications
Orders
Inventory
Audit Logs
````

## Running Locally

### 1. Start infrastructure

```bash
docker compose up -d postgres redis
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Run migrations and seed

```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. Start backend

```bash
npm run dev
```

Backend runs on:

```txt
http://localhost:3000
```

### 5. Start notification worker

```bash
npm run worker:notifications
```

### 6. Start frontend

```bash
cd storefront
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:3001
```

## API Docs

Swagger docs:

```txt
http://localhost:3000/docs
```

## Test

```bash
npm test
```

## Demo Accounts

```txt
Admin:
admin@test.com
password123

Customer:
customer@test.com
password123
```

## Key API Endpoints

```txt
POST   /auth/login
GET    /products
GET    /products/:id
POST   /products
PATCH  /products/:id
DELETE /products/:id

POST   /orders
GET    /orders
GET    /orders/:id

GET    /notifications
GET    /notifications/:id

GET    /admin/products
GET    /admin/audit-logs
```

## Future Improvements

* Payment integration
* Product images
* Search and filtering
* Email provider integration
* OpenTelemetry tracing
* Playwright E2E tests
* Deployment to cloud

