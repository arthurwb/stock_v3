import { config } from 'dotenv';
config(); // Load environment variables from .env file

import { PrismaClient } from '@prisma/client';
import { Decimal } from '@keystone-6/core/types';

import { populateCarrots } from './populateCarrots';
import { populateHistoricalPrices } from './populateHP';
import { isConstructorDeclaration } from 'typescript';

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

async function seed() {
  console.log("starting seeding process...");

  if (await tableExists("tOptions")) { 
    console.log("Deleting options table");
    await prisma.tOptions.deleteMany({}); 
  }

  if (await tableExists("tUsers")) { 
    console.log("Deleting users table");
    await prisma.tUsers.deleteMany({});
  }

  if (await tableExists("tMarket")) {
    console.log("Deleting market table")
    await prisma.tMarket.deleteMany({})
  }

  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedSamplePassword = await bcrypt.hash('password', 10);

  // Seed sample users
  await prisma.tUsers.create({
    data: {
      userEmail: 'admin@exchange.com',
      userUsername: 'admin',
      userPassword: hashedAdminPassword, // Make sure to hash this in a real scenario
      userWallet: 100000.00,
    },
  });

  await prisma.tUsers.create({
    data: {
        userEmail: 'sampleUser@exchange.com',
        userUsername: 'sample',
        userPassword: hashedSamplePassword, // Hash this in a real scenario
        userWallet: 0.00,
    },
  });

  // Seed sample options
  await prisma.tOptions.create({
    data: {
      optionName: 'groogle',
      optionShort: 'goog',
      optionDescription: 'Groogle is a global technology company that specializes in internet services, including search, advertising, cloud computing, and software development. It also develops products like Android, Groogle Clrome, and Groogle Subordinate, revolutionizing how people access information and interact with technology.',
      optionPrice: 166.85,
      optionBankruptcy: false,
    },
  });

  await prisma.tOptions.create({
    data: {
      optionName: 'canadian express',
      optionShort: 'cnex',
      optionDescription: 'Canadian Express is a leading banking institution offering a wide range of financial services, including personal banking, business banking, and investment solutions. With a commitment to customer-centric innovation, the company provides secure, efficient, and accessible banking options for individuals and businesses across Canada.',
      optionPrice: 281.19,
      optionBankruptcy: false,
    },
  });

  await prisma.tOptions.create({
    data: {
      optionName: 'cuviax',
      optionShort: 'cuva',
      optionDescription: 'CuviaX is a cutting-edge tech company specializing in the design and development of advanced chipsets and high-performance computer hardware. With a focus on innovation and precision, CuviaX empowers industries to push the boundaries of computing, delivering powerful and efficient solutions for the next generation of technology.',
      optionPrice: 113.89,
      optionBankruptcy: false,
    },
  });

  await prisma.tOptions.create({
    data: {
      optionName: 'michaelsoft',
      optionShort: 'msft',
      optionDescription: 'Michael Soft is a global technology powerhouse founded and led by a single visionary, Michael, specializing in software development, cloud services, and cutting-edge digital solutions. With a focus on innovation and user-centric products, Michael Soft competes with industry giants to transform the way people and businesses interact with technology on a global scale.',
      optionPrice: 439.43,
      optionBankruptcy: false,
    },
  });

  await prisma.tOptions.create({
    data: {
      optionName: 'appalachia',
      optionShort: 'apla',
      optionDescription: 'Appalachia is a leading online marketplace that offers a wide variety of name-brand products, ranging from electronics to home goods, all sourced from the Appalachian region. With a focus on quality and customer satisfaction, Appalachia provides a seamless shopping experience, delivering top-tier products from one of the most abundant and diverse areas in the country.',
      optionPrice: 187.98,
      optionBankruptcy: false,
    },
  });

  await prisma.tOptions.create({
    data: {
      optionName: 'lockhead technologies',
      optionShort: 'lock',
      optionDescription: 'Lockhead Technologies is a global defense contractor specializing in the design and production of advanced weapons systems for major governments and military organizations worldwide. With a reputation for precision and innovation, the company also provides cutting-edge solutions to smaller, emerging nations seeking to enhance their defense capabilities.',
      optionPrice: 472.20,
      optionBankruptcy: false,
    },
  });

  await prisma.tMarket.create({
    data: {
      mName: 'current',
      mType: 'squirrel'
    }
  });

  console.log("Seeding completed!");
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
