// clearDatabase.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('Starting database clearing process...');

  try {
    // Clear tables in reverse order of dependencies to avoid foreign key constraint issues
    
    // First, clear the UserQueue table
    console.log('Clearing tUserQueue...');
    await prisma.tUserQueue.deleteMany({});
    console.log('tUserQueue cleared successfully');
    
    // Then clear the Carrots table
    console.log('Clearing tCarrots...');
    await prisma.tCarrots.deleteMany({});
    console.log('tCarrots cleared successfully');
    
    // Then clear HistoricalPrices
    console.log('Clearing tHistoricalPrices...');
    await prisma.tHistoricalPrices.deleteMany({});
    console.log('tHistoricalPrices cleared successfully');
    
    // Clear Users table
    console.log('Clearing tUsers...');
    await prisma.tUsers.deleteMany({});
    console.log('tUsers cleared successfully');
    
    // Finally, clear Options table
    console.log('Clearing tOptions...');
    await prisma.tOptions.deleteMany({});
    console.log('tOptions cleared successfully');
    
    console.log('All tables have been cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
clearDatabase()
  .then(() => console.log('Database clearing script completed'))
  .catch((error) => console.error('Error in database clearing script:', error));