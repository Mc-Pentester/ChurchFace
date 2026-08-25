const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migratePrayerLiveRoom() {
  console.log('🔄 Migration PrayerLiveRoom → Prayer (type=LIVE_ROOM)...');
  
  try {
    // Récupérer toutes les PrayerLiveRoom existantes
    const prayerLiveRooms = await prisma.prayerLiveRoom.findMany();
    
    console.log(`📊 ${prayerLiveRooms.length} PrayerLiveRoom à migrer`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const liveRoom of prayerLiveRooms) {
      try {
        // Vérifier si déjà migré
        const existing = await prisma.prayer.findFirst({
          where: {
            type: 'LIVE_ROOM',
            id: liveRoom.id // Utiliser le même ID pour correspondance
          }
        });
        
        if (existing) {
          skipped++;
          continue;
        }
        
        // Créer l'entrée Prayer correspondante
        await prisma.prayer.create({
          data: {
            id: liveRoom.id, // Conserver le même ID
            type: 'LIVE_ROOM',
            title: liveRoom.title,
            description: liveRoom.description,
            imageUrl: null,
            visibility: liveRoom.isPublic ? 'PUBLIC' : 'PRIVATE',
            churchId: null, // PrayerLiveRoom n'a pas de churchId
            groupId: null,
            ministryId: null,
            eventId: null,
            createdBy: liveRoom.moderatorId, // moderatorId → createdBy
            createdAt: liveRoom.createdAt,
            
            // Champs individuels (null pour type LIVE_ROOM)
            content: null,
            category: null,
            isUrgent: false,
            isAnswered: false,
            
            // Champs collaboratifs
            isActive: liveRoom.isActive,
            roomType: 'VIDEO', // PrayerLiveRoom est pour LiveKit (vidéo)
            isPublic: liveRoom.isPublic,
            maxParticipants: null,
            scheduledStart: null,
            scheduledEnd: null,
            endedAt: liveRoom.endedAt,
            
            // Champs campagne (null pour type LIVE_ROOM)
            campaignType: null,
            startDate: null,
            endDate: null,
            
            // Relations hiérarchiques (null pour les salles live)
            parentPrayerId: null,
          }
        });
        
        migrated++;
        console.log(`✅ Migré: ${liveRoom.id} - ${liveRoom.title}`);
        
      } catch (error) {
        errors++;
        console.error(`❌ Erreur migration ${liveRoom.id}:`, error.message);
      }
    }
    
    console.log('\n📈 Résultats:');
    console.log(`✅ Migrés: ${migrated}`);
    console.log(`⏭️  Ignorés (déjà migrés): ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Total: ${prayerLiveRooms.length}`);
    
  } catch (error) {
    console.error('❌ Erreur critique:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migratePrayerLiveRoom()
  .then(() => {
    console.log('✅ Migration PrayerLiveRoom terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration échouée:', error);
    process.exit(1);
  });
