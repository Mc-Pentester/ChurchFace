import {
  EgressClient,
  EgressInfo,
  EgressStatus as LiveKitEgressStatus,
} from "livekit-server-sdk";

export interface RecordingConfig {
  roomId: string;
  outputType: "file" | "segment" | "stream";
  outputPath?: string;
  filename?: string;
  codec?: "h264" | "vp8" | "vp9";
  resolution?: { width: number; height: number };
  bitrate?: number;
  fps?: number;
}

export interface RTMPConfig {
  roomId: string;
  rtmpUrl: string;
  streamKey: string;
  codec?: "h264" | "vp8" | "vp9";
  resolution?: { width: number; height: number };
  bitrate?: number;
  fps?: number;
}

export interface EgressStatus {
  egressId: string;
  status: "starting" | "active" | "ended" | "failed";
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  size?: number;
  outputPath?: string;
  error?: string;
}

class LiveKitEgressService {
  private static instance: LiveKitEgressService;
  private client: EgressClient | null = null;
  private activeEgresses: Map<string, EgressInfo> = new Map();
  private egressCallbacks: Map<string, (status: EgressStatus) => void> = new Map();

  private constructor() {
    this.initializeClient();
  }

  static getInstance(): LiveKitEgressService {
    if (!LiveKitEgressService.instance) {
      LiveKitEgressService.instance = new LiveKitEgressService();
    }
    return LiveKitEgressService.instance;
  }

  private initializeClient() {
    const livekitUrl = process.env.LIVEKIT_URL;
    const livekitApiKey = process.env.LIVEKIT_API_KEY;
    const livekitApiSecret = process.env.LIVEKIT_API_SECRET;

    if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
      console.warn("LiveKit Egress: Missing configuration, client not initialized");
      return;
    }

    try {
      this.client = new EgressClient(livekitUrl, livekitApiKey, livekitApiSecret);
      console.log("LiveKit Egress client initialized");
    } catch (error) {
      console.error("Failed to initialize LiveKit Egress client:", error);
    }
  }

  async startRoomRecording(config: RecordingConfig): Promise<string> {
    if (!this.client) {
      throw new Error("Egress client not initialized");
    }

    try {
      // Simplified approach - use basic file output
      const egressInfo = await this.client.startRoomCompositeEgress(
        config.roomId,
        {
          file: {
            filepath: config.outputPath || `recordings/${config.filename || Date.now()}.mp4`,
          } as any,
        }
      );
      
      this.activeEgresses.set(egressInfo.egressId, egressInfo);
      console.log(`Room recording started: ${egressInfo.egressId}`);
      return egressInfo.egressId;
    } catch (error) {
      console.error("Failed to start room recording:", error);
      throw error;
    }
  }

  async startTrackRecording(config: RecordingConfig, trackId: string): Promise<string> {
    if (!this.client) {
      throw new Error("Egress client not initialized");
    }

    try {
      const egressInfo = await this.client.startTrackEgress(
        config.roomId,
        trackId,
        config.outputPath || `recordings/${config.filename || Date.now()}.mp4`
      );
      
      this.activeEgresses.set(egressInfo.egressId, egressInfo);
      console.log(`Track recording started: ${egressInfo.egressId}`);
      return egressInfo.egressId;
    } catch (error) {
      console.error("Failed to start track recording:", error);
      throw error;
    }
  }

  async startRTMPStream(config: RTMPConfig): Promise<string> {
    if (!this.client) {
      throw new Error("Egress client not initialized");
    }

    try {
      const egressInfo = await this.client.startTrackCompositeEgress(
        config.roomId,
        {
          stream: {
            protocol: "RTMP" as any,
            urls: [`${config.rtmpUrl}/${config.streamKey}`],
          } as any,
        }
      );
      
      this.activeEgresses.set(egressInfo.egressId, egressInfo);
      console.log(`RTMP stream started: ${egressInfo.egressId}`);
      return egressInfo.egressId;
    } catch (error) {
      console.error("Failed to start RTMP stream:", error);
      throw error;
    }
  }

  async stopEgress(egressId: string): Promise<void> {
    if (!this.client) {
      throw new Error("Egress client not initialized");
    }

    try {
      await this.client.stopEgress(egressId);
      this.activeEgresses.delete(egressId);
      console.log(`Egress stopped: ${egressId}`);
    } catch (error) {
      console.error("Failed to stop egress:", error);
      throw error;
    }
  }

  async getEgressStatus(egressId: string): Promise<EgressStatus> {
    if (!this.client) {
      throw new Error("Egress client not initialized");
    }

    try {
      const egressInfo = this.activeEgresses.get(egressId);
      
      if (!egressInfo) {
        throw new Error("Egress not found");
      }

      return {
        egressId: egressInfo.egressId,
        status: this.mapEgressStatus(egressInfo.status),
        startedAt: egressInfo.startedAt ? new Date(Number(egressInfo.startedAt)) : undefined,
        endedAt: egressInfo.endedAt ? new Date(Number(egressInfo.endedAt)) : undefined,
        error: egressInfo.error,
      };
    } catch (error) {
      console.error("Failed to get egress status:", error);
      throw error;
    }
  }

  async listActiveEgresses(): Promise<EgressInfo[]> {
    if (!this.client) {
      throw new Error("Egress client not initialized");
    }

    try {
      const response = await this.client.listEgress();
      return response;
    } catch (error) {
      console.error("Failed to list egresses:", error);
      throw error;
    }
  }

  private mapEgressStatus(status: LiveKitEgressStatus): EgressStatus["status"] {
    switch (status) {
      case LiveKitEgressStatus.EGRESS_STARTING:
        return "starting";
      case LiveKitEgressStatus.EGRESS_ACTIVE:
        return "active";
      case LiveKitEgressStatus.EGRESS_ENDING:
      case LiveKitEgressStatus.EGRESS_COMPLETE:
        return "ended";
      case LiveKitEgressStatus.EGRESS_FAILED:
      case LiveKitEgressStatus.EGRESS_ABORTED:
        return "failed";
      default:
        return "failed";
    }
  }

  onEgressStatusChange(egressId: string, callback: (status: EgressStatus) => void) {
    this.egressCallbacks.set(egressId, callback);
  }

  removeEgressCallback(egressId: string) {
    this.egressCallbacks.delete(egressId);
  }

  getActiveEgresses(): Map<string, EgressInfo> {
    return this.activeEgresses;
  }

  isRecording(egressId: string): boolean {
    const egress = this.activeEgresses.get(egressId);
    return egress ? egress.status === LiveKitEgressStatus.EGRESS_ACTIVE : false;
  }

  async cleanup(): Promise<void> {
    // Stop all active egresses
    for (const [egressId] of this.activeEgresses) {
      try {
        await this.stopEgress(egressId);
      } catch (error) {
        console.error(`Failed to stop egress ${egressId}:`, error);
      }
    }
    this.activeEgresses.clear();
    this.egressCallbacks.clear();
  }
}

export const liveKitEgressService = LiveKitEgressService.getInstance();
