import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('Applying PostMedia migration...');
    
    // Read the migration SQL file
    const migrationPath = join(__dirname, '../prisma/migrations/20260812110000_add_postmedia/migration.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    // Split SQL commands by semicolon and filter empty lines
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    // Execute each command separately
    for (const command of commands) {
      await prisma.$executeRawUnsafe(command);
      console.log(`✓ Executed: ${command.substring(0, 50)}...`);
    }
    
    console.log('✓ Migration applied successfully');
    console.log('✓ PostMedia table created');
  } catch (error) {
    console.error('Error applying migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
