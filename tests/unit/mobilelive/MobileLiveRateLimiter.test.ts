/**
 * Tests pour MobileLiveRateLimiter
 * ChurchFace V1 - Live Mobile Instantané
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MobileLiveRateLimiter } from '@/lib/mobilelive/MobileLiveRateLimiter';
import { prisma } from '@/lib/prisma';

describe('MobileLiveRateLimiter', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Créer un utilisateur de test
    const user = await prisma.user.create({
      data: {
        email: 'ratelimit@example.com',
        password: 'hashedpassword',
        name: 'Rate Limit Test User',
        role: 'USER',
      },
    });
    testUserId = user.id;
  });

  afterEach(async () => {
    // Nettoyer les données de test
    await prisma.liveBroadcast.deleteMany({
      where: { authorId: testUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  describe('canCreateSession', () => {
    it('should allow first session creation', async () => {
      const result = await MobileLiveRateLimiter.canCreateSession(testUserId);

      expect(result.allowed).toBe(true);
    });

    it('should deny when user has active live', async () => {
      // Créer un live actif
      await prisma.liveBroadcast.create({
        data: {
          title: 'Active Broadcast',
          authorId: testUserId,
          status: 'LIVE',
          streamUrl: 'rtmp://test.com/stream',
          ownerType: 'USER',
        },
      });

      const result = await MobileLiveRateLimiter.canCreateSession(testUserId);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('déjà un live en cours');
    });

    it('should deny when user exceeds hourly limit', async () => {
      // Créer 3 lives dans la dernière heure
      const oneHourAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      for (let i = 0; i < 3; i++) {
        await prisma.liveBroadcast.create({
          data: {
            title: `Broadcast ${i}`,
            authorId: testUserId,
            status: 'ENDED',
            streamUrl: 'rtmp://test.com/stream',
            ownerType: 'USER',
            createdAt: oneHourAgo,
            endedAt: new Date(oneHourAgo.getTime() + 10 * 60 * 1000),
          },
        });
      }

      const result = await MobileLiveRateLimiter.canCreateSession(testUserId);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Trop de lives créés récemment');
    });

    it('should enforce cooldown between sessions', async () => {
      // Créer un live terminé il y a 2 minutes
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      
      await prisma.liveBroadcast.create({
        data: {
          title: 'Recent Broadcast',
          authorId: testUserId,
          status: 'ENDED',
          streamUrl: 'rtmp://test.com/stream',
          ownerType: 'USER',
          createdAt: twoMinutesAgo,
          endedAt: twoMinutesAgo,
        },
      });

      const result = await MobileLiveRateLimiter.canCreateSession(testUserId);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('attendre 5 minutes');
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should deny for banned users', async () => {
      await prisma.user.update({
        where: { id: testUserId },
        data: { isBanned: true },
      });

      const result = await MobileLiveRateLimiter.canCreateSession(testUserId);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('suspendu ou banni');
    });
  });

  describe('getUserStats', () => {
    it('should return correct stats for new user', async () => {
      const stats = await MobileLiveRateLimiter.getUserStats(testUserId);

      expect(stats.recentBroadcasts).toBe(0);
      expect(stats.maxRecentBroadcasts).toBe(3);
      expect(stats.activeBroadcasts).toBe(0);
      expect(stats.maxActiveBroadcasts).toBe(1);
      expect(stats.cooldownRemaining).toBe(0);
    });

    it('should return correct stats with active broadcast', async () => {
      await prisma.liveBroadcast.create({
        data: {
          title: 'Active Broadcast',
          authorId: testUserId,
          status: 'LIVE',
          streamUrl: 'rtmp://test.com/stream',
          ownerType: 'USER',
        },
      });

      const stats = await MobileLiveRateLimiter.getUserStats(testUserId);

      expect(stats.activeBroadcasts).toBe(1);
    });
  });
});
