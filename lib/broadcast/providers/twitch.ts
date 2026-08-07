import {
  BaseBroadcastProvider,
  BroadcastCredentials,
  StreamConfig,
  StreamDestination,
  StreamStatus
} from '../provider';

/**
 * Twitch Broadcast Provider
 * 
 * Implements Twitch streaming via Twitch Helix API
 */
export class TwitchProvider extends BaseBroadcastProvider {
  readonly platform = 'TWITCH';
  readonly displayName = 'Twitch';

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly scopes = [
    'channel:manage:broadcast',
    'channel:stream:read',
    'channel:read:subscriptions'
  ];

  constructor() {
    super();
    this.clientId = process.env.TWITCH_CLIENT_ID || '';
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET || '';

    if (!this.clientId || !this.clientSecret) {
      console.warn('Twitch provider: Missing credentials');
    }
  }

  async getAuthorizationUrl(
    redirectUri: string,
    state?: string
  ): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      scope: this.scopes.join(' '),
      response_type: 'code',
      ...(state && { state })
    });

    return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<BroadcastCredentials> {
    try {
      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token exchange failed: ${error}`);
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        metadata: {
          tokenType: data.token_type,
          scope: data.scope
        }
      };
    } catch (error) {
      this.handleError(error, 'token exchange');
    }
  }

  async refreshToken(
    refreshToken: string
  ): Promise<BroadcastCredentials> {
    try {
      const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token refresh failed: ${error}`);
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt: Date.now() + (data.expires_in * 1000),
        metadata: {
          tokenType: data.token_type,
          scope: data.scope
        }
      };
    } catch (error) {
      this.handleError(error, 'token refresh');
    }
  }

  async validateCredentials(
    credentials: BroadcastCredentials
  ): Promise<boolean> {
    try {
      const response = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Client-Id': this.clientId
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async createStream(
    credentials: BroadcastCredentials,
    config: StreamConfig
  ): Promise<StreamDestination> {
    this.validateConfig(config);

    try {
      // Get user info to obtain channel ID
      const userResponse = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Client-Id': this.clientId
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await userResponse.json();
      const userId = userData.data?.[0]?.id;

      if (!userId) {
        throw new Error('User not found');
      }

      // Update channel information
      const channelResponse = await fetch(
        `https://api.twitch.tv/helix/channels?broadcaster_id=${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Client-Id': this.clientId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: config.title,
            game_id: config.tags?.[0] || '' // Twitch uses game_id instead of tags
          })
        }
      );

      if (!channelResponse.ok) {
        const error = await channelResponse.text();
        throw new Error(`Channel update failed: ${error}`);
      }

      // Get stream key
      const streamKeyResponse = await fetch(
        `https://api.twitch.tv/helix/streams/key?broadcaster_id=${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Client-Id': this.clientId
          }
        }
      );

      if (!streamKeyResponse.ok) {
        throw new Error('Failed to get stream key');
      }

      const streamKeyData = await streamKeyResponse.json();

      return {
        streamUrl: 'rtmp://live.twitch.tv/app',
        streamKey: streamKeyData.data?.[0]?.stream_key || '',
        ingestUrl: 'rtmp://live.twitch.tv/app',
        playbackUrl: `https://www.twitch.tv/${userData.data[0].login}`,
        streamId: userId
      };
    } catch (error) {
      this.handleError(error, 'stream creation');
    }
  }

  async startStream(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<void> {
    // Twitch streams start automatically when the encoder connects
    // This method is a no-op but kept for interface consistency
  }

  async stopStream(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<void> {
    // Twitch streams stop automatically when the encoder disconnects
    // This method is a no-op but kept for interface consistency
  }

  async getStreamStatus(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<StreamStatus> {
    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/streams?user_id=${streamId}`,
        {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Client-Id': this.clientId
          }
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Status check failed: ${error}`);
      }

      const data = await response.json();
      const stream = data.data?.[0];

      return {
        id: streamId,
        status: stream ? 'live' : 'idle',
        viewerCount: stream?.viewer_count || 0,
        startedAt: stream?.started_at ? new Date(stream.started_at) : undefined
      };
    } catch (error) {
      this.handleError(error, 'status check');
    }
  }

  async updateStream(
    credentials: BroadcastCredentials,
    streamId: string,
    config: Partial<StreamConfig>
  ): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {};

      if (config.title) {
        updateData.title = config.title;
      }
      if (config.tags?.[0]) {
        updateData.game_id = config.tags[0];
      }

      const response = await fetch(
        `https://api.twitch.tv/helix/channels?broadcaster_id=${streamId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Client-Id': this.clientId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Stream update failed: ${error}`);
      }
    } catch (error) {
      this.handleError(error, 'stream update');
    }
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
    try {
      await fetch('https://id.twitch.tv/oauth2/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.clientId,
          token: credentials.accessToken
        }).toString()
      });
    } catch (error) {
      this.handleError(error, 'access revocation');
    }
  }
}
