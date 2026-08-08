import { prisma } from '@/lib/prisma';
import { normalizeChurchRole } from '@/lib/church-role';

/**
 * Broadcast permission system
 * 
 * Manages permissions for broadcast operations across personal and church contexts.
 */

export type BroadcastRole = 
  | 'CHURCH_OWNER'
  | 'CHURCH_ADMIN'
  | 'BROADCAST_MANAGER'
  | 'STUDIO_OPERATOR'
  | 'VIEWER';

export type BroadcastPermission = 
  | 'MANAGE_ACCOUNTS'
  | 'MANAGE_DESTINATIONS'
  | 'START_STREAM'
  | 'STOP_STREAM'
  | 'VIEW_STREAMS'
  | 'CONFIGURE_STREAM';

/**
 * Gets the broadcast role for a user in a church context
 */
export async function getBroadcastRole(
  churchId: string,
  userId: string
): Promise<BroadcastRole | null> {
  // Check BroadcastPermission table first
  const broadcastPermission = await prisma.broadcastPermission.findUnique({
    where: {
      churchId_userId: {
        churchId,
        userId
      }
    },
    select: {
      role: true
    }
  });

  if (broadcastPermission) {
    return broadcastPermission.role as BroadcastRole;
  }

  // Fall back to ChurchAdmin roles
  const churchAdmin = await prisma.churchAdmin.findUnique({
    where: {
      churchId_userId: {
        churchId,
        userId
      }
    },
    select: {
      role: true
    }
  });

  if (churchAdmin) {
    const normalizedRole = normalizeChurchRole(churchAdmin.role);
    if (normalizedRole === 'CHURCH_OWNER' || normalizedRole === 'CHURCH_ADMIN') {
      return normalizedRole as BroadcastRole;
    }
  }

  return null;
}

/**
 * Checks if a user has a specific broadcast permission
 */
export async function hasBroadcastPermission(
  churchId: string,
  userId: string,
  permission: BroadcastPermission
): Promise<boolean> {
  const role = await getBroadcastRole(churchId, userId);

  if (!role) {
    return false;
  }

  const rolePermissions = getRolePermissions(role);
  return rolePermissions.includes(permission);
}

/**
 * Gets all permissions for a given broadcast role
 */
function getRolePermissions(role: BroadcastRole): BroadcastPermission[] {
  switch (role) {
    case 'CHURCH_OWNER':
      return [
        'MANAGE_ACCOUNTS',
        'MANAGE_DESTINATIONS',
        'START_STREAM',
        'STOP_STREAM',
        'VIEW_STREAMS',
        'CONFIGURE_STREAM'
      ];

    case 'CHURCH_ADMIN':
      return [
        'MANAGE_ACCOUNTS',
        'MANAGE_DESTINATIONS',
        'START_STREAM',
        'STOP_STREAM',
        'VIEW_STREAMS',
        'CONFIGURE_STREAM'
      ];

    case 'BROADCAST_MANAGER':
      return [
        'MANAGE_ACCOUNTS',
        'MANAGE_DESTINATIONS',
        'START_STREAM',
        'STOP_STREAM',
        'VIEW_STREAMS',
        'CONFIGURE_STREAM'
      ];

    case 'STUDIO_OPERATOR':
      return [
        'START_STREAM',
        'STOP_STREAM',
        'VIEW_STREAMS',
        'CONFIGURE_STREAM'
      ];

    case 'VIEWER':
      return ['VIEW_STREAMS'];

    default:
      return [];
  }
}

/**
 * Checks if a user can manage broadcast accounts for a church
 */
export async function canManageBroadcastAccounts(
  churchId: string,
  userId: string
): Promise<boolean> {
  return hasBroadcastPermission(churchId, userId, 'MANAGE_ACCOUNTS');
}

/**
 * Checks if a user can manage broadcast destinations for a church
 */
export async function canManageBroadcastDestinations(
  churchId: string,
  userId: string
): Promise<boolean> {
  return hasBroadcastPermission(churchId, userId, 'MANAGE_DESTINATIONS');
}

/**
 * Checks if a user can start a stream for a church
 */
export async function canStartStream(
  churchId: string,
  userId: string
): Promise<boolean> {
  return hasBroadcastPermission(churchId, userId, 'START_STREAM');
}

/**
 * Checks if a user can stop a stream for a church
 */
export async function canStopStream(
  churchId: string,
  userId: string
): Promise<boolean> {
  return hasBroadcastPermission(churchId, userId, 'STOP_STREAM');
}

/**
 * Checks if a user can configure a stream for a church
 */
export async function canConfigureStream(
  churchId: string,
  userId: string
): Promise<boolean> {
  return hasBroadcastPermission(churchId, userId, 'CONFIGURE_STREAM');
}

/**
 * Middleware: Throws error if user lacks broadcast permission
 */
export async function requireBroadcastPermissionOrThrow(
  churchId: string,
  userId: string,
  permission: BroadcastPermission
): Promise<void> {
  const authorized = await hasBroadcastPermission(
    churchId,
    userId,
    permission
  );

  if (!authorized) {
    const error = new Error('Forbidden') as Error & { status?: number };
    error.status = 403;
    throw error;
  }
}

/**
 * Checks if a user can access personal broadcast accounts
 */
export function canAccessPersonalBroadcastAccounts(
  userId: string,
  accountUserId: string
): boolean {
  return userId === accountUserId;
}

/**
 * Gets available broadcast destinations based on context
 * 
 * Context determines whether to use personal or church broadcast hub
 */
export async function getAvailableDestinations(
  context: {
    type: 'USER' | 'CHURCH';
    userId?: string;
    churchId?: string;
  }
) {
  if (context.type === 'USER' && context.userId) {
    // Get personal broadcast destinations
    const accounts = await prisma.broadcastAccount.findMany({
      where: {
        ownerType: 'USER',
        userId: context.userId,
        status: 'ACTIVE'
      },
      include: {
        destinations: {
          where: {
            enabled: true
          }
        }
      }
    });

    return accounts.flatMap(account => 
      account.destinations.map(dest => ({
        id: dest.id,
        name: dest.name,
        platform: dest.platform,
        enabled: dest.enabled,
        configuration: dest.configuration,
        isDefault: dest.isDefault,
        ownerType: 'USER' as const,
        accountId: account.id
      }))
    );
  }

  if (context.type === 'CHURCH' && context.churchId) {
    // Get church broadcast destinations
    const accounts = await prisma.broadcastAccount.findMany({
      where: {
        ownerType: 'CHURCH',
        churchId: context.churchId,
        status: 'ACTIVE'
      },
      include: {
        destinations: {
          where: {
            enabled: true
          }
        }
      }
    });

    return accounts.flatMap(account => 
      account.destinations.map(dest => ({
        id: dest.id,
        name: dest.name,
        platform: dest.platform,
        enabled: dest.enabled,
        configuration: dest.configuration,
        isDefault: dest.isDefault,
        ownerType: 'CHURCH' as const,
        accountId: account.id
      }))
    );
  }

  return [];
}

/**
 * Assigns a broadcast role to a user in a church
 */
export async function assignBroadcastRole(
  churchId: string,
  userId: string,
  role: BroadcastRole
): Promise<void> {
  await prisma.broadcastPermission.upsert({
    where: {
      churchId_userId: {
        churchId,
        userId
      }
    },
    create: {
      churchId,
      userId,
      role,
      permissions: JSON.stringify(getRolePermissions(role))
    },
    update: {
      role,
      permissions: JSON.stringify(getRolePermissions(role))
    }
  });
}

/**
 * Removes a broadcast role from a user in a church
 */
export async function removeBroadcastRole(
  churchId: string,
  userId: string
): Promise<void> {
  await prisma.broadcastPermission.deleteMany({
    where: {
      churchId,
      userId
    }
  });
}
