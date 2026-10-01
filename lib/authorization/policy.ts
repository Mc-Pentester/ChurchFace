import { prisma } from "@/lib/prisma";
import {
  getAccountStateReason,
  isAccountBlocked,
} from "./account-state";
import {
  hasStudioGlobalRole,
  isGlobalAdminRole,
} from "./global-role";
import type {
  AuthorizationAction,
  AuthorizationActor,
  AuthorizationResult,
} from "./types";

function allow(actor: AuthorizationActor): AuthorizationResult {
  return {
    decision: "ALLOW",
    status: 200,
    actorId: actor.id,
    role: actor.role,
  };
}

function deny(
  actorId: string | null,
  decision: AuthorizationResult["decision"],
  status: 401 | 403,
  role: string | null,
  reason: string
): AuthorizationResult {
  return {
    decision,
    status,
    actorId,
    role,
    reason,
  };
}

export async function getAuthorizationActor(
  actorId: string
): Promise<AuthorizationActor | null> {
  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: {
      id: true,
      role: true,
      isBanned: true,
      isSuspended: true,
      churchId: true,
    },
  });

  if (!actor) {
    return null;
  }

  return actor;
}

/**
 * Canonical authorization entry point.
 *
 * CF-03-F intentionally implements only the foundation decisions:
 * - authenticated actor lookup
 * - account state
 * - global administrator authority
 * - global Studio authority
 *
 * Resource-specific policies are migrated in later CF-03 phases.
 */
export async function authorize(params: {
  actorId?: string | null;
  action: AuthorizationAction;
  resourceId?: string;
  churchId?: string | null;
  prayerChainId?: string | null;
  prayerCampaignId?: string | null;
  prayerRoomId?: string | null;
}): Promise<AuthorizationResult> {
  const actorId = params.actorId ?? null;

  if (!actorId) {
    return deny(
      null,
      "DENY_UNAUTHENTICATED",
      401,
      null,
      "Authentication required"
    );
  }

  const actor = await getAuthorizationActor(actorId);

  if (!actor) {
    return deny(
      actorId,
      "DENY_UNAUTHENTICATED",
      401,
      null,
      "Authenticated user no longer exists"
    );
  }

  const accountState = {
    isBanned: actor.isBanned,
    isSuspended: actor.isSuspended,
  };

  if (isAccountBlocked(accountState)) {
    return deny(
      actor.id,
      "DENY_ACCOUNT_STATE",
      403,
      actor.role,
      getAccountStateReason(accountState) || "Account is blocked"
    );
  }

  switch (params.action) {
    case "GLOBAL_ADMIN":
      return isGlobalAdminRole(actor.role)
        ? allow(actor)
        : deny(
            actor.id,
            "DENY_FORBIDDEN",
            403,
            actor.role,
            "Global administrator role required"
          );

    case "STUDIO_ACCESS":
      return hasStudioGlobalRole(actor.role)
        ? allow(actor)
        : deny(
            actor.id,
            "DENY_FORBIDDEN",
            403,
            actor.role,
            "Studio authority required"
          );

    case "MOBILELIVE_START":
    case "MOBILELIVE_STOP":
    case "MOBILELIVE_MODERATE":
    case "MOBILELIVE_VIEW":
    case "MOBILELIVE_STATS_UPDATE": {
      if (!params.resourceId) {
        return deny(
          actor.id,
          "DENY_FORBIDDEN",
          403,
          actor.role,
          "MobileLive resource is required"
        );
      }

      const broadcast = await prisma.liveBroadcast.findUnique({
        where: { id: params.resourceId },
        select: {
          id: true,
          authorId: true,
          ownerId: true,
          ownerType: true,
        },
      });

      if (!broadcast) {
        return deny(
          actor.id,
          "DENY_FORBIDDEN",
          403,
          actor.role,
          "MobileLive resource not found"
        );
      }

      const isGlobalAdmin = isGlobalAdminRole(actor.role);
      const isOwner = broadcast.authorId === actor.id;

      let isChurchAdmin = false;
      if (broadcast.ownerType === "CHURCH" && broadcast.ownerId) {
        const churchAdmin = await prisma.churchAdmin.findUnique({
          where: {
            churchId_userId: {
              churchId: broadcast.ownerId,
              userId: actor.id,
            },
          },
          select: { role: true },
        });
        isChurchAdmin = !!churchAdmin;
      }

      if (params.action === "MOBILELIVE_VIEW") {
        return isOwner || isGlobalAdmin || isChurchAdmin
          ? allow(actor)
          : deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "MobileLive access denied");
      }

      if (isGlobalAdmin || isOwner || isChurchAdmin) {
        return allow(actor);
      }

      return deny(
        actor.id,
        "DENY_FORBIDDEN",
        403,
        actor.role,
        "MobileLive contextual authority required"
      );
    }

    case "PRAYER_CREATE":
    case "PRAYER_ROOM_CREATE":
    case "PRAYER_CAMPAIGN_CREATE":
    case "PRAYER_ROOM_VIEW":
    case "PRAYER_ROOM_JOIN":
    case "PRAYER_DELETE": {
      const isGlobalAdmin = isGlobalAdminRole(actor.role);

      if (params.action === "PRAYER_DELETE") {
        if (!params.resourceId) {
          return deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Prayer resource is required");
        }
        const prayer = await prisma.prayerRequest.findUnique({
          where: { id: params.resourceId },
          select: { userId: true },
        });
        if (!prayer) {
          return deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Prayer resource not found");
        }
        return prayer.userId === actor.id || isGlobalAdmin
          ? allow(actor)
          : deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Prayer ownership required");
      }

      if (params.action === "PRAYER_ROOM_VIEW" || params.action === "PRAYER_ROOM_JOIN") {
        if (!params.resourceId) {
          return deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Prayer room is required");
        }
        const room = await prisma.prayerRoom.findUnique({
          where: { id: params.resourceId },
          select: {
            id: true,
            churchId: true,
            isPublic: true,
            moderatorId: true,
          },
        });
        if (!room) {
          return deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Prayer room not found");
        }
        if (isGlobalAdmin || room.moderatorId === actor.id) return allow(actor);
        if (!room.churchId) {
          return room.isPublic
            ? allow(actor)
            : deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Private prayer room access denied");
        }
        const membership = await prisma.churchMember.findUnique({
          where: { churchId_userId: { churchId: room.churchId, userId: actor.id } },
          select: { id: true },
        });
        const churchAdmin = await prisma.churchAdmin.findUnique({
          where: { churchId_userId: { churchId: room.churchId, userId: actor.id } },
          select: { id: true },
        });
        return membership || churchAdmin
          ? allow(actor)
          : deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Church-scoped prayer room access denied");
      }

      const targetChurchId = params.churchId ?? null;

      if (params.prayerChainId) {
        const chain = await prisma.prayerChain.findUnique({
          where: { id: params.prayerChainId },
          select: { churchId: true },
        });
        if (!chain) {
          return deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Prayer chain not found");
        }
        if (targetChurchId !== (chain.churchId ?? null)) {
          return deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Prayer chain church scope mismatch");
        }
      }

      if (params.prayerCampaignId) {
        const campaign = await prisma.prayerCampaign.findUnique({
          where: { id: params.prayerCampaignId },
          select: { churchId: true },
        });
        if (!campaign) {
          return deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Prayer campaign not found");
        }
        if (targetChurchId !== (campaign.churchId ?? null)) {
          return deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Prayer campaign church scope mismatch");
        }
      }

      if (params.prayerRoomId) {
        const room = await prisma.prayerRoom.findUnique({
          where: { id: params.prayerRoomId },
          select: { churchId: true },
        });
        if (!room) {
          return deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Prayer room not found");
        }
        if (targetChurchId !== (room.churchId ?? null)) {
          return deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Prayer room church scope mismatch");
        }
      }

      if (!targetChurchId) return allow(actor);
      if (isGlobalAdmin) return allow(actor);

      const member = await prisma.churchMember.findUnique({
        where: { churchId_userId: { churchId: targetChurchId, userId: actor.id } },
        select: { id: true },
      });
      const churchAdmin = await prisma.churchAdmin.findUnique({
        where: { churchId_userId: { churchId: targetChurchId, userId: actor.id } },
        select: { id: true },
      });

      if (member || churchAdmin) return allow(actor);

      return deny(
        actor.id,
        "DENY_FORBIDDEN",
        403,
        actor.role,
        "Church-scoped prayer authorization required"
      );
    }

    case "PRAYER_VIEW": {
      if (!params.resourceId) return deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Prayer resource is required");
      const prayer = await prisma.prayerRequest.findUnique({
        where: { id: params.resourceId },
        select: { userId: true, churchId: true },
      });
      if (!prayer) return deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Prayer resource not found");
      if (!prayer.churchId || prayer.userId === actor.id || isGlobalAdminRole(actor.role)) return allow(actor);
      const member = await prisma.churchMember.findUnique({
        where: { churchId_userId: { churchId: prayer.churchId, userId: actor.id } },
        select: { id: true },
      });
      const admin = await prisma.churchAdmin.findUnique({
        where: { churchId_userId: { churchId: prayer.churchId, userId: actor.id } },
        select: { id: true },
      });
      return member || admin
        ? allow(actor)
        : deny(actor.id, "DENY_FORBIDDEN", 403, actor.role, "Church-scoped prayer access denied");
    }

    case "STUDIO_BROADCAST_UPDATE":
      return isGlobalAdminRole(actor.role)
        ? allow(actor)
        : deny(
            actor.id,
            "DENY_FORBIDDEN",
            403,
            actor.role,
            "Global administrator role required for Studio broadcast update"
          );

    default:
      return deny(
        actor.id,
        "DENY_UNSUPPORTED",
        403,
        actor.role,
        "Authorization action is not implemented in CF-03-F"
      );
  }
}

export async function requireAuthorization(params: {
  actorId?: string | null;
  action: AuthorizationAction;
  resourceId?: string;
}): Promise<AuthorizationResult> {
  return authorize(params);
}

export async function isAuthorized(params: {
  actorId?: string | null;
  action: AuthorizationAction;
  resourceId?: string;
  churchId?: string | null;
  prayerChainId?: string | null;
  prayerCampaignId?: string | null;
  prayerRoomId?: string | null;
}): Promise<boolean> {
  const result = await authorize(params);
  return result.decision === "ALLOW";
}
