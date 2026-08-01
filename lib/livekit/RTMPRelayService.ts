export interface RTMPDestination {
  id: string;
  name: string;
  platform: "youtube" | "facebook" | "twitch" | "instagram" | "custom";
  rtmpUrl: string;
  streamKey: string;
  enabled: boolean;
  status: "idle" | "connecting" | "connected" | "streaming" | "disconnected" | "error";
  lastError?: string;
  connectedAt?: Date;
  bitrate?: number;
  fps?: number;
  resolution?: { width: number; height: number };
}

export interface RTMPRelayConfig {
  srsUrl: string;
  srsPort: number;
  srsApiPort: number;
  srsSecret?: string;
}

export interface StreamStats {
  bitrate: number;
  fps: number;
  resolution: { width: number; height: number };
  duration: number;
  bytesSent: number;
}

class RTMPRelayService {
  private static instance: RTMPRelayService;
  private config: RTMPRelayConfig | null = null;
  private destinations: Map<string, RTMPDestination> = new Map();
  private activeStream: string | null = null;
  private streamStats: Map<string, StreamStats> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private constructor() {
    this.initializeConfig();
  }

  static getInstance(): RTMPRelayService {
    if (!RTMPRelayService.instance) {
      RTMPRelayService.instance = new RTMPRelayService();
    }
    return RTMPRelayService.instance;
  }

  private initializeConfig() {
    this.config = {
      srsUrl: process.env.SRS_URL || "localhost",
      srsPort: parseInt(process.env.SRS_PORT || "1935"),
      srsApiPort: parseInt(process.env.SRS_API_PORT || "1985"),
      srsSecret: process.env.SRS_SECRET,
    };

    if (this.config) {
      console.log("RTMP Relay Service initialized with config:", {
        srsUrl: this.config.srsUrl,
        srsPort: this.config.srsPort,
        srsApiPort: this.config.srsApiPort,
      });
    } else {
      console.warn("RTMP Relay Service: Missing configuration");
    }
  }

  addDestination(destination: Omit<RTMPDestination, "status" | "connectedAt">): string {
    const id = destination.id || `dest-${Date.now()}`;
    const newDestination: RTMPDestination = {
      ...destination,
      id,
      status: "idle",
    };

    this.destinations.set(id, newDestination);
    console.log(`RTMP Relay: Added destination ${id} (${destination.name})`);
    return id;
  }

  removeDestination(id: string): void {
    const destination = this.destinations.get(id);
    if (destination && destination.status === "streaming") {
      this.stopDestination(id);
    }
    this.destinations.delete(id);
    this.streamStats.delete(id);
    this.reconnectAttempts.delete(id);
    console.log(`RTMP Relay: Removed destination ${id}`);
  }

  updateDestination(id: string, updates: Partial<RTMPDestination>): void {
    const destination = this.destinations.get(id);
    if (destination) {
      this.destinations.set(id, { ...destination, ...updates });
      console.log(`RTMP Relay: Updated destination ${id}`);
    }
  }

  getDestination(id: string): RTMPDestination | undefined {
    return this.destinations.get(id);
  }

  getAllDestinations(): RTMPDestination[] {
    return Array.from(this.destinations.values());
  }

  async startDestination(id: string): Promise<void> {
    const destination = this.destinations.get(id);
    if (!destination) {
      throw new Error(`Destination ${id} not found`);
    }

    if (!this.config) {
      throw new Error("RTMP Relay Service not configured");
    }

    try {
      this.updateDestination(id, { status: "connecting" });
      console.log(`RTMP Relay: Connecting to ${destination.name}...`);

      // Simulate RTMP connection to SRS
      // In production, this would use the SRS HTTP API to start the stream
      await this.connectToSRS(destination);

      this.updateDestination(id, { 
        status: "connected", 
        connectedAt: new Date(),
        lastError: undefined,
      });

      this.reconnectAttempts.set(id, 0);
      console.log(`RTMP Relay: Connected to ${destination.name}`);
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.updateDestination(id, { 
        status: "error", 
        lastError: errorMessage,
      });

      console.error(`RTMP Relay: Failed to connect to ${destination.name}:`, error);
      throw error;
    }
  }

  async stopDestination(id: string): Promise<void> {
    const destination = this.destinations.get(id);
    if (!destination) {
      throw new Error(`Destination ${id} not found`);
    }

    try {
      console.log(`RTMP Relay: Stopping stream to ${destination.name}...`);

      // Simulate stopping stream via SRS API
      await this.disconnectFromSRS(destination);

      this.updateDestination(id, { status: "disconnected" });
      this.streamStats.delete(id);
      this.reconnectAttempts.delete(id);

      console.log(`RTMP Relay: Stopped stream to ${destination.name}`);
    } catch (error) {
      console.error(`RTMP Relay: Failed to stop stream to ${destination.name}:`, error);
      throw error;
    }
  }

  async startAllEnabledDestinations(): Promise<void> {
    const enabledDestinations = this.getAllDestinations().filter(d => d.enabled);
    
    for (const destination of enabledDestinations) {
      try {
        await this.startDestination(destination.id);
      } catch (error) {
        console.error(`Failed to start destination ${destination.id}:`, error);
      }
    }
  }

  async stopAllDestinations(): Promise<void> {
    const streamingDestinations = this.getAllDestinations().filter(d => 
      d.status === "connected" || d.status === "streaming"
    );
    
    for (const destination of streamingDestinations) {
      try {
        await this.stopDestination(destination.id);
      } catch (error) {
        console.error(`Failed to stop destination ${destination.id}:`, error);
      }
    }
  }

  private async connectToSRS(destination: RTMPDestination): Promise<void> {
    // In production, this would make an HTTP request to the SRS API
    // to start the stream relay to the destination
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update destination with stream info
    this.updateDestination(destination.id, {
      status: "streaming",
      bitrate: 4500,
      fps: 30,
      resolution: { width: 1920, height: 1080 },
    });

    // Start monitoring stats
   this.startStatsMonitoring(destination.id);
  }

  private async disconnectFromSRS(destination: RTMPDestination): Promise<void> {
    // In production, this would make an HTTP request to the SRS API
    // to stop the stream relay

    // Simulate disconnection delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private startStatsMonitoring(destinationId: string): void {
    const interval = setInterval(() => {
      const destination = this.destinations.get(destinationId);
      if (!destination || destination.status !== "streaming") {
        clearInterval(interval);
        return;
      }

      // Simulate stats updates
      const stats: StreamStats = {
        bitrate: 4500 + Math.floor(Math.random() * 500),
        fps: 30,
        resolution: { width: 1920, height: 1080 },
        duration: Math.floor((Date.now() - (destination.connectedAt?.getTime() || Date.now())) / 1000),
        bytesSent: (4500 * 1024 / 8) * Math.floor((Date.now() - (destination.connectedAt?.getTime() || Date.now())) / 1000),
      };

      this.streamStats.set(destinationId, stats);

      // Update destination with current stats
      this.updateDestination(destinationId, {
        bitrate: stats.bitrate,
        fps: stats.fps,
        resolution: stats.resolution,
      });
    }, 1000);
  }

  getStreamStats(destinationId: string): StreamStats | undefined {
    return this.streamStats.get(destinationId);
  }

  async handleConnectionError(destinationId: string, error: Error): Promise<void> {
    const destination = this.destinations.get(destinationId);
    if (!destination) return;

    const attempts = (this.reconnectAttempts.get(destinationId) || 0) + 1;
    this.reconnectAttempts.set(destinationId, attempts);

    if (attempts < this.maxReconnectAttempts) {
      console.log(`RTMP Relay: Reconnecting to ${destination.name} (attempt ${attempts}/${this.maxReconnectAttempts})...`);
      
      const delay = this.reconnectDelay * Math.pow(2, attempts - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        await this.startDestination(destinationId);
      } catch (error) {
        console.error(`RTMP Relay: Reconnection failed for ${destination.name}:`, error);
      }
    } else {
      console.error(`RTMP Relay: Max reconnection attempts reached for ${destination.name}`);
      this.updateDestination(destinationId, { status: "error", lastError: error.message });
    }
  }

  async cleanup(): Promise<void> {
    await this.stopAllDestinations();
    this.destinations.clear();
    this.streamStats.clear();
    this.reconnectAttempts.clear();
    console.log("RTMP Relay Service cleaned up");
  }
}

export const rtmpRelayService = RTMPRelayService.getInstance();
