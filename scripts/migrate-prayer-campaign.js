const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migratePrayerCampaign() {
  console.log('🔄 Migration PrayerCampaign → Prayer (type=COLLABORATIVE_CAMPAIGN)...');
  
  try {
    // Récupérer toutes les PrayerCampaign existantes
    const prayerCampaigns = await prisma.prayerCampaign.findMany();
    
    console.log(`📊 ${prayerCampaigns.length} PrayerCampaign à migrer`);
    
    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const campaign of prayerCampaigns) {
      try {
        // Vérifier si déjà migré
        const existing = await prisma.prayer.findFirst({
          where: {
            type: 'COLLABORATIVE_CAMPAIGN',
            id: campaign.id // Utiliser le même ID pour correspondance
          }
        });
        
        if (existing) {
          skipped++;
          continue;
        }
        
        // Créer l'entrée Prayer correspondante
        await prisma.prayer.create({
          data: {
            id: campaign.id, // Conserver le même ID
            type: 'COLLABORATIVE_CAMPAIGN',
            title: campaign.title,
            description: campaign.description,
            imageUrl: campaign.imageUrl,
            visibility: 'PUBLIC',
            churchId: campaign.churchId,
            groupId: null,
            ministryId: null,
            eventId: null,
            createdBy: campaign.createdBy,
            createdAt: campaign.createdAt,
            
            // Champs individuels (null pour type COLLABORATIVE_CAMPAIGN)
            content: null,
            category: null,
            isUrgent: false,
            isAnswered: false,
            
            // Champs collaboratifs
            isActive: campaign.isActive,
            roomType: null,
            isPublic: true,
            maxParticipants: null,
            scheduledStart: campaign.startDate,
            scheduledEnd: campaign.endDate,
            endedAt: null,
            
            // Champs campagne
            campaignType: campaign.type, // type → campaignType
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            
            // Relations hiérarchiques (null pour les campagnes parentes)
            parentPrayerId: null,
          }
        });
        
        migrated++;
        console.log(`✅ Migré: ${campaign.id} - ${campaign.title}`);
        
      } catch (error) {
        errors++;
        console.error(`❌ Erreur migration ${campaign.id}:`, error.message);
      }
    }
    
    console.log('\n📈 Résultats:');
    console.log(`✅ Migrés: ${migrated}`);
    console.log(`⏭️  Ignorés (déjà migrés): ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Total: ${prayerCampaigns.length}`);
    
  } catch (error) {
    console.error('❌ Erreur critique:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration
migratePrayerCampaign()
  .then(() => {
    console.log('✅ Migration PrayerCampaign terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration échouée:', error);
    process.exit(1);
  });
