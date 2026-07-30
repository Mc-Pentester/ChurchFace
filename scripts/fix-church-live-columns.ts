import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixChurchLiveColumns() {
  try {
    console.log('Adding missing columns to ChurchLive table...');

    // Get existing columns from information schema
    const existingColumns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ChurchLive'
    `;

    const existingColumnNames = existingColumns.map(c => c.column_name);
    console.log('Existing columns:', existingColumnNames);

    const columnsToAdd = [
      'description',
      'playUrl',
      'scheduledEnd',
      'scheduledStart',
      'streamMode',
      'studioConfig',
      'outputDestinations'
    ];

    for (const column of columnsToAdd) {
      if (existingColumnNames.includes(column)) {
        console.log(`Column ${column} already exists`);
        continue;
      }

      console.log(`Adding column ${column}...`);
      
      let sql = '';
      switch (column) {
        case 'description':
          sql = `ALTER TABLE "ChurchLive" ADD COLUMN "description" TEXT`;
          break;
        case 'playUrl':
          sql = `ALTER TABLE "ChurchLive" ADD COLUMN "playUrl" TEXT`;
          break;
        case 'scheduledEnd':
          sql = `ALTER TABLE "ChurchLive" ADD COLUMN "scheduledEnd" TIMESTAMP`;
          break;
        case 'scheduledStart':
          sql = `ALTER TABLE "ChurchLive" ADD COLUMN "scheduledStart" TIMESTAMP`;
          break;
        case 'streamMode':
          sql = `ALTER TABLE "ChurchLive" ADD COLUMN "streamMode" TEXT`;
          break;
        case 'studioConfig':
          sql = `ALTER TABLE "ChurchLive" ADD COLUMN "studioConfig" JSONB`;
          break;
        case 'outputDestinations':
          sql = `ALTER TABLE "ChurchLive" ADD COLUMN "outputDestinations" JSONB`;
          break;
      }

      if (sql) {
        await prisma.$executeRawUnsafe(sql);
        console.log(`✅ Column ${column} added`);
      }
    }

    console.log('✅ ChurchLive columns fixed successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixChurchLiveColumns();
