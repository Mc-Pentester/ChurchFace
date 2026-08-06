/**
 * Studio Permission Service
 * Centralized permission checking for Studio Live access
 * 
 * Rules:
 * - ADMIN global: authorized for all studios
 * - ChurchAdmin OWNER: authorized only for their church
 * - ChurchAdmin ADMIN: authorized for their church
 * - USER: denied (unless they are the broadcast owner in USER context)
 */

import { prisma } from "@/lib/prisma";

export interface StudioAccessParams {
  userId: string;
  userRole?: string;
  churchSlug?: string;
  broadcastId?: string;
}

export interface StudioAccessResult {
  authorized: boolean;
  reason?: string;
  churchId?: string;
  churchRole?: string;
}

export class StudioPermissionService {
  /**
   * Check if a user can access Studio Live
   */
  static async canAccessStudio(params: StudioAccessParams): Promise<StudioAccessResult> {
    const { userId, userRole, churchSlug, broadcastId } = params;

    // 1. ADMIN global has full access
    if (userRole === "ADMIN") {
      return {
        authorized: true,
        reason: "Global administrator",
      };
    }

    // 2. Church context: check church admin status
    if (churchSlug) {
      const church = await prisma.church.findUnique({
        where: { slug: churchSlug },
      });

      if (!church) {
        return {
          authorized: false,
          reason: "Church not found",
        };
      }

      const churchAdmin = await prisma.churchAdmin.findFirst({
        where: {
          userId,
          churchId: church.id,
        },
      });

      if (churchAdmin) {
        // OWNER and ADMIN roles both have access
        if (churchAdmin.role === "OWNER" || churchAdmin.role === "CHURCH_ADMIN") {
          return {
            authorized: true,
            reason: `Church ${churchAdmin.role}`,
            churchId: church.id,
            churchRole: churchAdmin.role,
          };
        }
      }

      return {
        authorized: false,
        reason: "Not a church admin",
      };
    }

    // 3. Broadcast context: check if user is the owner
    if (broadcastId) {
      const broadcast = await prisma.liveBroadcast.findUnique({
        where: { id: broadcastId },
      });

      if (!broadcast) {
        return {
          authorized: false,
          reason: "Broadcast not found",
        };
      }

      // USER context: user must be the author
      if (broadcast.ownerType === "USER" && broadcast.authorId === userId) {
        return {
          authorized: true,
          reason: "Broadcast owner",
        };
      }

      // CHURCH context: check church admin
      if (broadcast.ownerType === "CHURCH" && broadcast.ownerId) {
        const churchAdmin = await prisma.churchAdmin.findFirst({
          where: {
            userId,
            churchId: broadcast.ownerId,
          },
        });

        if (churchAdmin) {
          return {
            authorized: true,
            reason: `Church ${churchAdmin.role}`,
            churchId: broadcast.ownerId,
            churchRole: churchAdmin.role,
          };
        }
      }

      return {
        authorized: false,
        reason: "Not authorized for this broadcast",
      };
    }

    // 4. No context provided: deny
    return {
      authorized: false,
      reason: "No context provided",
    };
  }

  /**
   * Get studio context with permissions
   */
  static async getStudioContext(params: StudioAccessParams) {
    const access = await this.canAccessStudio(params);

    if (!access.authorized) {
      throw new Error(access.reason || "Access denied");
    }

    // If church context, return church details
    if (params.churchSlug && access.churchId) {
      const church = await prisma.church.findUnique({
        where: { id: access.churchId },
      });

      return {
        authorized: true,
        churchId: access.churchId,
        churchRole: access.churchRole,
        churchName: church?.name,
        churchSlug: church?.slug,
      };
    }

    // If broadcast context, return broadcast details
    if (params.broadcastId) {
      const broadcast = await prisma.liveBroadcast.findUnique({
        where: { id: params.broadcastId },
        include: { author: true },
      });

      return {
        authorized: true,
        broadcastId: broadcast?.id,
        broadcastName: broadcast?.title,
        ownerType: broadcast?.ownerType,
        ownerId: broadcast?.ownerId,
        authorId: broadcast?.authorId,
      };
    }

    return access;
  }
}
