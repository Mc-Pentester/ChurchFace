/**
 * Service de permissions pour Mobile Live
 * ChurchFace V1 - Live Mobile Instantané
 * Gère les autorisations de diffusion selon le contexte (personnel vs église)
 */

import { prisma } from "@/lib/prisma";
import { MobileLiveContext, MobileLivePermissions } from "./MobileLiveTypes";
import { authorize } from "@/lib/authorization/policy";

export class MobileLivePermissionService {
  /**
   * Vérifie si un utilisateur peut démarrer un live dans un contexte donné
   */
  static async canStartLive(params: {
    userId: string;
    context: MobileLiveContext;
    ownerId?: string;
    ownerType?: "USER" | "CHURCH";
  }): Promise<MobileLivePermissions> {
    const { userId, context, ownerId, ownerType } = params;

    // Permissions de base
    const permissions: MobileLivePermissions = {
      canStartLive: false,
      canStreamToChurch: false,
      canRecord: true,
      canUseChat: true,
      canUseReactions: true,
      canMultiStream: false,
    };

    // Vérifier si l'utilisateur existe et n'est pas banni
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { church: true },
    });

    if (!user) {
      permissions.reason = "User not found";
      return permissions;
    }

    if (user.isBanned || user.isSuspended) {
      permissions.reason = "User account suspended or banned";
      return permissions;
    }

    // Vérifier les permissions granulaires (LIVE_CREATE)
    const userPermissions = (user.permissions as any) || {};
    const hasLiveCreatePermission = userPermissions.LIVE_CREATE === true;

    // Contexte personnel
    if (context === "PERSONAL") {
      permissions.canStartLive = true;
      permissions.canMultiStream = user.role === "ADMIN" || user.role === "MODERATOR" || hasLiveCreatePermission;
      return permissions;
    }

    // Contexte église
    if (context === "CHURCH" && ownerType === "CHURCH" && ownerId) {
      // Vérifier si l'utilisateur est admin de l'église
      const churchAdmin = await prisma.churchAdmin.findFirst({
        where: {
          userId,
          churchId: ownerId,
        },
      });

      if (churchAdmin) {
        permissions.canStartLive = true;
        permissions.canStreamToChurch = true;
        permissions.canMultiStream = true;
        return permissions;
      }

      // Vérifier si l'utilisateur a la permission LIVE_CREATE pour cette église
      if (hasLiveCreatePermission) {
        // Vérifier si l'utilisateur est membre de cette église
        const churchMember = await prisma.churchMember.findFirst({
          where: {
            userId,
            churchId: ownerId,
          },
        });

        if (churchMember) {
          permissions.canStartLive = true;
          permissions.canStreamToChurch = true;
          permissions.canMultiStream = false;
          return permissions;
        }
      }

      // Vérifier si l'utilisateur est admin principal (super admin)
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        permissions.canStartLive = true;
        permissions.canStreamToChurch = true;
        permissions.canMultiStream = true;
        return permissions;
      }

      permissions.reason = "User is not authorized to stream to this church";
      return permissions;
    }

    permissions.reason = "Invalid context or owner";
    return permissions;
  }

  /**
   * Vérifie si un utilisateur peut arrêter un live
   */
  static async canStopLive(params: {
    userId: string;
    broadcastId: string;
  }): Promise<boolean> {
    const authorization = await authorize({
      actorId: params.userId,
      action: "MOBILELIVE_STOP",
      resourceId: params.broadcastId,
    });

    return authorization.decision === "ALLOW";
  }

  /**
   * Vérifie si un utilisateur peut modérer un live.
   * La décision est désormais centralisée dans la policy d'autorisation.
   */
  static async canModerateLive(params: {
    userId: string;
    broadcastId: string;
  }): Promise<boolean> {
    const authorization = await authorize({
      actorId: params.userId,
      action: "MOBILELIVE_MODERATE",
      resourceId: params.broadcastId,
    });

    return authorization.decision === "ALLOW";
  }

  /**
   * Obtient le contexte de diffusion approprié pour une page donnée
   */
  static async getBroadcastContext(params: {
    userId: string;
    churchSlug?: string;
  }): Promise<{
    context: MobileLiveContext;
    ownerId: string;
    ownerType: "USER" | "CHURCH";
    ownerName: string;
  } | null> {
    const { userId, churchSlug } = params;

    // Si on est sur une page d'église
    if (churchSlug) {
      const church = await prisma.church.findUnique({
        where: { slug: churchSlug },
      });

      if (!church) {
        return null;
      }

      return {
        context: "CHURCH",
        ownerId: church.id,
        ownerType: "CHURCH",
        ownerName: church.name,
      };
    }

    // Sinon, contexte personnel
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return {
      context: "PERSONAL",
      ownerId: userId,
      ownerType: "USER",
      ownerName: user.name || "User",
    };
  }
}
