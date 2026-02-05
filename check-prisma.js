const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Prisma Client connected successfully!');
    await prisma.$disconnect();
  } catch (e) {
    console.error('Prisma Client failed to connect:', e);
    process.exit(1);
  }
}

main();
