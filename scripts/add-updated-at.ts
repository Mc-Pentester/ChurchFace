import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addUpdatedAtColumn() {
  try {
    console.log('Adding updatedAt column to Church table...');

    // Get existing columns from information schema
    const existingColumns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Church'
    `;

    const existingColumnNames = existingColumns.map(c => c.column_name);
    console.log('Existing columns:', existingColumnNames);

    if (existingColumnNames.includes('updatedAt')) {
      console.log('Column updatedAt already exists');
    } else {
      console.log('Adding column updatedAt...');
      
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Church" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      `);
      
      console.log('✅ Column updatedAt added');
    }

    console.log('✅ Church table updated successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addUpdatedAtColumn();
