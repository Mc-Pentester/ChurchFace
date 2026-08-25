const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migratePrayerRequest() {
  console.log('🔄 Migration PrayerRequest → Prayer (type=INDIVIDUAL)...');
  
  try {
    // Récupérer toutes les PrayerRequest existantes
    const prayerRequests = await prisma.prayerRequest.findMany();
    
    console.log(`📊 ${prayerRequests.length} PrayerRequest à migrer`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const request of prayerRequests) {
      try {
        // Vérifier si déjà migré
        const existing = await prisma.prayer.findFirst({
          where: {
            type: 'INDIVIDUAL',
            id: request.id // Utiliser le même ID pour correspondance
          }
        });
        
        if (existing) {
          skipped++;
          continue;
        }
        
        // Créer l'entrée Prayer correspondante
        await prisma.prayer.create({
          data: {
            id: request.id, // Conserver le même ID
            type: 'INDIVIDUAL',
            title: request.title,
            description: request.content, // content → description
            imageUrl: null,
            visibility: 'PUBLIC',
            churchId: request.churchId,
            groupId: null,
            ministryId: null,
            eventId: null,
            createdBy: request.userId, // userId → createdBy
            createdAt: request.createdAt,
            
            // Champs individuels
            content: request.content,
            category: request.category,
            isUrgent: request.isUrgent,
            isAnswered: request.isAnswered,
            
            // Champs collaboratifs (null pour type INDIVIDUAL)
            isActive: true,
            roomType: null,
            isPublic: true,
            maxParticipants: null,
            scheduledStart: null,
            scheduledEnd: null,
            endedAt: null,
            
            // Champs campagne (null pour type INDIVIDUAL)
            campaignType: null,
            startDate: null,
            endDate: null,
            
            // Relations hiérarchiques (null pour type INDIVIDUAL)
            parentPrayerId: null,
          }
        });
        
        migrated++;
        console.log(`✅ Migré: ${request.id} - ${request.title}`);
        
      } catch (error) {
        errors++;
        console.error(`❌ Erreur migration ${request.id}:`, error.message);
      }
    }
    
    console.log('\n📈 Résultats:');
    console.log(`✅ Migrés: ${migrated}`);
    console.log(`⏭️  Ignorés (déjà migrés): ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Total: ${prayerRequests.length}`);
    
  } catch (error) {
    console.error('❌ Erreur critique:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migratePrayerRequest()
  .then(() => {
    console.log('✅ Migration PrayerRequest terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration échouée:', error);
    process.exit(1);
  });
