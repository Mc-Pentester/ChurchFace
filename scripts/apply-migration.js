const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    const migrationPath = path.join(__dirname, '../prisma/migrations/20260814190000_add_unified_prayer_model/migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('Applying migration: add_unified_prayer_model');
    
    // Split SQL into statements, preserving DO $$ ... END $$ blocks
    const statements = [];
    let currentStatement = '';
    let inDoBlock = false;
    
    const lines = migrationSQL.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments
      if (trimmedLine.startsWith('--')) continue;
      
      // Track DO $$ blocks
      if (trimmedLine.toUpperCase().startsWith('DO $$')) {
        inDoBlock = true;
      }
      
      currentStatement += line + '\n';
      
      // End of DO $$ block
      if (inDoBlock && trimmedLine === 'END $$;') {
        inDoBlock = false;
        statements.push(currentStatement.trim());
        currentStatement = '';
        continue;
      }
      
      // End of regular statement (only if not in DO block)
      if (!inDoBlock && trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await prisma.$executeRawUnsafe(statement);
        console.log('✓ Success');
      } catch (error) {
        // If object already exists, skip and continue
        if (error.code === 'P2010' || error.meta?.code === '42P07' || error.meta?.code === '42701') {
          console.log('⊘ Skipped (already exists)');
        } else {
          console.error('Error in statement:', statement.substring(0, 100));
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
