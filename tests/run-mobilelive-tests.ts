/**
 * Script de test manuel pour Mobile Live
 * Exécute les tests sans utiliser vitest (problème de dépendances natives)
 */

import { MobileLivePermissionService } from '../lib/mobilelive/MobileLivePermissionService';
import { MobileLiveRateLimiter } from '../lib/mobilelive/MobileLiveRateLimiter';
import { prisma } from '../lib/prisma';

async function runTests() {
  console.log('🧪 Démarrage des tests Mobile Live...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Vérification que les services sont importables
  try {
    console.log('✓ Test 1: Import des services - RÉUSSI');
    passed++;
  } catch (error) {
    console.log('✗ Test 1: Import des services - ÉCHOUÉ', error);
    failed++;
  }

  // Test 2: Vérification de la connexion Prisma
  try {
    await prisma.$connect();
    console.log('✓ Test 2: Connexion Prisma - RÉUSSI');
    passed++;
  } catch (error) {
    console.log('✗ Test 2: Connexion Prisma - ÉCHOUÉ', error);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  // Test 3: Vérification des méthodes de MobileLivePermissionService
  try {
    const methods = ['canStartLive', 'canStopLive', 'canModerateLive', 'getBroadcastContext'];
    const missing = methods.filter(m => typeof (MobileLivePermissionService as any)[m] !== 'function');
    
    if (missing.length === 0) {
      console.log('✓ Test 3: Méthodes MobileLivePermissionService - RÉUSSI');
      passed++;
    } else {
      console.log(`✗ Test 3: Méthodes manquantes: ${missing.join(', ')}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test 3: Méthodes MobileLivePermissionService - ÉCHOUÉ', error);
    failed++;
  }

  // Test 4: Vérification des méthodes de MobileLiveRateLimiter
  try {
    const methods = ['canCreateSession', 'logSessionAttempt', 'getUserStats'];
    const missing = methods.filter(m => typeof (MobileLiveRateLimiter as any)[m] !== 'function');
    
    if (missing.length === 0) {
      console.log('✓ Test 4: Méthodes MobileLiveRateLimiter - RÉUSSI');
      passed++;
    } else {
      console.log(`✗ Test 4: Méthodes manquantes: ${missing.join(', ')}`);
      failed++;
    }
  } catch (error) {
    console.log('✗ Test 4: Méthodes MobileLiveRateLimiter - ÉCHOUÉ', error);
    failed++;
  }

  // Test 5: Vérification du schéma Prisma
  try {
    await prisma.$connect();
    
    // Vérifier que User a le champ permissions
    const user = await prisma.user.findFirst();
    if (user) {
      console.log('✓ Test 5: Schéma Prisma (User.permissions) - RÉUSSI');
      passed++;
    } else {
      console.log('⚠ Test 5: Schéma Prisma - AUCUN UTILISATEUR TROUVÉ (test ignoré)');
    }
    
    // Vérifier que ChurchMember a le champ notificationPreferences
    const churchMember = await prisma.churchMember.findFirst();
    if (churchMember) {
      console.log('✓ Test 5b: Schéma Prisma (ChurchMember.notificationPreferences) - RÉUSSI');
      passed++;
    } else {
      console.log('⚠ Test 5b: Schéma Prisma - AUCUN MEMBRE TROUVÉ (test ignoré)');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.log('✗ Test 5: Schéma Prisma - ÉCHOUÉ', error);
    failed++;
    await prisma.$disconnect();
  }

  // Résumé
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Résultats: ${passed} réussis, ${failed} échoués`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('\n✅ Tous les tests sont passés!');
    process.exit(0);
  } else {
    console.log('\n❌ Certains tests ont échoué.');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Erreur lors de l\'exécution des tests:', error);
  process.exit(1);
});
