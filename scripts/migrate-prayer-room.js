const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migratePrayerRoom() {
  console.log('🔄 Migration PrayerRoom → Prayer (type=LIVE_ROOM)...');
  
  try {
    // Récupérer toutes les PrayerRoom existantes
    const prayerRooms = await prisma.prayerRoom.findMany();
    
    console.log(`📊 ${prayerRooms.length} PrayerRoom à migrer`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const room of prayerRooms) {
      try {
        // Vérifier si déjà migré
        const existing = await prisma.prayer.findFirst({
          where: {
            type: 'LIVE_ROOM',
            id: room.id // Utiliser le même ID pour correspondance
          }
        });
        
        if (existing) {
          skipped++;
          continue;
        }
        
        // Créer l'entrée Prayer correspondante
        await prisma.prayer.create({
          data: {
            id: room.id, // Conserver le même ID
            type: 'LIVE_ROOM',
            title: room.title,
            description: room.description,
            imageUrl: null,
            visibility: room.isPublic ? 'PUBLIC' : 'PRIVATE',
            churchId: room.churchId,
            groupId: null,
            ministryId: null,
            eventId: null,
            createdBy: room.moderatorId, // moderatorId → createdBy
            createdAt: room.createdAt,
            
            // Champs individuels (null pour type LIVE_ROOM)
            content: null,
            category: null,
            isUrgent: false,
            isAnswered: false,
            
            // Champs collaboratifs
            isActive: room.isActive,
            roomType: room.roomType, // TEXT | AUDIO | VIDEO
            isPublic: room.isPublic,
            maxParticipants: room.maxParticipants,
            scheduledStart: room.scheduledStart,
            scheduledEnd: room.scheduledEnd,
            endedAt: room.endedAt,
            
            // Champs campagne (null pour type LIVE_ROOM)
            campaignType: null,
            startDate: null,
            endDate: null,
            
            // Relations hiérarchiques (prayerChainId → parentPrayerId)
            parentPrayerId: room.prayerChainId,
          }
        });
        
        migrated++;
        console.log(`✅ Migré: ${room.id} - ${room.title}`);
        
      } catch (error) {
        errors++;
        console.error(`❌ Erreur migration ${room.id}:`, error.message);
      }
    }
    
    console.log('\n📈 Résultats:');
    console.log(`✅ Migrés: ${migrated}`);
    console.log(`⏭️  Ignorés (déjà migrés): ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Total: ${prayerRooms.length}`);
    
  } catch (error) {
    console.error('❌ Erreur critique:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migratePrayerRoom()
  .then(() => {
    console.log('✅ Migration PrayerRoom terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration échouée:', error);
    process.exit(1);
  });
