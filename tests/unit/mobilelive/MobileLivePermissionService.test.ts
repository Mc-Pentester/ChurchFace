/**
 * Tests pour MobileLivePermissionService
 * ChurchFace V1 - Live Mobile Instantané
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MobileLivePermissionService } from '@/lib/mobilelive/MobileLivePermissionService';
import { prisma } from '@/lib/prisma';

describe('MobileLivePermissionService', () => {
  let testUserId: string;
  let testChurchId: string;

  beforeEach(async () => {
    // Créer un utilisateur de test
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        role: 'USER',
      },
    });
    testUserId = user.id;

    // Créer une église de test
    const church = await prisma.church.create({
      data: {
        slug: 'test-church',
        name: 'Test Church',
      },
    });
    testChurchId = church.id;
  });

  afterEach(async () => {
    // Nettoyer les données de test
    await prisma.churchMember.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.churchAdmin.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.church.delete({
      where: { id: testChurchId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  describe('canStartLive', () => {
    it('should allow personal context for regular users', async () => {
      const permissions = await MobileLivePermissionService.canStartLive({
        userId: testUserId,
        context: 'PERSONAL',
      });

      expect(permissions.canStartLive).toBe(true);
      expect(permissions.canStreamToChurch).toBe(false);
    });

    it('should deny church context for non-admin users', async () => {
      const permissions = await MobileLivePermissionService.canStartLive({
        userId: testUserId,
        context: 'CHURCH',
        ownerId: testChurchId,
        ownerType: 'CHURCH',
      });

      expect(permissions.canStartLive).toBe(false);
      expect(permissions.reason).toContain('not authorized');
    });

    it('should allow church context for church admins', async () => {
      // Créer l'utilisateur comme admin de l'église
      await prisma.churchAdmin.create({
        data: {
          userId: testUserId,
          churchId: testChurchId,
        },
      });

      const permissions = await MobileLivePermissionService.canStartLive({
        userId: testUserId,
        context: 'CHURCH',
        ownerId: testChurchId,
        ownerType: 'CHURCH',
      });

      expect(permissions.canStartLive).toBe(true);
      expect(permissions.canStreamToChurch).toBe(true);
    });

    it('should deny for banned users', async () => {
      await prisma.user.update({
        where: { id: testUserId },
        data: { isBanned: true },
      });

      const permissions = await MobileLivePermissionService.canStartLive({
        userId: testUserId,
        context: 'PERSONAL',
      });

      expect(permissions.canStartLive).toBe(false);
      expect(permissions.reason).toContain('suspended or banned');
    });

    it('should allow for users with LIVE_CREATE permission', async () => {
      // Ajouter la permission LIVE_CREATE
      await prisma.user.update({
        where: { id: testUserId },
        data: {
          permissions: { LIVE_CREATE: true },
        },
      });

      // Créer l'utilisateur comme membre de l'église
      await prisma.churchMember.create({
        data: {
          userId: testUserId,
          churchId: testChurchId,
        },
      });

      const permissions = await MobileLivePermissionService.canStartLive({
        userId: testUserId,
        context: 'CHURCH',
        ownerId: testChurchId,
        ownerType: 'CHURCH',
      });

      expect(permissions.canStartLive).toBe(true);
    });
  });

  describe('canStopLive', () => {
    it('should allow owner to stop their own live', async () => {
      const broadcast = await prisma.liveBroadcast.create({
        data: {
          title: 'Test Broadcast',
          authorId: testUserId,
          status: 'LIVE',
          streamUrl: 'rtmp://test.com/stream',
          ownerType: 'USER',
        },
      });

      const canStop = await MobileLivePermissionService.canStopLive({
        userId: testUserId,
        broadcastId: broadcast.id,
      });

      expect(canStop).toBe(true);

      // Cleanup
      await prisma.liveBroadcast.delete({
        where: { id: broadcast.id },
      });
    });

    it('should deny non-owner from stopping live', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          password: 'hashedpassword',
          name: 'Other User',
        },
      });

      const broadcast = await prisma.liveBroadcast.create({
        data: {
          title: 'Test Broadcast',
          authorId: testUserId,
          status: 'LIVE',
          streamUrl: 'rtmp://test.com/stream',
          ownerType: 'USER',
        },
      });

      const canStop = await MobileLivePermissionService.canStopLive({
        userId: otherUser.id,
        broadcastId: broadcast.id,
      });

      expect(canStop).toBe(false);

      // Cleanup
      await prisma.liveBroadcast.delete({
        where: { id: broadcast.id },
      });
      await prisma.user.delete({
        where: { id: otherUser.id },
      });
    });
  });

  describe('canModerateLive', () => {
    it('should allow owner to moderate their own live', async () => {
      const broadcast = await prisma.liveBroadcast.create({
        data: {
          title: 'Test Broadcast',
          authorId: testUserId,
          status: 'LIVE',
          streamUrl: 'rtmp://test.com/stream',
          ownerType: 'USER',
        },
      });

      const canModerate = await MobileLivePermissionService.canModerateLive({
        userId: testUserId,
        broadcastId: broadcast.id,
      });

      expect(canModerate).toBe(true);

      // Cleanup
      await prisma.liveBroadcast.delete({
        where: { id: broadcast.id },
      });
    });

    it('should allow admins to moderate any live', async () => {
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: 'hashedpassword',
          name: 'Admin User',
          role: 'ADMIN',
        },
      });

      const broadcast = await prisma.liveBroadcast.create({
        data: {
          title: 'Test Broadcast',
          authorId: testUserId,
          status: 'LIVE',
          streamUrl: 'rtmp://test.com/stream',
          ownerType: 'USER',
        },
      });

      const canModerate = await MobileLivePermissionService.canModerateLive({
        userId: adminUser.id,
        broadcastId: broadcast.id,
      });

      expect(canModerate).toBe(true);

      // Cleanup
      await prisma.liveBroadcast.delete({
        where: { id: broadcast.id },
      });
      await prisma.user.delete({
        where: { id: adminUser.id },
      });
    });
  });
});
