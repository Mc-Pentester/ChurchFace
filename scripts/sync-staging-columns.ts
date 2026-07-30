import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

// Get staging database URL from environment
const stagingDbUrl = process.env.DATABASE_URL_STAGING;

if (!stagingDbUrl) {
  console.error('DATABASE_URL_STAGING environment variable is required');
  process.exit(1);
}

// Create a Prisma client for staging
const stagingPrisma = new PrismaClient({
  datasources: {
    db: {
      url: stagingDbUrl,
    },
  },
});

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

async function getTableColumns(client: PrismaClient, tableName: string): Promise<Set<string>> {
  const columns = await client.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = ${tableName}
  `;
  return new Set(columns.map(c => c.column_name));
}

async function addMissingColumn(
  client: PrismaClient,
  tableName: string,
  columnName: string,
  columnDefinition: string
) {
  try {
    await client.$executeRawUnsafe(`
      ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "${columnName}" ${columnDefinition}
    `);
    console.log(`✅ Added column ${columnName} to table ${tableName}`);
  } catch (error) {
    console.error(`❌ Failed to add column ${columnName} to table ${tableName}:`, error);
  }
}

async function syncTableColumns(tableName: string, columnDefinitions: Record<string, string>) {
  console.log(`\n🔍 Syncing table: ${tableName}`);
  
  try {
    // Get columns from both databases
    const localColumns = await getTableColumns(prisma, tableName);
    const stagingColumns = await getTableColumns(stagingPrisma, tableName);
    
    console.log(`  Local columns: ${localColumns.size}`);
    console.log(`  Staging columns: ${stagingColumns.size}`);
    
    // Find missing columns in staging
    const missingColumns = Array.from(localColumns).filter(col => !stagingColumns.has(col));
    
    if (missingColumns.length === 0) {
      console.log(`  ✅ Table ${tableName} is already in sync`);
      return;
    }
    
    console.log(`  Missing columns in staging: ${missingColumns.join(', ')}`);
    
    // Add missing columns
    for (const columnName of missingColumns) {
      const columnDefinition = columnDefinitions[columnName];
      if (columnDefinition) {
        await addMissingColumn(stagingPrisma, tableName, columnName, columnDefinition);
      } else {
        console.warn(`⚠️  No definition found for column ${columnName}, skipping`);
      }
    }
  } catch (error) {
    console.error(`❌ Error syncing table ${tableName}:`, error);
  }
}

async function main() {
  console.log('🚀 Starting staging database column sync...\n');
  
  // Define column definitions for tables that might have missing columns
  // Format: tableName -> { columnName -> SQL column definition }
  const tableDefinitions: Record<string, Record<string, string>> = {
    Church: {
      updatedAt: 'TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP',
      schedule: 'TEXT',
    },
    ChurchLive: {
      description: 'TEXT',
      playUrl: 'TEXT',
      scheduledEnd: 'TIMESTAMP(3)',
      scheduledStart: 'TIMESTAMP(3)',
      streamMode: 'TEXT',
      studioConfig: 'JSONB',
      outputDestinations: 'JSONB',
    },
    ChurchPost: {
      generated: 'BOOLEAN NOT NULL DEFAULT false',
      generatedType: 'TEXT',
      generatedId: 'TEXT',
    },
  };
  
  // Sync each table
  for (const tableName of Object.keys(tableDefinitions)) {
    await syncTableColumns(tableName, tableDefinitions[tableName]);
  }
  
  console.log('\n✅ Staging database column sync completed');
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await stagingPrisma.$disconnect();
  });
