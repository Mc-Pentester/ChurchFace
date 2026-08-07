import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/broadcast-encryption';
import { getProvider } from './registry';
import { getAvailableDestinations } from '@/lib/broadcast-perms';

/**
 * Broadcast Hub Service
 * 
 * Provides the interface for Studio Pro to interact with broadcast destinations.
 * Studio Pro doesn't manage accounts - it only receives available destinations.
 */

export interface BroadcastHubDestination {
  id: string;
  name: string;
  platform: string;
  enabled: boolean;
  isDefault: boolean;
  configuration?: Record<string, unknown>;
  ownerType: 'USER' | 'CHURCH';
  accountId: string;
}

export interface BroadcastContext {
  type: 'USER' | 'CHURCH';
  userId?: string;
  churchId?: string;
}

/**
 * Get available destinations for a broadcast context
 * This is what Studio Pro calls to get destination options
 */
export async function getBroadcastDestinations(
  context: BroadcastContext
): Promise<BroadcastHubDestination[]> {
  const destinations = await getAvailableDestinations(context);
  
  return destinations.map(dest => ({
    id: dest.id,
    name: dest.name,
    platform: dest.platform,
    enabled: dest.enabled,
    isDefault: dest.isDefault,
    configuration: dest.configuration as Record<string, unknown>,
    ownerType: dest.ownerType,
    accountId: dest.accountId
  }));
}

/**
 * Get stream credentials for a specific destination
 * Called by Studio Pro when starting a stream to a destination
 */
export async function getDestinationCredentials(
  destinationId: string,
  context: BroadcastContext
): Promise<{
  streamUrl: string;
  streamKey: string;
  platform: string;
}> {
  const destination = await prisma.broadcastDestination.findUnique({
    where: { id: destinationId },
    include: { account: true }
  });

  if (!destination) {
    throw new Error('Destination not found');
  }

  // Verify context matches account ownership
  if (destination.account.ownerType === 'USER') {
    if (context.type !== 'USER' || context.userId !== destination.account.userId) {
      throw new Error('Unauthorized access to destination');
    }
  } else if (destination.account.ownerType === 'CHURCH') {
    if (context.type !== 'CHURCH' || context.churchId !== destination.account.churchId) {
      throw new Error('Unauthorized access to destination');
    }
  }

  const configuration = destination.configuration as Record<string, unknown> | undefined;

  // For OAuth platforms, we may need to fetch fresh stream keys
  if (destination.account.accessTokenEncrypted) {
    const encryptionKey = process.env.BROADCAST_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    const accessToken = decrypt(destination.account.accessTokenEncrypted, encryptionKey);
    const provider = getProvider(destination.platform);

    if (provider) {
      try {
        const streamDest = await provider.createStream(
          {
            accessToken,
            refreshToken: destination.account.refreshTokenEncrypted
              ? decrypt(destination.account.refreshTokenEncrypted, encryptionKey)
              : undefined,
            metadata: destination.account.metadata as Record<string, unknown> | undefined
          },
          {
            title: 'ChurchFace Live Stream',
            privacy: 'public'
          }
        );

        return {
          streamUrl: streamDest.streamUrl,
          streamKey: streamDest.streamKey,
          platform: destination.platform
        };
      } catch (error) {
        console.error('Error creating stream with provider:', error);
        // Fall back to stored configuration
      }
    }
  }

  // Fall back to stored configuration (for RTMP or cached OAuth)
  if (configuration?.streamUrl && configuration?.streamKey) {
    return {
      streamUrl: configuration.streamUrl as string,
      streamKey: configuration.streamKey as string,
      platform: destination.platform
    };
  }

  throw new Error('No valid credentials available for destination');
}

/**
 * Update destination last used timestamp
 */
export async function markDestinationUsed(destinationId: string): Promise<void> {
  await prisma.broadcastDestination.update({
    where: { id: destinationId },
    data: { updatedAt: new Date() }
  });

  const destination = await prisma.broadcastDestination.findUnique({
    where: { id: destinationId },
    select: { broadcastAccountId: true }
  });

  if (destination) {
    await prisma.broadcastAccount.update({
      where: { id: destination.broadcastAccountId },
      data: { lastUsedAt: new Date() }
    });
  }
}

/**
 * Get ChurchFace Live as always-available destination
 * ChurchFace Live is always the primary destination
 */
export function getChurchFaceLiveDestination(): BroadcastHubDestination {
  return {
    id: 'churchface-live',
    name: 'ChurchFace Live',
    platform: 'CHURCHFACE',
    enabled: true,
    isDefault: true,
    ownerType: 'CHURCH',
    accountId: 'system'
  };
}

/**
 * Get all available destinations including ChurchFace Live
 * This is the main entry point for Studio Pro
 */
export async function getAllAvailableDestinations(
  context: BroadcastContext
): Promise<BroadcastHubDestination[]> {
  const externalDestinations = await getBroadcastDestinations(context);
  
  // Always include ChurchFace Live as first option
  return [
    getChurchFaceLiveDestination(),
    ...externalDestinations
  ];
}

/**
 * Validate destination accessibility for a user
 */
export async function canAccessDestination(
  destinationId: string,
  userId: string,
  churchId?: string
): Promise<boolean> {
  const destination = await prisma.broadcastDestination.findUnique({
    where: { id: destinationId },
    include: { account: true }
  });

  if (!destination) {
    return false;
  }

  if (destination.account.ownerType === 'USER') {
    return destination.account.userId === userId;
  }

  if (destination.account.ownerType === 'CHURCH') {
    if (!churchId) {
      return false;
    }
    return destination.account.churchId === churchId;
  }

  return false;
}

/**
 * Get platform display name
 */
export function getPlatformDisplayName(platform: string): string {
  const displayNames: Record<string, string> = {
    'YOUTUBE': 'YouTube Live',
    'FACEBOOK': 'Facebook Live',
    'TWITCH': 'Twitch',
    'RTMP': 'Custom RTMP',
    'CHURCHFACE': 'ChurchFace Live',
    'VIMEO': 'Vimeo',
    'X': 'X (Twitter)',
    'LINKEDIN': 'LinkedIn Live'
  };

  return displayNames[platform] || platform;
}

/**
 * Get platform icon (for UI)
 */
export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    'YOUTUBE': '📺',
    'FACEBOOK': '📘',
    'TWITCH': '🎮',
    'RTMP': '🔗',
    'CHURCHFACE': '⛪',
    'VIMEO': '🎬',
    'X': '✖️',
    'LINKEDIN': '💼'
  };

  return icons[platform] || '📡';
}
