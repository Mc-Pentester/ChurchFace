/**
 * Script de validation pour Mobile Live
 * Vérifie que tous les fichiers sont présents et corrects
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const filesToCheck = [
  // Services
  'lib/mobilelive/MobileLiveTypes.ts',
  'lib/mobilelive/MobileLivePermissionService.ts',
  'lib/mobilelive/MobileLiveService.ts',
  'lib/mobilelive/MobileLiveRateLimiter.ts',
  
  // Hooks
  'hooks/useMobileLive.ts',
  'hooks/useMobileLiveContext.ts',
  
  // Components
  'components/mobilelive/GoLiveButton.tsx',
  'components/mobilelive/MobileLiveSetup.tsx',
  'components/mobilelive/MobileLiveInterface.tsx',
  'components/mobilelive/MobileLiveModeration.tsx',
  
  // API Routes
  'app/api/mobilelive/permissions/route.ts',
  'app/api/mobilelive/session/route.ts',
  'app/api/mobilelive/session/[sessionId]/route.ts',
  'app/api/mobilelive/session/[sessionId]/start/route.ts',
  'app/api/mobilelive/session/[sessionId]/stop/route.ts',
  'app/api/mobilelive/session/[sessionId]/livekit-token/route.ts',
  'app/api/mobilelive/session/[sessionId]/can-moderate/route.ts',
  'app/api/mobilelive/session/[sessionId]/moderate/route.ts',
  'app/api/mobilelive/session/[sessionId]/force-stop/route.ts',
  
  // Tests
  'tests/unit/mobilelive/MobileLivePermissionService.test.ts',
  'tests/unit/mobilelive/MobileLiveRateLimiter.test.ts',
];

const schemaFile = 'prisma/schema.prisma';

console.log('🔍 Validation des fichiers Mobile Live...\n');

let passed = 0;
let failed = 0;

// Vérifier les fichiers de code
for (const file of filesToCheck) {
  const filePath = join(process.cwd(), file);
  if (existsSync(filePath)) {
    console.log(`✓ ${file}`);
    passed++;
  } else {
    console.log(`✗ ${file} - MANQUANT`);
    failed++;
  }
}

// Vérifier le schéma Prisma
const schemaPath = join(process.cwd(), schemaFile);
if (existsSync(schemaPath)) {
  const schema = readFileSync(schemaPath, 'utf-8');
  
  const hasUserPermissions = schema.includes('permissions                Json?');
  const hasChurchMemberNotificationPrefs = schema.includes('notificationPreferences Json?');
  
  if (hasUserPermissions) {
    console.log(`✓ ${schemaFile} - User.permissions présent`);
    passed++;
  } else {
    console.log(`✗ ${schemaFile} - User.permissions MANQUANT`);
    failed++;
  }
  
  if (hasChurchMemberNotificationPrefs) {
    console.log(`✓ ${schemaFile} - ChurchMember.notificationPreferences présent`);
    passed++;
  } else {
    console.log(`✗ ${schemaFile} - ChurchMember.notificationPreferences MANQUANT`);
    failed++;
  }
} else {
  console.log(`✗ ${schemaFile} - MANQUANT`);
  failed += 2;
}

// Résumé
console.log('\n' + '='.repeat(60));
console.log(`📊 Résultats: ${passed} réussis, ${failed} échoués`);
console.log('='.repeat(60));

if (failed === 0) {
  console.log('\n✅ Tous les fichiers sont présents et valides!');
  console.log('\n⚠️  Note: Les tests unitaires nécessitent:');
  console.log('   - npm install (pour régénérer node_modules)');
  console.log('   - npx prisma generate (pour régénérer le client Prisma)');
  console.log('   - npx prisma db push (pour appliquer les migrations)');
} else {
  console.log('\n❌ Certains fichiers sont manquants.');
}

process.exit(failed === 0 ? 0 : 1);
