const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migratePrayerChain() {
  console.log('🔄 Migration PrayerChain → Prayer (type=COLLABORATIVE_CHAIN)...');
  
  try {
    // Récupérer toutes les PrayerChain existantes
    const prayerChains = await prisma.prayerChain.findMany();
    
    // Créer ou récupérer un utilisateur système pour les createdBy invalides
    let systemUser = await prisma.user.findFirst({
      where: { email: 'system@churchface.local' }
    });
    
    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: 'system@churchface.local',
          password: 'system', // Mot de passe temporaire
          name: 'System User',
          role: 'ADMIN'
        }
      });
      console.log('👤 Utilisateur système créé:', systemUser.id);
    }
    
    console.log(`📊 ${prayerChains.length} PrayerChain à migrer`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const chain of prayerChains) {
      try {
        // Vérifier si déjà migré
        const existing = await prisma.prayer.findFirst({
          where: {
            type: 'COLLABORATIVE_CHAIN',
            id: chain.id // Utiliser le même ID pour correspondance
          }
        });
        
        if (existing) {
          skipped++;
          continue;
        }
        
        // Valider createdBy - utiliser systemUser si invalide
        let createdBy = chain.createdBy;
        if (!createdBy) {
          createdBy = systemUser.id;
          console.log(`⚠️  createdBy null pour ${chain.id}, utilisation utilisateur système`);
        } else {
          // Vérifier si l'utilisateur existe
          const userExists = await prisma.user.findUnique({
            where: { id: createdBy }
          });
          if (!userExists) {
            createdBy = systemUser.id;
            console.log(`⚠️  Utilisateur invalide pour ${chain.id}, utilisation utilisateur système`);
          }
        }
        
        // Créer l'entrée Prayer correspondante
        await prisma.prayer.create({
          data: {
            id: chain.id, // Conserver le même ID
            type: 'COLLABORATIVE_CHAIN',
            title: chain.title,
            description: chain.description,
            imageUrl: chain.imageUrl,
            visibility: chain.visibility,
            churchId: chain.churchId,
            groupId: chain.groupId,
            ministryId: chain.ministryId,
            eventId: chain.eventId,
            createdBy: createdBy,
            createdAt: chain.createdAt,
            
            // Champs individuels (null pour type COLLABORATIVE_CHAIN)
            content: null,
            category: null,
            isUrgent: false,
            isAnswered: false,
            
            // Champs collaboratifs
            isActive: chain.isActive,
            roomType: null,
            isPublic: chain.visibility === 'PUBLIC',
            maxParticipants: null,
            scheduledStart: chain.scheduledStart,
            scheduledEnd: chain.scheduledEnd,
            endedAt: null,
            
            // Champs campagne (null pour type COLLABORATIVE_CHAIN)
            campaignType: null,
            startDate: null,
            endDate: null,
            
            // Relations hiérarchiques (prayerCampaignId → parentPrayerId)
            parentPrayerId: chain.prayerCampaignId,
          }
        });
        
        migrated++;
        console.log(`✅ Migré: ${chain.id} - ${chain.title}`);
        
      } catch (error) {
        errors++;
        console.error(`❌ Erreur migration ${chain.id}:`, error.message);
      }
    }
    
    console.log('\n📈 Résultats:');
    console.log(`✅ Migrés: ${migrated}`);
    console.log(`⏭️  Ignorés (déjà migrés): ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Total: ${prayerChains.length}`);
    
  } catch (error) {
    console.error('❌ Erreur critique:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migratePrayerChain()
  .then(() => {
    console.log('✅ Migration PrayerChain terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration échouée:', error);
    process.exit(1);
  });
