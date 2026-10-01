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
}): Promise<boolean> {
  const result = await authorize(params);
  return result.decision === "ALLOW";
}
