import { config } from 'dotenv';
config(); // Load environment variables from .env file

import { PrismaClient } from '@prisma/client';
import { Decimal } from '@keystone-6/core/types';

import { populateCarrots } from './populateCarrots'
import { populateHistoricalPrices } from './populateHP';

const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function tableExists(tableName: string): Promise<boolean> {
  const result = await prisma.$queryRaw<
    Array<{ exists: boolean }>
  >`SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = ${tableName}
  ) AS exists;`;

  return result[0]?.exists ?? false;
}

async function seed() {
  console.log("starting seeding process...");

  // Clear existing data (optional, for testing)
  if (await tableExists("tCarrots")) { 
    console.log("Deleting carrots table");
    await prisma.tCarrots.deleteMany({}); 
  }
  if (await tableExists("tHistoricalPrices")) { 
    console.log("Deleting historical prices table");
    await prisma.tHistoricalPrices.deleteMany({}); 
  }
  if (await tableExists("tOptions")) { 
    console.log("Deleting options table");
    await prisma.tOptions.deleteMany({}); 
  }
  if (await tableExists("tUsers")) { 
    console.log("Deleting users table");
    await prisma.tUsers.deleteMany({});
  }

  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedSamplePassword = await bcrypt.hash('password', 10);

  // Seed sample users
  const adminUser = await prisma.tUsers.create({
    data: {
      userEmail: 'admin@exchange.com',
      userUsername: 'admin',
      userPassword: hashedAdminPassword, // Make sure to hash this in a real scenario
      userWallet: 100000.00,
    },
  });

  const sampleUser = await prisma.tUsers.create({
    data: {
        userEmail: 'sampleUser@exchange.com',
        userUsername: 'sample',
        userPassword: hashedSamplePassword, // Hash this in a real scenario
        userWallet: 0.00,
    },
  });

  // Seed sample options
  const googleOption = await prisma.tOptions.create({
    data: {
      optionName: 'google',
      optionPrice: 500,
    },
  });

  const microsoftOption = await prisma.tOptions.create({
    data: {
      optionName: 'microsoft',
      optionPrice: 500,
    },
  });

  const amazonOption = await prisma.tOptions.create({
    data: {
      optionName: 'amazon',
      optionPrice: 500,
    },
  });

  // Seed sample carrots
  const users = {
    admin: adminUser,
    sample: sampleUser
  };
  const options = {
    google: googleOption,
    microsoft: microsoftOption,
    amazon: amazonOption
  };
  populateCarrots(prisma, options, users);
  populateHistoricalPrices(prisma, options);

  console.log("Seeding completed!");
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});