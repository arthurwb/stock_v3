// createUser.ts
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Simple password hashing function to simulate Keystone's password field
function hashPassword(password: string): string {
  // This is a simplified version - Keystone uses a more complex method
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `pbkdf2_sha512$${salt}$${hash}`;
}

async function createUser(email: string): Promise<void> {
  if (!email || !email.includes('@')) {
    console.error('Invalid email format. Please provide a valid email address.');
    process.exit(1);
  }

  // Extract username from email (part before @)
  const username = email.split('@')[0];
  const password = 'admin123';
  
  try {
    // Check if user with this email already exists
    const existingUserByEmail = await prisma.tUsers.findUnique({
      where: { userEmail: email }
    });

    if (existingUserByEmail) {
      console.error(`User with email ${email} already exists.`);
      process.exit(1);
    }

    // Check if user with this username already exists
    const existingUserByUsername = await prisma.tUsers.findUnique({
      where: { userUsername: username }
    });

    if (existingUserByUsername) {
      console.error(`User with username ${username} already exists.`);
      process.exit(1);
    }

    // Create the user
    const hashedPassword = hashPassword(password);
    const newUser = await prisma.tUsers.create({
      data: {
        userEmail: email,
        userUsername: username,
        userPassword: hashedPassword,
        userWallet: 1000.00, // Default starting wallet balance
      }
    });

    console.log(`User created successfully!`);
    console.log(`Email: ${newUser.userEmail}`);
    console.log(`Username: ${newUser.userUsername}`);
    console.log(`Initial wallet balance: $${newUser.userWallet}`);
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument.');
  console.log('Usage: npx ts-node createUser.ts user@example.com');
  process.exit(1);
}

// Run the function
createUser(email)
  .then(() => console.log('Script completed'))
  .catch((error) => console.error('Error:', error));