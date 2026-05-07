import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const testProducts = await prisma.product.findMany({
    where: {
      sku: {
        startsWith: 'TEST-',
      },
    },
    select: {
      id: true,
    },
  });

  const productIds = testProducts.map((product) => product.id);

  console.log(`Found ${productIds.length} test products.`);

  if (productIds.length === 0) {
    return;
  }

  await prisma.orderItem.deleteMany({
    where: {
      productId: {
        in: productIds,
      },
    },
  });

  await prisma.inventory.deleteMany({
    where: {
      productId: {
        in: productIds,
      },
    },
  });

  await prisma.product.deleteMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  console.log('Deleted old test products.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
