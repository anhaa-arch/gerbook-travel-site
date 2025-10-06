import { PrismaClient } from '@prisma/client';
import { comparePassword } from './utils/auth/password';
import { generateToken } from './utils/auth/jwt';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('Testing login process...\n');

    // Step 1: Find user by email
    const email = 'admin@malchincamp.com';
    const password = 'password123';

    console.log('1. Looking for user with email:', email);
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Step 2: Compare password
    console.log('\n2. Comparing password...');
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Password is invalid');
      return;
    }

    console.log('✅ Password is valid');

    // Step 3: Generate token
    console.log('\n3. Generating token...');
    const token = generateToken(user);
    console.log('✅ Token generated:', token.substring(0, 50) + '...');

    // Step 4: Final result
    console.log('\n🎉 Login successful!');
    console.log('AuthPayload:', {
      token: token.substring(0, 50) + '...',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error during login test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
