const { exec } = require('child_process');
const path = require('path');

async function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    console.log(`\n🚀 Exécution: ${scriptName}`);
    
    const child = exec(`node ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erreur: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`⚠️  Stderr: ${stderr}`);
      }
      console.log(stdout);
      resolve();
    });
    
    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
  });
}

async function migrateAll() {
  console.log('🔄 DÉBUT MIGRATION COMPLÈTE MODULE PRIÈRE');
  console.log('==========================================\n');
  
  try {
    // Exécuter les migrations dans l'ordre
    await runScript('migrate-prayer-request.js');
    await runScript('migrate-prayer-chain.js');
    await runScript('migrate-prayer-campaign.js');
    await runScript('migrate-prayer-room.js');
    await runScript('migrate-prayer-live-room.js'); // Ajouté pour PrayerLiveRoom
    
    console.log('\n✅ MIGRATION COMPLÈTE TERMINÉE AVEC SUCCÈS');
    console.log('==========================================\n');
    console.log('📋 Prochaines étapes:');
    console.log('1. Vérifier les données migrées');
    console.log('2. Tester les nouvelles API routes');
    console.log('3. Mettre à jour les composants frontend');
    console.log('4. Supprimer les anciennes tables après validation');
    
  } catch (error) {
    console.error('\n❌ MIGRATION ÉCHOUÉE');
    console.error('==========================================');
    console.error('Erreur:', error.message);
    process.exit(1);
  }
}

// Exécuter la migration complète
migrateAll();
