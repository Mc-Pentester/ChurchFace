const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyAllIndexes() {
  try {
    console.log('=== Vérification de tous les indexes ===\n');
    
    // Vérifier tous les indexes pour PrayerParticipant
    const participantIndexes = await prisma.$queryRaw`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'PrayerParticipant'
      ORDER BY indexname
    `;
    console.log('✓ PrayerParticipant tous indexes:', participantIndexes);
    
    // Vérifier tous les indexes pour PrayerRoomParticipant
    const roomParticipantIndexes = await prisma.$queryRaw`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'PrayerRoomParticipant'
      ORDER BY indexname
    `;
    console.log('✓ PrayerRoomParticipant tous indexes:', roomParticipantIndexes);
    
    // Vérifier tous les indexes pour PrayerSchedule
    const scheduleIndexes = await prisma.$queryRaw`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'PrayerSchedule'
      ORDER BY indexname
    `;
    console.log('✓ PrayerSchedule tous indexes:', scheduleIndexes);
    
    console.log('\n=== Vérification terminée ===');
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyAllIndexes();
