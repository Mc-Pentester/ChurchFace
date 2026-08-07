import {
  BaseBroadcastProvider,
  BroadcastCredentials,
  StreamConfig,
  StreamDestination,
  StreamStatus
} from '../provider';

/**
 * Facebook Live Broadcast Provider
 * 
 * Implements Facebook Live streaming via Facebook Graph API
 */
export class FacebookProvider extends BaseBroadcastProvider {
  readonly platform = 'FACEBOOK';
  readonly displayName = 'Facebook Live';

  private readonly appId: string;
  private readonly appSecret: string;
  private readonly apiVersion = 'v18.0';
  private readonly scopes = [
    'pages_manage_posts',
    'pages_read_engagement',
    'pages_manage_metadata'
  ];

  constructor() {
    super();
    this.appId = process.env.FACEBOOK_APP_ID || '';
    this.appSecret = process.env.FACEBOOK_APP_SECRET || '';

    if (!this.appId || !this.appSecret) {
      console.warn('Facebook provider: Missing credentials');
    }
  }

  async getAuthorizationUrl(
    redirectUri: string,
    state?: string
  ): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri,
      scope: this.scopes.join(','),
      response_type: 'code',
      ...(state && { state })
    });

    return `https://www.facebook.com/${this.apiVersion}/dialog/oauth?${params.toString()}`;
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<BroadcastCredentials> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/oauth/access_token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: this.appId,
            client_secret: this.appSecret,
            code,
            redirect_uri: redirectUri
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token exchange failed: ${error}`);
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
        metadata: {
          tokenType: data.token_type
        }
      };
    } catch (error) {
      this.handleError(error, 'token exchange');
    }
  }

  async refreshToken(
    refreshToken: string
  ): Promise<BroadcastCredentials> {
    // Facebook uses long-lived tokens, refresh by exchanging short-lived token
    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/oauth/access_token`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: new URLSearchParams({
            grant_type: 'fb_exchange_token',
            client_id: this.appId,
            client_secret: this.appSecret,
            fb_exchange_token: refreshToken
          }).toString()
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token refresh failed: ${error}`);
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in * 1000)
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
        `https://graph.facebook.com/${this.apiVersion}/me?access_token=${credentials.accessToken}`
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
      // Get user's pages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/me/accounts?access_token=${credentials.accessToken}`
      );

      if (!pagesResponse.ok) {
        throw new Error('Failed to fetch pages');
      }

      const pagesData = await pagesResponse.json();
      const pageId = pagesData.data?.[0]?.id;

      if (!pageId) {
        throw new Error('No Facebook page found');
      }

      // Use page access token
      const pageAccessToken = pagesData.data[0].access_token;

      // Create live video
      const liveVideoResponse = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${pageId}/live_videos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: pageAccessToken,
            status: 'LIVE_NOW',
            title: config.title,
            description: config.description || '',
            privacy: config.privacy || 'EVERYONE'
          })
        }
      );

      if (!liveVideoResponse.ok) {
        const error = await liveVideoResponse.text();
        throw new Error(`Live video creation failed: ${error}`);
      }

      const liveVideoData = await liveVideoResponse.json();

      // Get stream details
      const streamResponse = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${liveVideoData.id}?fields=stream_url,secure_stream_url,embed_html&access_token=${pageAccessToken}`
      );

      if (!streamResponse.ok) {
        throw new Error('Failed to get stream details');
      }

      const streamData = await streamResponse.json();

      return {
        streamUrl: streamData.stream_url || streamData.secure_stream_url,
        streamKey: liveVideoData.id,
        ingestUrl: streamData.stream_url || streamData.secure_stream_url,
        playbackUrl: `https://www.facebook.com/${pageId}/videos/${liveVideoData.id}/`,
        streamId: liveVideoData.id
      };
    } catch (error) {
      this.handleError(error, 'stream creation');
    }
  }

  async startStream(
    credentials: BroadcastCredentials,
    streamId: string
  ): Promise<void> {
    // Facebook streams are started automatically when created with LIVE_NOW status
    // This method can be used to transition from scheduled to live
    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${streamId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: credentials.accessToken,
            status: 'LIVE_NOW'
          })
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
        `https://graph.facebook.com/${this.apiVersion}/${streamId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: credentials.accessToken,
            status: 'VOD'
          })
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
        `https://graph.facebook.com/${this.apiVersion}/${streamId}?fields=status,video,live_views&access_token=${credentials.accessToken}`
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Status check failed: ${error}`);
      }

      const data = await response.json();

      const statusMap: Record<string, StreamStatus['status']> = {
        'LIVE_NOW': 'live',
        'SCHEDULED': 'idle',
        'VOD': 'idle',
        'UNPUBLISHED': 'idle'
      };

      return {
        id: streamId,
        status: statusMap[data.status] || 'idle',
        viewerCount: data.live_views || 0
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

      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${streamId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: credentials.accessToken,
            ...updateData
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
      await fetch(
        `https://graph.facebook.com/${this.apiVersion}/me/permissions`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: credentials.accessToken
          })
        }
      );
    } catch (error) {
      this.handleError(error, 'access revocation');
    }
  }
}
