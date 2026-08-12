const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('Application de la migration manuellement...');
    
    // Extensions de tables existantes
    console.log('Extension de PrayerRequest...');
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerRequest" ADD COLUMN IF NOT EXISTS "groupId" TEXT');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerRequest" ADD COLUMN IF NOT EXISTS "ministryId" TEXT');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerRequest" ADD COLUMN IF NOT EXISTS "eventId" TEXT');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerRequest" ADD COLUMN IF NOT EXISTS "liveBroadcastId" TEXT');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerRequest" ADD COLUMN IF NOT EXISTS "prayerCampaignId" TEXT');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerRequest" ADD COLUMN IF NOT EXISTS "prayerRoomId" TEXT');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerRequest" ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3)');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerRequest" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT \'ACTIVE\'');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    console.log('✅ PrayerRequest étendu');

    console.log('Extension de PrayerChain...');
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChain" ADD COLUMN IF NOT EXISTS "ownerId" TEXT');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChain" ADD COLUMN IF NOT EXISTS "ownerType" TEXT');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChain" ADD COLUMN IF NOT EXISTS "churchId" TEXT');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChain" ADD COLUMN IF NOT EXISTS "groupId" TEXT');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChain" ADD COLUMN IF NOT EXISTS "ministryId" TEXT');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChain" ADD COLUMN IF NOT EXISTS "eventId" TEXT');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChain" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChain" ADD COLUMN IF NOT EXISTS "visibility" TEXT DEFAULT \'PUBLIC\'');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChain" ADD COLUMN IF NOT EXISTS "prayerCampaignId" TEXT');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChain" ADD COLUMN IF NOT EXISTS "scheduledStart" TIMESTAMP(3)');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChain" ADD COLUMN IF NOT EXISTS "scheduledEnd" TIMESTAMP(3)');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    console.log('✅ PrayerChain étendu');

    console.log('Extension de PrayerChainLink...');
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChainLink" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT \'PARTICIPANT\'');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChainLink" ADD COLUMN IF NOT EXISTS "joinedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChainLink" ADD COLUMN IF NOT EXISTS "lastPrayedAt" TIMESTAMP(3)');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChainLink" ADD COLUMN IF NOT EXISTS "prayerCount" INTEGER DEFAULT 0');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerChainLink" ADD COLUMN IF NOT EXISTS "notificationEnabled" BOOLEAN DEFAULT true');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    console.log('✅ PrayerChainLink étendu');

    console.log('Extension de PrayerTestimony...');
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "PrayerTestimony" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT');
    } catch (e) { if (!e.message.includes('already exists')) throw e; }
    console.log('✅ PrayerTestimony étendu');

    // Création des nouvelles tables
    console.log('Création de PrayerParticipant...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PrayerParticipant" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "prayerChainId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'PARTICIPANT',
        "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastPrayedAt" TIMESTAMP(3),
        "prayerCount" INTEGER NOT NULL DEFAULT 0,
        "notificationEnabled" BOOLEAN NOT NULL DEFAULT true
      )
    `);
    console.log('✅ PrayerParticipant créé');

    console.log('Création de PrayerSchedule...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PrayerSchedule" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "prayerChainId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "hour" INTEGER NOT NULL,
        "dayOfWeek" INTEGER,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ PrayerSchedule créé');

    console.log('Création de PrayerRoom...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PrayerRoom" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "prayerChainId" TEXT,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "roomType" TEXT NOT NULL DEFAULT 'TEXT',
        "isPublic" BOOLEAN NOT NULL DEFAULT true,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "moderatorId" TEXT NOT NULL,
        "maxParticipants" INTEGER,
        "scheduledStart" TIMESTAMP(3),
        "scheduledEnd" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endedAt" TIMESTAMP(3)
      )
    `);
    console.log('✅ PrayerRoom créé');

    console.log('Création de PrayerRoomParticipant...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PrayerRoomParticipant" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "roomId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "isMuted" BOOLEAN NOT NULL DEFAULT false,
        "hasHandRaised" BOOLEAN NOT NULL DEFAULT false
      )
    `);
    console.log('✅ PrayerRoomParticipant créé');

    console.log('Création de PrayerCampaign...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PrayerCampaign" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "imageUrl" TEXT,
        "type" TEXT NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3) NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "churchId" TEXT,
        "createdBy" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ PrayerCampaign créé');

    console.log('Création de PrayerEngagement...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PrayerEngagement" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "prayerRequestId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ PrayerEngagement créé');

    console.log('✅ Migration appliquée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de l\'application de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
