import { PrismaClient } from '@prisma/client';
import { comparePassword } from './utils/auth/password';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true
      }
    });

    console.log('All users in database:');
    users.forEach(user => {
      console.log({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordLength: user.password.length,
        createdAt: user.createdAt
      });
    });

    // Test password for admin user
    const adminUser = users.find(u => u.email === 'admin@malchincamp.com');
    if (adminUser) {
      console.log('\nTesting admin password...');
      const isValid = await comparePassword('password123', adminUser.password);
      console.log('Password "password123" is valid:', isValid);
    }

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
