import { PrismaClient } from '@prisma/client';

// Use staging database URL if provided, otherwise use default
const stagingUrl = process.env.DATABASE_URL_STAGING || process.env.DATABASE_URL;

if (!stagingUrl) {
  console.error('DATABASE_URL_STAGING or DATABASE_URL environment variable is required');
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: stagingUrl!,
    },
  },
});

async function fixStagingDatabase() {
  try {
    console.log('Connecting to staging database...');
    console.log('Database URL:', stagingUrl!.replace(/:[^:@]+@/, ':****@'));

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

    console.log('✅ Staging database fixed successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixStagingDatabase();
