import { config } from 'dotenv';
config(); // Load environment variables from .env file

import { PrismaClient } from '@prisma/client';
import { Decimal } from '@keystone-6/core/types';

import { populateCarrots } from './populateCarrots';
import { populateHistoricalPrices } from './populateHP';

const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Check if table exists
async function tableExists(tableName: string): Promise<boolean> {
  const dbNameResult = await prisma.$queryRaw<Array<{ db: string }>>`SELECT DATABASE() AS db`;
  const dbName = dbNameResult[0].db;

  const result = await prisma.$queryRaw<Array<{ count: number }>>`
    SELECT COUNT(*) as count
    FROM information_schema.tables
    WHERE table_schema = ${dbName}
    AND table_name = ${tableName};
  `;

  return result[0]?.count > 0;
}

// Create a table if it doesn't exist
async function createTable(tableName: string) {
  console.log(`Creating table: ${tableName}`);
  if (tableName === 'tCarrots') {
    await prisma.$queryRaw`
      CREATE TABLE tCarrots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL
      );
    `;
  } else if (tableName === 'tHistoricalPrices') {
    await prisma.$queryRaw`
      CREATE TABLE tHistoricalPrices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        price DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL
      );
    `;
  } else if (tableName === 'tOptions') {
    await prisma.$queryRaw`
      CREATE TABLE tOptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        optionName VARCHAR(255) NOT NULL,
        optionPrice DECIMAL(10, 2) NOT NULL
      );
    `;
  } else if (tableName === 'tUsers') {
    await prisma.$queryRaw`
      CREATE TABLE tUsers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userEmail VARCHAR(255) NOT NULL,
        userUsername VARCHAR(255) NOT NULL,
        userPassword VARCHAR(255) NOT NULL,
        userWallet DECIMAL(10, 2) NOT NULL
      );
    `;
  }
}

async function seed() {
  console.log("starting seeding process...");

  // Check if tables exist and create them if not
  const tablesToCheck = ['tCarrots', 'tHistoricalPrices', 'tOptions', 'tUsers'];

  for (const table of tablesToCheck) {
    if (!(await tableExists(table))) {
      await createTable(table);
    }
  }

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
