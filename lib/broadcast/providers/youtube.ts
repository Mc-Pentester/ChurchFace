import {
  BaseBroadcastProvider,
  BroadcastCredentials,
  StreamConfig,
  StreamDestination,
  StreamStatus
} from '../provider';

/**
 * YouTube Live Broadcast Provider
 * 
 * Implements YouTube Live streaming via YouTube Data API v3
 */
export class YouTubeProvider extends BaseBroadcastProvider {
  readonly platform = 'YOUTUBE';
  readonly displayName = 'YouTube Live';

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly scopes = [
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.upload'
  ];

  constructor() {
    super();
    this.clientId = process.env.YOUTUBE_CLIENT_ID || '';
    this.clientSecret = process.env.YOUTUBE_CLIENT_SECRET || '';

    if (!this.clientId || !this.clientSecret) {
      console.warn('YouTube provider: Missing credentials');
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
      access_type: 'offline',
      prompt: 'consent',
      ...(state && { state })
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<BroadcastCredentials> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
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
      const response = await fetch('https://oauth2.googleapis.com/token', {
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
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v3/tokeninfo',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `access_token=${credentials.accessToken}`
        }
      );

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
      // Create live stream resource
      const streamResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn,status',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            snippet: {
              title: config.title,
              description: config.description || ''
            },
            cdn: {
              ingestionType: 'rtmp',
              resolution: '720p',
              frameRate: '30fps'
            },
            status: {
              streamStatus: 'active'
            }
          })
        }
      );

      if (!streamResponse.ok) {
        const error = await streamResponse.text();
        throw new Error(`Stream creation failed: ${error}`);
      }

      const streamData = await streamResponse.json();

      // Create broadcast
      const broadcastResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,contentDetails,status',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            snippet: {
              title: config.title,
              description: config.description || '',
              scheduledStartTime: new Date().toISOString()
            },
            contentDetails: {
              monitorStream: {
                enableMonitorStream: false
              }
            },
            status: {
              privacyStatus: config.privacy || 'public',
              selfDeclaredMadeForKids: false
            }
          })
        }
      );

      if (!broadcastResponse.ok) {
        const error = await broadcastResponse.text();
        throw new Error(`Broadcast creation failed: ${error}`);
      }

      const broadcastData = await broadcastResponse.json();

      // Bind stream to broadcast
      await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?part=id,contentDetails&streamId=${streamData.id}&id=${broadcastData.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        streamUrl: streamData.cdn.ingestionInfo.ingestionUrl,
        streamKey: streamData.cdn.ingestionInfo.streamName,
        ingestUrl: streamData.cdn.ingestionInfo.ingestionUrl,
        playbackUrl: `https://www.youtube.com/watch?v=${broadcastData.id}`,
        streamId: broadcastData.id
      };
    } catch (error) {
      this.handleError(error, 'stream creation');
    }
  }

  async startStream(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<void> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?broadcastStatus=live&id=${streamId}&part=status`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Stream start failed: ${error}`);
      }
    } catch (error) {
      this.handleError(error, 'stream start');
    }
  }

  async stopStream(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<void> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts/transition?broadcastStatus=complete&id=${streamId}&part=status`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Stream stop failed: ${error}`);
      }
    } catch (error) {
      this.handleError(error, 'stream stop');
    }
  }

  async getStreamStatus(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<StreamStatus> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=id,snippet,status,contentDetails&id=${streamId}`,
        {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`
          }
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Status check failed: ${error}`);
      }

      const data = await response.json();
      const broadcast = data.items?.[0];

      if (!broadcast) {
        throw new Error('Broadcast not found');
      }

      const statusMap: Record<string, StreamStatus['status']> = {
        'live': 'live',
        'starting': 'starting',
        'testing': 'starting',
        'complete': 'idle',
        'revoked': 'error'
      };

      return {
        id: broadcast.id,
        status: statusMap[broadcast.status.lifeCycleStatus] || 'idle',
        viewerCount: broadcast.contentDetails?.monitoring?.views || 0,
        startedAt: broadcast.snippet?.actualStartTime 
          ? new Date(broadcast.snippet.actualStartTime) 
          : undefined
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
      if (config.description !== undefined) {
        updateData.description = config.description;
      }
      if (config.privacy) {
        updateData.privacyStatus = config.privacy;
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status&id=${streamId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: streamId,
            snippet: updateData,
            status: config.privacy ? { privacyStatus: config.privacy } : undefined
          })
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
      await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `token=${credentials.accessToken}`
      });
    } catch (error) {
      this.handleError(error, 'access revocation');
    }
  }
}
