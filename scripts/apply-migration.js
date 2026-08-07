const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    const migrationPath = path.join(__dirname, '../prisma/migrations/20260807140000_add_platform_and_primary_to_studio_output/migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('Applying migration: add_platform_and_primary_to_studio_output');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    // Execute each statement separately with error handling
    for (const statement of statements) {
      try {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await prisma.$executeRawUnsafe(statement);
        console.log('✓ Success');
      } catch (error) {
        // If column already exists, skip and continue
        if (error.code === 'P2010' && error.meta?.message?.includes('already exists')) {
          console.log('⊘ Skipped (already exists)');
        } else {
          throw error;
        }
      }
    }
    
    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
