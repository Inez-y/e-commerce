import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminPasswordHash = await bcrypt.hash('password123', 10);
    const customerPasswordHash = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.upsert({
        where: {
            email: 'admin@test.com',
        },
        update: {},
        create: {
            email: 'admin@test.com',
            passwordHash: adminPasswordHash,
            role: 'ADMIN',
        },
    });

    const customer = await prisma.user.upsert({
        where: {
            email: 'customer@test.com',
        },
        update: {},
        create: {
            email: 'customer@test.com',
            passwordHash: customerPasswordHash,
            role: 'CUSTOMER',
        },
    });

    const products = [
        {
            name: 'Mechanical Keyboard',
            description: 'A compact mechanical keyboard with blue switches.',
            sku: 'KEYBOARD-001',
            priceCents: 7999,
            quantity: 25,
        },
        {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with adjustable DPI.',
        sku: 'MOUSE-001',
        priceCents: 3999, 
        quantity: 40,
        },
        {
        name: 'USB-C Hub',
        description: 'Multi-port USB-C hub with HDMI and Ethernet.',
        sku: 'HUB-001',
        priceCents: 4999,
        quantity: 15,
        },
    ];

    for (const product of products) {
        const createdProduct = await prisma.product.upsert({
            where: {
                sku: product.sku,
            },
            update: {
                name: product.name,
                description: product.description,
                priceCents: product.priceCents,
                isActive: true,
            },
            create: {
                name: product.name,
                description: product.description,
                priceCents: product.priceCents,
                isActive: true,
                sku: product.sku,
            },
        });

        await prisma.inventory.upsert({
            where: {
                productId: createdProduct.id,
            },
            update: {
                quantity: product.quantity,
                reserved: 0,
            },
            create: {
                productId: createdProduct.id,
                quantity: product.quantity,
                reserved: 0,
            },
        });
    }

    console.log('[Database] Prisma seed completed.');
    console.log({
        admin: admin.email,
        customer: customer.email,
        productCount: products.length,
    });
}

// Call main
main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }).finally(async ()=> {
        await prisma.$disconnect();
    });