import {
  BaseBroadcastProvider,
  BroadcastCredentials,
  StreamConfig,
  StreamDestination,
  StreamStatus
} from '../provider';

/**
 * RTMP Custom Broadcast Provider
 * 
 * Implements custom RTMP destinations for any RTMP-compatible platform
 */
export class RTMPProvider extends BaseBroadcastProvider {
  readonly platform = 'RTMP';
  readonly displayName = 'Custom RTMP';

  constructor() {
    super();
  }

  async getAuthorizationUrl(
    redirectUri: string,
    state?: string
  ): Promise<string> {
    // RTMP doesn't use OAuth - credentials are manually configured
    throw new Error('RTMP provider does not use OAuth');
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<BroadcastCredentials> {
    // RTMP doesn't use OAuth
    throw new Error('RTMP provider does not use OAuth');
  }

  async refreshToken(
    refreshToken: string
  ): Promise<BroadcastCredentials> {
    // RTMP doesn't use OAuth
    throw new Error('RTMP provider does not use OAuth');
  }

  async validateCredentials(
    credentials: BroadcastCredentials
  ): Promise<boolean> {
    // RTMP credentials are validated when the stream is created
    // Store RTMP URL and stream key in metadata
    return !!(credentials.metadata?.rtmpUrl && credentials.metadata?.streamKey);
  }

  async createStream(
    credentials: BroadcastCredentials,
    config: StreamConfig
  ): Promise<StreamDestination> {
    this.validateConfig(config);

    try {
      const rtmpUrl = credentials.metadata?.rtmpUrl as string;
      const streamKey = credentials.metadata?.streamKey as string;

      if (!rtmpUrl || !streamKey) {
        throw new Error('RTMP URL and stream key are required in credentials metadata');
      }

      return {
        streamUrl: rtmpUrl,
        streamKey: streamKey,
        ingestUrl: rtmpUrl,
        playbackUrl: credentials.metadata?.playbackUrl as string,
        streamId: Buffer.from(`${rtmpUrl}:${streamKey}`).toString('base64')
      };
    } catch (error) {
      this.handleError(error, 'stream creation');
    }
  }

  async startStream(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<void> {
    // RTMP streams start automatically when the encoder connects
    // This method is a no-op but kept for interface consistency
  }

  async stopStream(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<void> {
    // RTMP streams stop automatically when the encoder disconnects
    // This method is a no-op but kept for interface consistency
  }

  async getStreamStatus(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<StreamStatus> {
    // RTMP doesn't provide status information
    // Return idle status as default
    return {
      id: streamId,
      status: 'idle'
    };
  }

  async updateStream(
    credentials: BroadcastCredentials,
    streamId: string,
    config: Partial<StreamConfig>
  ): Promise<void> {
    // RTMP streams cannot be updated via API
    // This method is a no-op but kept for interface consistency
  }

  async testConnection(
    credentials: BroadcastCredentials
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const isValid = await this.validateCredentials(credentials);
      return { success: isValid };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async revokeAccess(
    credentials: BroadcastCredentials
  ): Promise<void> {
    // RTMP doesn't have access to revoke
    // This method is a no-op but kept for interface consistency
  }
}
