export interface RelayDestination {
  id: string;
  type: "YOUTUBE" | "FACEBOOK" | "TWITCH" | "INSTAGRAM" | "CUSTOM";
  name: string;
  enabled: boolean;
  rtmpUrl: string;
  streamKey: string;
  status: "OFFLINE" | "CONNECTING" | "LIVE" | "ERROR";
  bitrate?: number;
  lastConnectedAt?: Date;
  lastError?: string;
  reconnectAttempts: number;
}

export interface RelayStats {
  activeDestinations: number;
  totalBitrate: number;
  uptime: number;
  errors: number;
}

export class RtmpRelayService {
  private static instance: RtmpRelayService;
  private destinations: Map<string, RelayDestination> = new Map();
  private activeRelays: Map<string, WebSocket> = new Map();
  private stats: RelayStats = {
    activeDestinations: 0,
    totalBitrate: 0,
    uptime: 0,
    errors: 0,
  };
  private startTime: Date | null = null;

  private constructor() {}

  static getInstance(): RtmpRelayService {
    if (!RtmpRelayService.instance) {
      RtmpRelayService.instance = new RtmpRelayService();
    }
    return RtmpRelayService.instance;
  }

  // Destination management
  addDestination(destination: Omit<RelayDestination, "id" | "status" | "reconnectAttempts">): RelayDestination {
    const newDestination: RelayDestination = {
      ...destination,
      id: `relay_${Date.now()}_${Math.random()}`,
      status: "OFFLINE",
      reconnectAttempts: 0,
    };
    this.destinations.set(newDestination.id, newDestination);
    return newDestination;
  }

  updateDestination(id: string, updates: Partial<RelayDestination>): RelayDestination | null {
    const destination = this.destinations.get(id);
    if (!destination) return null;

    const updated = { ...destination, ...updates };
    this.destinations.set(id, updated);
    return updated;
  }

  removeDestination(id: string): boolean {
    // Stop relay if active
    this.stopRelay(id);
    return this.destinations.delete(id);
  }

  getDestination(id: string): RelayDestination | null {
    return this.destinations.get(id) || null;
  }

  getAllDestinations(): RelayDestination[] {
    return Array.from(this.destinations.values());
  }

  getEnabledDestinations(): RelayDestination[] {
    return Array.from(this.destinations.values()).filter(d => d.enabled);
  }

  // Relay control
  async startRelay(id: string, sourceStreamUrl: string): Promise<boolean> {
    const destination = this.destinations.get(id);
    if (!destination || !destination.enabled) {
      return false;
    }

    try {
      this.updateDestination(id, { status: "CONNECTING" });

      // In a real implementation, this would connect to an RTMP relay server
      // For now, we simulate the connection
      await this.simulateRelayConnection(id, sourceStreamUrl, destination);

      this.updateDestination(id, {
        status: "LIVE",
        lastConnectedAt: new Date(),
        reconnectAttempts: 0,
      });

      this.updateStats();
      return true;
    } catch (error) {
      this.updateDestination(id, {
        status: "ERROR",
        lastError: (error as Error).message,
        reconnectAttempts: (destination.reconnectAttempts || 0) + 1,
      });
      this.stats.errors++;
      return false;
    }
  }

  async stopRelay(id: string): Promise<boolean> {
    const destination = this.destinations.get(id);
    if (!destination) return false;

    try {
      const relay = this.activeRelays.get(id);
      if (relay) {
        relay.close();
        this.activeRelays.delete(id);
      }

      this.updateDestination(id, { status: "OFFLINE" });
      this.updateStats();
      return true;
    } catch (error) {
      return false;
    }
  }

  async startAllRelays(sourceStreamUrl: string): Promise<void> {
    const enabledDestinations = this.getEnabledDestinations();
    await Promise.all(
      enabledDestinations.map(dest => this.startRelay(dest.id, sourceStreamUrl))
    );
  }

  async stopAllRelays(): Promise<void> {
    const activeRelays = Array.from(this.activeRelays.keys());
    await Promise.all(
      activeRelays.map(id => this.stopRelay(id))
    );
  }

  // Stats
  getStats(): RelayStats {
    return { ...this.stats };
  }

  private updateStats(): void {
    const activeDestinations = Array.from(this.destinations.values()).filter(
      d => d.status === "LIVE"
    );
    
    this.stats.activeDestinations = activeDestinations.length;
    this.stats.totalBitrate = activeDestinations.reduce(
      (sum, d) => sum + (d.bitrate || 0),
      0
    );

    if (this.startTime) {
      this.stats.uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    }
  }

  // Preset destinations
  createYouTubeDestination(streamKey: string): RelayDestination {
    return this.addDestination({
      type: "YOUTUBE",
      name: "YouTube",
      enabled: false,
      rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
      streamKey,
    });
  }

  createFacebookDestination(streamKey: string): RelayDestination {
    return this.addDestination({
      type: "FACEBOOK",
      name: "Facebook",
      enabled: false,
      rtmpUrl: "rtmps://live-api-s.facebook.com:443/rtmp",
      streamKey,
    });
  }

  createTwitchDestination(streamKey: string): RelayDestination {
    return this.addDestination({
      type: "TWITCH",
      name: "Twitch",
      enabled: false,
      rtmpUrl: "rtmp://live.twitch.tv/app",
      streamKey,
    });
  }

  createInstagramDestination(streamKey: string): RelayDestination {
    return this.addDestination({
      type: "INSTAGRAM",
      name: "Instagram",
      enabled: false,
      rtmpUrl: "rtmps://live-upload.instagram.com:443/rtmp",
      streamKey,
    });
  }

  createCustomDestination(name: string, rtmpUrl: string, streamKey: string): RelayDestination {
    return this.addDestination({
      type: "CUSTOM",
      name,
      enabled: false,
      rtmpUrl,
      streamKey,
    });
  }

  // Simulation for demo purposes
  private async simulateRelayConnection(
    id: string,
    sourceStreamUrl: string,
    destination: RelayDestination
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Simulate connection delay
      setTimeout(() => {
        // Simulate random success/failure
        if (Math.random() > 0.1) {
          // Success
          const simulatedBitrate = 3000 + Math.random() * 2000; // 3000-5000 kbps
          this.updateDestination(id, { bitrate: Math.floor(simulatedBitrate) });
          
          // Start periodic bitrate updates
          const interval = setInterval(() => {
            const dest = this.destinations.get(id);
            if (!dest || dest.status !== "LIVE") {
              clearInterval(interval);
              return;
            }
            const newBitrate = 3000 + Math.random() * 2000;
            this.updateDestination(id, { bitrate: Math.floor(newBitrate) });
          }, 5000);

          resolve();
        } else {
          reject(new Error("Connection failed"));
        }
      }, 2000);
    });
  }

  // Reset
  reset(): void {
    this.stopAllRelays();
    this.destinations.clear();
    this.activeRelays.clear();
    this.stats = {
      activeDestinations: 0,
      totalBitrate: 0,
      uptime: 0,
      errors: 0,
    };
    this.startTime = null;
  }
}

export const rtmpRelayService = RtmpRelayService.getInstance();
