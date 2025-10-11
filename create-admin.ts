import { PrismaClient } from '@prisma/client';
import { hashPassword } from './utils/auth/password';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const hashedPassword = await hashPassword('admin123');
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@malchincamp.com',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'ADMIN'
      }
    });

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role
    });

    console.log('Admin login credentials:');
    console.log('Email: admin@malchincamp.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdminUser();