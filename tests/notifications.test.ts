/**
 * Tests unitaires pour le système de notifications
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createNotification } from "@/lib/notifications";
import { shouldSendNotification, getUserNotificationPreferences, updateUserNotificationPreferences } from "@/lib/notificationPreferences";
import { getEntityUrl } from "@/lib/notificationTypes";
import { NotificationCategory } from "@/lib/notificationTypes";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    notification: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    churchMember: {
      findFirst: vi.fn(),
    },
  },
}));

// Mock Socket.IO
vi.mock("@/lib/io", () => ({
  getSocketServer: vi.fn(() => ({
    to: vi.fn(() => ({
      emit: vi.fn(),
    })),
  })),
}));

// Mock Web Push
vi.mock("@/lib/push/sendPushNotification", () => ({
  sendPushNotification: vi.fn(),
}));

describe("createNotification", () => {
  const { prisma } = require("@/lib/prisma");
  const { sendPushNotification } = require("@/lib/push/sendPushNotification");
  const { getSocketServer } = require("@/lib/io");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait créer une notification en base de données", async () => {
    prisma.notification.create.mockResolvedValue({
      id: "notif-1",
      userId: "user-1",
      type: "TEST",
      message: "Test notification",
    });

    const result = await createNotification({
      userId: "user-1",
      type: "TEST",
      message: "Test notification",
    });

    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        type: "TEST",
        message: "Test notification",
        metadata: {},
      },
    });
    expect(result).toBeDefined();
  });

  it("devrait empêcher l'auto-notification (senderId === userId)", async () => {
    const result = await createNotification({
      userId: "user-1",
      senderId: "user-1",
      type: "TEST",
      message: "Test notification",
    });

    expect(prisma.notification.create).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("devrait éviter les doublons dans la fenêtre temporelle", async () => {
    const existingNotification = {
      id: "existing-1",
      userId: "user-1",
      type: "POST_LIKED",
      senderId: "user-2",
      entityId: "post-1",
      entityType: "Post",
      createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    };

    prisma.notification.findFirst.mockResolvedValue(existingNotification);

    const result = await createNotification({
      userId: "user-1",
      senderId: "user-2",
      type: "POST_LIKED",
      message: "Test notification",
      entityId: "post-1",
      entityType: "Post",
    });

    expect(prisma.notification.create).not.toHaveBeenCalled();
    expect(result).toEqual(existingNotification);
  });

  it("devrait créer une notification pour les types non dédupliqués", async () => {
    prisma.notification.findFirst.mockResolvedValue(null);
    prisma.notification.create.mockResolvedValue({
      id: "notif-1",
      userId: "user-1",
      type: "FRIEND_REQUEST",
      message: "Test notification",
    });

    await createNotification({
      userId: "user-1",
      senderId: "user-2",
      type: "FRIEND_REQUEST",
      message: "Test notification",
    });

    expect(prisma.notification.create).toHaveBeenCalled();
  });

  it("devrait émettre Socket.IO si les préférences autorisent", async () => {
    prisma.notification.findFirst.mockResolvedValue(null);
    prisma.notification.create.mockResolvedValue({
      id: "notif-1",
      userId: "user-1",
      type: "TEST",
      message: "Test notification",
    });

    const mockIo = {
      to: vi.fn(() => ({
        emit: vi.fn(),
      })),
    };
    getSocketServer.mockReturnValue(mockIo);

    await createNotification({
      userId: "user-1",
      type: "TEST",
      message: "Test notification",
    });

    expect(mockIo.to).toHaveBeenCalledWith("user:user-1");
  });

  it("devrait envoyer Web Push si les préférences autorisent", async () => {
    prisma.notification.findFirst.mockResolvedValue(null);
    prisma.notification.create.mockResolvedValue({
      id: "notif-1",
      userId: "user-1",
      type: "TEST",
      message: "Test notification",
    });

    await createNotification({
      userId: "user-1",
      type: "TEST",
      message: "Test notification",
    });

    expect(sendPushNotification).toHaveBeenCalled();
  });
});

describe("getEntityUrl", () => {
  it("devrait retourner l'URL correcte pour un Post", () => {
    const url = getEntityUrl("Post", "post-123");
    expect(url).toBe("/post/post-123");
  });

  it("devrait retourner l'URL correcte pour une PrayerChain", () => {
    const url = getEntityUrl("PrayerChain", "chain-456");
    expect(url).toBe("/prayers/chain/chain-456");
  });

  it("devrait retourner l'URL correcte pour un Chat", () => {
    const url = getEntityUrl("Chat", "chat-789");
    expect(url).toBe("/messages/chat-789");
  });

  it("devrait retourner '/' pour un type non mappé", () => {
    const url = getEntityUrl("UnknownType", "id-123");
    expect(url).toBe("/");
  });

  it("devrait retourner '/' si entityId est vide", () => {
    const url = getEntityUrl("Post", undefined);
    expect(url).toBe("/");
  });
});

describe("getUserNotificationPreferences", () => {
  const { prisma } = require("@/lib/prisma");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait retourner les préférences par défaut si aucune n'existe", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.churchMember.findFirst.mockResolvedValue(null);

    const prefs = await getUserNotificationPreferences("user-1");

    expect(prefs.enabled).toBe(true);
    expect(prefs.inAppEnabled).toBe(true);
    expect(prefs.pushEnabled).toBe(true);
  });

  it("devrait retourner les préférences utilisateur si elles existent", async () => {
    prisma.user.findUnique.mockResolvedValue({
      notificationPreferences: {
        enabled: false,
        pushEnabled: false,
      },
    });

    const prefs = await getUserNotificationPreferences("user-1");

    expect(prefs.enabled).toBe(false);
    expect(prefs.pushEnabled).toBe(false);
  });

  it("devrait retourner les préférences ChurchMember si User n'en a pas", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.churchMember.findFirst.mockResolvedValue({
      notificationPreferences: {
        enabled: false,
        pushEnabled: false,
      },
    });

    const prefs = await getUserNotificationPreferences("user-1");

    expect(prefs.enabled).toBe(false);
    expect(prefs.pushEnabled).toBe(false);
  });
});

describe("shouldSendNotification", () => {
  const { prisma } = require("@/lib/prisma");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait autoriser si les notifications sont globalement activées", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.churchMember.findFirst.mockResolvedValue(null);

    const result = await shouldSendNotification("user-1", "TEST", "inApp");
    expect(result).toBe(true);
  });

  it("devrait refuser si les notifications sont globalement désactivées", async () => {
    prisma.user.findUnique.mockResolvedValue({
      notificationPreferences: {
        enabled: false,
      },
    });

    const result = await shouldSendNotification("user-1", "TEST", "inApp");
    expect(result).toBe(false);
  });

  it("devrait refuser si inApp est désactivé", async () => {
    prisma.user.findUnique.mockResolvedValue({
      notificationPreferences: {
        enabled: true,
        inAppEnabled: false,
      },
    });

    const result = await shouldSendNotification("user-1", "TEST", "inApp");
    expect(result).toBe(false);
  });

  it("devrait refuser si push est désactivé", async () => {
    prisma.user.findUnique.mockResolvedValue({
      notificationPreferences: {
        enabled: true,
        pushEnabled: false,
      },
    });

    const result = await shouldSendNotification("user-1", "TEST", "push");
    expect(result).toBe(false);
  });

  it("devrait autoriser par défaut en cas d'erreur", async () => {
    prisma.user.findUnique.mockRejectedValue(new Error("Database error"));

    const result = await shouldSendNotification("user-1", "TEST", "inApp");
    expect(result).toBe(true);
  });
});

describe("updateUserNotificationPreferences", () => {
  const { prisma } = require("@/lib/prisma");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait mettre à jour les préférences utilisateur", async () => {
    prisma.user.update.mockResolvedValue({});

    await updateUserNotificationPreferences("user-1", {
      enabled: false,
      pushEnabled: false,
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        enabled: false,
        pushEnabled: false,
      },
    });
  });

  it("devrait lancer une erreur en cas d'échec", async () => {
    prisma.user.update.mockRejectedValue(new Error("Database error"));

    await expect(
      updateUserNotificationPreferences("user-1", { enabled: false })
    ).rejects.toThrow("Database error");
  });
});
