/**
 * Broadcast Provider Interface
 * 
 * Defines the contract for all external streaming platform providers.
 * Each platform (YouTube, Facebook, Twitch, RTMP) must implement this interface.
 */

export interface BroadcastCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  metadata?: Record<string, unknown>;
}

export interface StreamConfig {
  title: string;
  description?: string;
  privacy?: 'public' | 'unlisted' | 'private';
  tags?: string[];
  thumbnailUrl?: string;
}

export interface StreamDestination {
  streamUrl: string;
  streamKey: string;
  ingestUrl?: string;
  playbackUrl?: string;
  streamId?: string;
}

export interface StreamStatus {
  id: string;
  status: 'idle' | 'live' | 'starting' | 'stopping' | 'error';
  viewerCount?: number;
  startedAt?: Date;
  health?: 'good' | 'degraded' | 'poor';
}

export interface BroadcastProvider {
  /**
   * Platform identifier
   */
  readonly platform: string;

  /**
   * Platform display name
   */
  readonly displayName: string;

  /**
   * Initiates OAuth connection flow
   * Returns authorization URL for user to grant permissions
   */
  getAuthorizationUrl(
    redirectUri: string,
    state?: string
  ): Promise<string>;

  /**
   * Exchanges authorization code for access tokens
   */
  exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<BroadcastCredentials>;

  /**
   * Refreshes expired access tokens
   */
  refreshToken(
    refreshToken: string
  ): Promise<BroadcastCredentials>;

  /**
   * Validates that credentials are still valid
   */
  validateCredentials(
    credentials: BroadcastCredentials
  ): Promise<boolean>;

  /**
   * Creates a new live stream
   */
  createStream(
    credentials: BroadcastCredentials,
    config: StreamConfig
  ): Promise<StreamDestination>;

  /**
   * Starts streaming to a destination
   */
  startStream(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<void>;

  /**
   * Stops an active stream
   */
  stopStream(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<void>;

  /**
   * Gets current status of a stream
   */
  getStreamStatus(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<StreamStatus>;

  /**
   * Updates stream configuration
   */
  updateStream(
    credentials: BroadcastCredentials,
    streamId: string,
    config: Partial<StreamConfig>
  ): Promise<void>;

  /**
   * Tests connection to platform
   */
  testConnection(
    credentials: BroadcastCredentials
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Revokes access tokens
   */
  revokeAccess(
    credentials: BroadcastCredentials
  ): Promise<void>;
}

/**
 * Base provider with common functionality
 */
export abstract class BaseBroadcastProvider implements BroadcastProvider {
  abstract readonly platform: string;
  abstract readonly displayName: string;

  abstract getAuthorizationUrl(
    redirectUri: string,
    state?: string
  ): Promise<string>;

  abstract exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<BroadcastCredentials>;

  abstract refreshToken(
    refreshToken: string
  ): Promise<BroadcastCredentials>;

  abstract validateCredentials(
    credentials: BroadcastCredentials
  ): Promise<boolean>;

  abstract createStream(
    credentials: BroadcastCredentials,
    config: StreamConfig
  ): Promise<StreamDestination>;

  abstract startStream(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<void>;

  abstract stopStream(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<void>;

  abstract getStreamStatus(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<StreamStatus>;

  abstract updateStream(
    credentials: BroadcastCredentials,
    streamId: string,
    config: Partial<StreamConfig>
  ): Promise<void>;

  abstract testConnection(
    credentials: BroadcastCredentials
  ): Promise<{ success: boolean; error?: string }>;

  abstract revokeAccess(
    credentials: BroadcastCredentials
  ): Promise<void>;

  /**
   * Common error handling
   */
  protected handleError(error: unknown, context: string): never {
    console.error(`[${this.platform}] ${context}:`, error);
    
    if (error instanceof Error) {
      throw new Error(`${this.platform} ${context}: ${error.message}`);
    }
    
    throw new Error(`${this.platform} ${context}: Unknown error`);
  }

  /**
   * Validates required configuration
   */
  protected validateConfig(config: StreamConfig): void {
    if (!config.title || config.title.trim().length === 0) {
      throw new Error('Stream title is required');
    }
  }
}

/**
 * Provider registry for managing all broadcast providers
 */
export class BroadcastProviderRegistry {
  private static providers: Map<string, BroadcastProvider> = new Map();

  static register(provider: BroadcastProvider): void {
    this.providers.set(provider.platform, provider);
  }

  static get(platform: string): BroadcastProvider | undefined {
    return this.providers.get(platform);
  }

  static getAll(): BroadcastProvider[] {
    return Array.from(this.providers.values());
  }

  static has(platform: string): boolean {
    return this.providers.has(platform);
  }
}

/**
 * Platform types
 */
export type BroadcastPlatform = 
  | 'YOUTUBE'
  | 'FACEBOOK'
  | 'TWITCH'
  | 'RTMP'
  | 'VIMEO'
  | 'X'
  | 'LINKEDIN';

/**
 * Owner types for broadcast accounts
 */
export type BroadcastOwnerType = 'USER' | 'CHURCH';

/**
 * Account status
 */
export type BroadcastAccountStatus = 
  | 'ACTIVE'
  | 'REVOKED'
  | 'EXPIRED'
  | 'ERROR';

/**
 * Stream status
 */
export type BroadcastStreamStatus = 
  | 'idle'
  | 'live'
  | 'starting'
  | 'stopping'
  | 'error';
