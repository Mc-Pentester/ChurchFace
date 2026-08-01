import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMissingTables() {
  try {
    console.log('Checking for missing tables...');

    // Get existing tables from information schema
    const existingTables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `;

    const existingTableNames = existingTables.map(t => t.table_name);
    console.log('Existing tables:', existingTableNames.length);

    // Tables that should exist according to schema
    const requiredTables = [
      'PrayerLiveRoomMember',
      // Add other tables if needed
    ];

    for (const table of requiredTables) {
      if (existingTableNames.includes(table)) {
        console.log(`Table ${table} already exists`);
        continue;
      }

      console.log(`Adding table ${table}...`);

      let sql = '';
      switch (table) {
        case 'PrayerLiveRoomMember':
          sql = `
            CREATE TABLE "PrayerLiveRoomMember" (
              "id" TEXT NOT NULL,
              "roomId" TEXT NOT NULL,
              "userId" TEXT NOT NULL,
              "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT "PrayerLiveRoomMember_pkey" PRIMARY KEY ("id")
            );
            
            ALTER TABLE "PrayerLiveRoomMember" ADD CONSTRAINT "PrayerLiveRoomMember_roomId_userId_key" UNIQUE ("roomId", "userId");
            
            CREATE INDEX "PrayerLiveRoomMember_roomId_idx" ON "PrayerLiveRoomMember"("roomId");
            CREATE INDEX "PrayerLiveRoomMember_userId_idx" ON "PrayerLiveRoomMember"("userId");
            
            ALTER TABLE "PrayerLiveRoomMember" ADD CONSTRAINT "PrayerLiveRoomMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "PrayerLiveRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            ALTER TABLE "PrayerLiveRoomMember" ADD CONSTRAINT "PrayerLiveRoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          `;
          break;
      }

      if (sql) {
        // Split SQL commands and execute them one by one
        const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);
        for (const command of commands) {
          await prisma.$executeRawUnsafe(command);
        }
        console.log(`✅ Table ${table} added`);
      }
    }

    console.log('✅ Missing tables added successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingTables();
