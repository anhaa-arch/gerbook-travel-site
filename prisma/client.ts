import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient
const prisma = new PrismaClient();

// Handle connection errors
prisma.$connect()
  .then(() => {
    console.log('Connected to MySQL database');
  })
  .catch((error) => {
    console.error('Failed to connect to MySQL database:', error);
    process.exit(1);
  });

// Handle process termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from MySQL database');
});

export default prisma;