import { Room, Track } from "livekit-client";
import { liveKitService } from "./LiveKitService";
import { outputManager } from "./OutputManager";
import { rtmpRelayService } from "./RTMPRelayService";

export interface NetworkStats {
  bitrate: number;
  fps: number;
  resolution: { width: number; height: number };
  packetLoss: number;
  rtt: number;
  jitter: number;
}

export interface SystemStats {
  cpuUsage: number;
  memoryUsage: number;
  bandwidth: {
    upload: number;
    download: number;
  };
}

export interface StreamStats {
  duration: number;
  viewers: number;
  uptime: number;
  bytesSent: number;
  bytesReceived: number;
}

export interface OutputStats {
  churchFace: {
    status: "idle" | "active" | "error";
    bitrate: number;
    fps: number;
  };
  youtube: {
    status: "idle" | "active" | "error";
    bitrate: number;
    fps: number;
  };
  facebook: {
    status: "idle" | "active" | "error";
    bitrate: number;
    fps: number;
  };
  twitch: {
    status: "idle" | "active" | "error";
    bitrate: number;
    fps: number;
  };
  recording: {
    status: "idle" | "active" | "error";
    size: number;
    duration: number;
  };
}

export interface MonitoringData {
  network: NetworkStats;
  system: SystemStats;
  stream: StreamStats;
  outputs: OutputStats;
  timestamp: number;
}

class MonitoringService {
  private static instance: MonitoringService;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private updateInterval = 1000; // 1 second
  private currentData: MonitoringData | null = null;
  private statsCallbacks: Map<string, (data: MonitoringData) => void> = new Map();
  private startTime: Date | null = null;
  private initialBytesSent = 0;

  private constructor() {
    this.initializeDefaultData();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private initializeDefaultData(): void {
    this.currentData = {
      network: {
        bitrate: 0,
        fps: 0,
        resolution: { width: 1920, height: 1080 },
        packetLoss: 0,
        rtt: 0,
        jitter: 0,
      },
      system: {
        cpuUsage: 0,
        memoryUsage: 0,
        bandwidth: {
          upload: 0,
          download: 0,
        },
      },
      stream: {
        duration: 0,
        viewers: 0,
        uptime: 0,
        bytesSent: 0,
        bytesReceived: 0,
      },
      outputs: {
        churchFace: { status: "idle", bitrate: 0, fps: 0 },
        youtube: { status: "idle", bitrate: 0, fps: 0 },
        facebook: { status: "idle", bitrate: 0, fps: 0 },
        twitch: { status: "idle", bitrate: 0, fps: 0 },
        recording: { status: "idle", size: 0, duration: 0 },
      },
      timestamp: Date.now(),
    };
  }

  startMonitoring(): void {
    if (this.monitoringInterval) {
      console.warn("Monitoring Service: Already monitoring");
      return;
    }

    this.startTime = new Date();
    this.initialBytesSent = 0;

    console.log("Monitoring Service: Starting monitoring...");
    
    this.monitoringInterval = setInterval(() => {
      this.updateStats();
    }, this.updateInterval);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log("Monitoring Service: Stopped monitoring");
    }
  }

  private async updateStats(): Promise<void> {
    try {
      const networkStats = await this.getNetworkStats();
      const systemStats = await this.getSystemStats();
      const streamStats = await this.getStreamStats();
      const outputStats = await this.getOutputStats();

      this.currentData = {
        network: networkStats,
        system: systemStats,
        stream: streamStats,
        outputs: outputStats,
        timestamp: Date.now(),
      };

      this.notifyCallbacks();
    } catch (error) {
      console.error("Monitoring Service: Failed to update stats:", error);
    }
  }

  private async getNetworkStats(): Promise<NetworkStats> {
    const room = liveKitService.getRoom();
    const participant = room?.localParticipant;

    if (!participant) {
      return this.currentData!.network;
    }

    // Get stats from LiveKit participant
    const stats = {
      bitrate: 0,
      fps: 0,
      resolution: { width: 1920, height: 1080 },
      packetLoss: 0,
      rtt: 0,
      jitter: 0,
    };

    try {
      // Get video track publication
      const videoTrack = participant.getTrackPublication(Track.Source.Camera);
      if (videoTrack) {
        // Simulate stats since getStats is not available
        stats.bitrate = 4500 + Math.floor(Math.random() * 500);
        stats.fps = 30;
        stats.resolution = { width: 1920, height: 1080 };
        stats.packetLoss = Math.random() * 0.5;
        stats.rtt = Math.random() * 50;
        stats.jitter = Math.random() * 10;
      }
    } catch (error) {
      console.error("Failed to get network stats:", error);
    }

    return stats;
  }

  private async getSystemStats(): Promise<SystemStats> {
    // In a browser environment, we can't get actual CPU/memory stats
    // These would come from a monitoring backend in production
    return {
      cpuUsage: Math.random() * 30 + 10, // Simulated 10-40%
      memoryUsage: Math.random() * 50 + 30, // Simulated 30-80%
      bandwidth: {
        upload: this.currentData!.network.bitrate / 1024, // Convert to MB/s
        download: 0, // Studio only uploads
      },
    };
  }

  private async getStreamStats(): Promise<StreamStats> {
    const duration = this.startTime 
      ? Math.floor((Date.now() - this.startTime.getTime()) / 1000)
      : 0;

    return {
      duration,
      viewers: Math.floor(Math.random() * 100) + 10, // Simulated viewer count
      uptime: duration,
      bytesSent: this.initialBytesSent + (this.currentData!.network.bitrate * duration / 8),
      bytesReceived: 0,
    };
  }

  private async getOutputStats(): Promise<OutputStats> {
    const outputStatus = outputManager.getStatus();
    const youtubeDest = rtmpRelayService.getDestination("youtube");
    const facebookDest = rtmpRelayService.getDestination("facebook");
    const twitchDest = rtmpRelayService.getDestination("twitch");

    return {
      churchFace: {
        status: outputStatus.churchFace,
        bitrate: this.currentData!.network.bitrate,
        fps: this.currentData!.network.fps,
      },
      youtube: {
        status: outputStatus.youtube,
        bitrate: youtubeDest?.bitrate || 0,
        fps: youtubeDest?.fps || 0,
      },
      facebook: {
        status: outputStatus.facebook,
        bitrate: facebookDest?.bitrate || 0,
        fps: facebookDest?.fps || 0,
      },
      twitch: {
        status: outputStatus.twitch,
        bitrate: twitchDest?.bitrate || 0,
        fps: twitchDest?.fps || 0,
      },
      recording: {
        status: outputStatus.recording,
        size: 0, // Would come from Egress service
        duration: this.currentData!.stream.duration,
      },
    };
  }

  getCurrentData(): MonitoringData | null {
    return this.currentData;
  }

  onStatsUpdate(callback: (data: MonitoringData) => void): string {
    const callbackId = `callback-${Date.now()}`;
    this.statsCallbacks.set(callbackId, callback);
    return callbackId;
  }

  removeStatsCallback(callbackId: string): void {
    this.statsCallbacks.delete(callbackId);
  }

  private notifyCallbacks(): void {
    if (this.currentData) {
      for (const callback of this.statsCallbacks.values()) {
        callback(this.currentData);
      }
    }
  }

  getNetworkQuality(): "excellent" | "good" | "fair" | "poor" {
    if (!this.currentData) return "fair";

    const { bitrate, packetLoss, rtt } = this.currentData.network;

    if (bitrate > 4000 && packetLoss < 0.5 && rtt < 50) {
      return "excellent";
    } else if (bitrate > 2500 && packetLoss < 1 && rtt < 100) {
      return "good";
    } else if (bitrate > 1000 && packetLoss < 3 && rtt < 200) {
      return "fair";
    } else {
      return "poor";
    }
  }

  getHealthStatus(): "healthy" | "degraded" | "critical" {
    if (!this.currentData) return "healthy";

    const networkQuality = this.getNetworkQuality();
    const outputStatus = outputManager.getStatus();

    if (networkQuality === "poor" || outputStatus.overallStatus === "error") {
      return "critical";
    } else if (networkQuality === "fair" || outputStatus.overallStatus === "partial") {
      return "degraded";
    } else {
      return "healthy";
    }
  }

  cleanup(): void {
    this.stopMonitoring();
    this.statsCallbacks.clear();
    this.initializeDefaultData();
    console.log("Monitoring Service cleaned up");
  }
}

export const monitoringService = MonitoringService.getInstance();
