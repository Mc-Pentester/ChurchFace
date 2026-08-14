import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function applyMigration(migrationName: string) {
  try {
    console.log(`Application de la migration: ${migrationName}`);

    const migrationPath = join(process.cwd(), 'prisma', 'migrations', migrationName, 'migration.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    // Diviser le SQL en commandes individuelles
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    // Exécuter chaque commande individuellement
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
    }

    console.log(`✅ Migration ${migrationName} appliquée avec succès`);
  } catch (error) {
    console.error(`❌ Erreur lors de l'application de la migration ${migrationName}:`, error);
    throw error;
  }
}

async function main() {
  const migrationName = process.argv[2];

  if (!migrationName) {
    console.error('❌ Veuillez spécifier le nom de la migration');
    console.log('Usage: npx tsx scripts/apply-migration.ts <migration_name>');
    console.log('Exemple: npx tsx scripts/apply-migration.ts 20260813160000_add_training_module');
    process.exit(1);
  }

  try {
    await applyMigration(migrationName);
    console.log('✅ Migration terminée');
  } catch (error) {
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
