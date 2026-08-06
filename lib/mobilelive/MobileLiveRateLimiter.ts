/**
 * Service de rate limiting pour Mobile Live
 * ChurchFace V1 - Live Mobile Instantané
 * Prévention des abus et limitation de la création de sessions
 */

import { prisma } from "@/lib/prisma";

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // en secondes
}

export class MobileLiveRateLimiter {
  /**
   * Vérifie si un utilisateur peut créer une nouvelle session de live
   */
  static async canCreateSession(userId: string): Promise<RateLimitResult> {
    // Règle 1: Maximum 3 lives par heure par utilisateur
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentBroadcasts = await prisma.liveBroadcast.count({
      where: {
        authorId: userId,
        createdAt: { gte: oneHourAgo },
        status: { in: ["LIVE", "ENDED", "ERROR"] },
      },
    });

    if (recentBroadcasts >= 3) {
      return {
        allowed: false,
        reason: "Trop de lives créés récemment. Maximum 3 lives par heure.",
        retryAfter: 3600,
      };
    }

    // Règle 2: Maximum 1 live actif simultané par utilisateur
    const activeBroadcasts = await prisma.liveBroadcast.count({
      where: {
        authorId: userId,
        status: "LIVE",
      },
    });

    if (activeBroadcasts >= 1) {
      return {
        allowed: false,
        reason: "Vous avez déjà un live en cours. Arrêtez-le avant d'en créer un nouveau.",
      };
    }

    // Règle 3: Cooldown de 5 minutes entre deux lives
    const lastBroadcast = await prisma.liveBroadcast.findFirst({
      where: {
        authorId: userId,
        status: "ENDED",
        endedAt: { not: null },
      },
      orderBy: { endedAt: "desc" },
    });

    if (lastBroadcast && lastBroadcast.endedAt) {
      const cooldownEnd = new Date(lastBroadcast.endedAt.getTime() + 5 * 60 * 1000);
      const now = new Date();

      if (now < cooldownEnd) {
        const retryAfter = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000);
        return {
          allowed: false,
          reason: "Veuillez attendre 5 minutes entre deux lives.",
          retryAfter,
        };
      }
    }

    // Règle 4: Vérifier si l'utilisateur n'est pas banni ou suspendu
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.isBanned || user?.isSuspended) {
      return {
        allowed: false,
        reason: "Votre compte est suspendu ou banni.",
      };
    }

    return { allowed: true };
  }

  /**
   * Enregistre une tentative de création de session (pour le monitoring)
   */
  static async logSessionAttempt(userId: string, success: boolean): Promise<void> {
    // Optionnel: Logger dans une table de monitoring
    console.log(`[MobileLiveRateLimiter] User ${userId} session attempt: ${success}`);
  }

  /**
   * Obtient les statistiques de rate limiting pour un utilisateur
   */
  static async getUserStats(userId: string) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentBroadcasts = await prisma.liveBroadcast.count({
      where: {
        authorId: userId,
        createdAt: { gte: oneHourAgo },
        status: { in: ["LIVE", "ENDED", "ERROR"] },
      },
    });

    const activeBroadcasts = await prisma.liveBroadcast.count({
      where: {
        authorId: userId,
        status: "LIVE",
      },
    });

    const lastBroadcast = await prisma.liveBroadcast.findFirst({
      where: {
        authorId: userId,
        status: "ENDED",
        endedAt: { not: null },
      },
      orderBy: { endedAt: "desc" },
    });

    let cooldownRemaining = 0;
    if (lastBroadcast && lastBroadcast.endedAt) {
      const cooldownEnd = new Date(lastBroadcast.endedAt.getTime() + 5 * 60 * 1000);
      const now = new Date();
      if (now < cooldownEnd) {
        cooldownRemaining = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000);
      }
    }

    return {
      recentBroadcasts,
      maxRecentBroadcasts: 3,
      activeBroadcasts,
      maxActiveBroadcasts: 1,
      cooldownRemaining,
    };
  }
}
