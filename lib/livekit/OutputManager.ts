import { liveKitEgressService } from "./LiveKitEgressService";
import { rtmpRelayService, RTMPDestination } from "./RTMPRelayService";

export interface OutputConfig {
  churchFaceEnabled: boolean;
  youtubeEnabled: boolean;
  facebookEnabled: boolean;
  twitchEnabled: boolean;
  customDestinations: string[];
}

export interface OutputStatus {
  churchFace: "idle" | "active" | "error";
  youtube: "idle" | "active" | "error";
  facebook: "idle" | "active" | "error";
  twitch: "idle" | "active" | "error";
  custom: Map<string, "idle" | "active" | "error">;
  recording: "idle" | "active" | "error";
  overallStatus: "idle" | "streaming" | "partial" | "error";
}

export interface RecordingConfig {
  enabled: boolean;
  outputPath?: string;
  filename?: string;
  autoUpload?: boolean;
}

class OutputManager {
  private static instance: OutputManager;
  private roomId: string | null = null;
  private recordingEgressId: string | null = null;
  private rtmpEgressId: string | null = null;
  private config: OutputConfig = {
    churchFaceEnabled: true,
    youtubeEnabled: false,
    facebookEnabled: false,
    twitchEnabled: false,
    customDestinations: [],
  };
  private recordingConfig: RecordingConfig = {
    enabled: true,
  };
  private statusCallbacks: Map<string, (status: OutputStatus) => void> = new Map();

  private constructor() {
    this.initializeDefaultDestinations();
  }

  static getInstance(): OutputManager {
    if (!OutputManager.instance) {
      OutputManager.instance = new OutputManager();
    }
    return OutputManager.instance;
  }

  private initializeDefaultDestinations() {
    // Initialize default RTMP destinations
    const youtubeDest: RTMPDestination = {
      id: "youtube",
      name: "YouTube",
      platform: "youtube",
      rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
      streamKey: "",
      enabled: false,
      status: "idle",
    };

    const facebookDest: RTMPDestination = {
      id: "facebook",
      name: "Facebook",
      platform: "facebook",
      rtmpUrl: "rtmps://live-api-s.facebook.com:443/rtmp",
      streamKey: "",
      enabled: false,
      status: "idle",
    };

    const twitchDest: RTMPDestination = {
      id: "twitch",
      name: "Twitch",
      platform: "twitch",
      rtmpUrl: "rtmp://live.twitch.tv/app",
      streamKey: "",
      enabled: false,
      status: "idle",
    };

    rtmpRelayService.addDestination(youtubeDest);
    rtmpRelayService.addDestination(facebookDest);
    rtmpRelayService.addDestination(twitchDest);
  }

  setRoomId(roomId: string): void {
    this.roomId = roomId;
    console.log(`Output Manager: Set room ID to ${roomId}`);
  }

  setConfig(config: Partial<OutputConfig>): void {
    this.config = { ...this.config, ...config };
    console.log("Output Manager: Config updated", this.config);
  }

  setRecordingConfig(config: Partial<RecordingConfig>): void {
    this.recordingConfig = { ...this.recordingConfig, ...config };
    console.log("Output Manager: Recording config updated", this.recordingConfig);
  }

  getConfig(): OutputConfig {
    return this.config;
  }

  getRecordingConfig(): RecordingConfig {
    return this.recordingConfig;
  }

  async startStreaming(): Promise<void> {
    if (!this.roomId) {
      throw new Error("Room ID not set");
    }

    console.log("Output Manager: Starting streaming...");

    try {
      // Start recording if enabled
      if (this.recordingConfig.enabled) {
        await this.startRecording();
      }

      // Start RTMP stream to SRS if any external destinations are enabled
      const hasExternalDestinations = 
        this.config.youtubeEnabled || 
        this.config.facebookEnabled || 
        this.config.twitchEnabled ||
        this.config.customDestinations.length > 0;

      if (hasExternalDestinations) {
        await this.startRTMPStream();
      }

      // Start individual destinations
      if (this.config.youtubeEnabled) {
        await rtmpRelayService.startDestination("youtube");
      }

      if (this.config.facebookEnabled) {
        await rtmpRelayService.startDestination("facebook");
      }

      if (this.config.twitchEnabled) {
        await rtmpRelayService.startDestination("twitch");
      }

      // Start custom destinations
      for (const destId of this.config.customDestinations) {
        await rtmpRelayService.startDestination(destId);
      }

      this.notifyStatusChange();
      console.log("Output Manager: Streaming started successfully");
    } catch (error) {
      console.error("Output Manager: Failed to start streaming:", error);
      throw error;
    }
  }

  async stopStreaming(): Promise<void> {
    console.log("Output Manager: Stopping streaming...");

    try {
      // Stop all RTMP destinations
      await rtmpRelayService.stopAllDestinations();

      // Stop recording
      if (this.recordingEgressId) {
        await liveKitEgressService.stopEgress(this.recordingEgressId);
        this.recordingEgressId = null;
      }

      // Stop RTMP stream
      if (this.rtmpEgressId) {
        await liveKitEgressService.stopEgress(this.rtmpEgressId);
        this.rtmpEgressId = null;
      }

      this.notifyStatusChange();
      console.log("Output Manager: Streaming stopped successfully");
    } catch (error) {
      console.error("Output Manager: Failed to stop streaming:", error);
      throw error;
    }
  }

  async startRecording(): Promise<string> {
    if (!this.roomId) {
      throw new Error("Room ID not set");
    }

    try {
      const egressId = await liveKitEgressService.startRoomRecording({
        roomId: this.roomId,
        outputType: "file",
        outputPath: this.recordingConfig.outputPath,
        filename: this.recordingConfig.filename,
      });

      this.recordingEgressId = egressId;
      console.log(`Output Manager: Recording started with ID ${egressId}`);
      this.notifyStatusChange();
      return egressId;
    } catch (error) {
      console.error("Output Manager: Failed to start recording:", error);
      throw error;
    }
  }

  async stopRecording(): Promise<void> {
    if (this.recordingEgressId) {
      try {
        await liveKitEgressService.stopEgress(this.recordingEgressId);
        this.recordingEgressId = null;
        console.log("Output Manager: Recording stopped");
        this.notifyStatusChange();
      } catch (error) {
        console.error("Output Manager: Failed to stop recording:", error);
        throw error;
      }
    }
  }

  async startRTMPStream(): Promise<string> {
    if (!this.roomId) {
      throw new Error("Room ID not set");
    }

    try {
      // Start RTMP stream from LiveKit to SRS
      const egressId = await liveKitEgressService.startRTMPStream({
        roomId: this.roomId,
        rtmpUrl: `rtmp://${process.env.SRS_URL || "localhost"}:${process.env.SRS_PORT || "1935"}`,
        streamKey: "churchface-live",
      });

      this.rtmpEgressId = egressId;
      console.log(`Output Manager: RTMP stream started with ID ${egressId}`);
      return egressId;
    } catch (error) {
      console.error("Output Manager: Failed to start RTMP stream:", error);
      throw error;
    }
  }

  async enableDestination(destinationId: string): Promise<void> {
    rtmpRelayService.updateDestination(destinationId, { enabled: true });

    if (this.roomId) {
      await rtmpRelayService.startDestination(destinationId);
      this.notifyStatusChange();
    }
  }

  async disableDestination(destinationId: string): Promise<void> {
    rtmpRelayService.updateDestination(destinationId, { enabled: false });
    await rtmpRelayService.stopDestination(destinationId);
    this.notifyStatusChange();
  }

  addCustomDestination(destination: Omit<RTMPDestination, "status">): string {
    const id = rtmpRelayService.addDestination(destination);
    this.config.customDestinations.push(id);
    return id;
  }

  removeCustomDestination(id: string): void {
    rtmpRelayService.removeDestination(id);
    this.config.customDestinations = this.config.customDestinations.filter(d => d !== id);
  }

  getStatus(): OutputStatus {
    const youtubeDest = rtmpRelayService.getDestination("youtube");
    const facebookDest = rtmpRelayService.getDestination("facebook");
    const twitchDest = rtmpRelayService.getDestination("twitch");

    const customStatus = new Map<string, "idle" | "active" | "error">();
    for (const destId of this.config.customDestinations) {
      const dest = rtmpRelayService.getDestination(destId);
      if (dest) {
        customStatus.set(destId, this.mapDestinationStatus(dest.status));
      }
    }

    const recordingStatus = this.recordingEgressId 
      ? (liveKitEgressService.isRecording(this.recordingEgressId) ? "active" : "idle")
      : "idle";

    const overallStatus = this.calculateOverallStatus({
      churchFace: this.config.churchFaceEnabled ? "active" : "idle",
      youtube: this.mapDestinationStatus(youtubeDest?.status || "idle"),
      facebook: this.mapDestinationStatus(facebookDest?.status || "idle"),
      twitch: this.mapDestinationStatus(twitchDest?.status || "idle"),
      recording: recordingStatus,
    });

    return {
      churchFace: this.config.churchFaceEnabled ? "active" : "idle",
      youtube: this.mapDestinationStatus(youtubeDest?.status || "idle"),
      facebook: this.mapDestinationStatus(facebookDest?.status || "idle"),
      twitch: this.mapDestinationStatus(twitchDest?.status || "idle"),
      custom: customStatus,
      recording: recordingStatus,
      overallStatus,
    };
  }

  private mapDestinationStatus(status: RTMPDestination["status"]): "idle" | "active" | "error" {
    switch (status) {
      case "streaming":
      case "connected":
        return "active";
      case "error":
        return "error";
      default:
        return "idle";
    }
  }

  private calculateOverallStatus(statuses: {
    churchFace: "idle" | "active" | "error";
    youtube: "idle" | "active" | "error";
    facebook: "idle" | "active" | "error";
    twitch: "idle" | "active" | "error";
    recording: "idle" | "active" | "error";
  }): OutputStatus["overallStatus"] {
    const hasError = Object.values(statuses).some(s => s === "error");
    const hasActive = Object.values(statuses).some(s => s === "active");

    if (hasError) {
      return "error";
    }

    if (hasActive) {
      return "streaming";
    }

    return "idle";
  }

  onStatusChange(callback: (status: OutputStatus) => void): string {
    const callbackId = `callback-${Date.now()}`;
    this.statusCallbacks.set(callbackId, callback);
    return callbackId;
  }

  removeStatusChangeCallback(callbackId: string): void {
    this.statusCallbacks.delete(callbackId);
  }

  private notifyStatusChange(): void {
    const status = this.getStatus();
    for (const callback of this.statusCallbacks.values()) {
      callback(status);
    }
  }

  async cleanup(): Promise<void> {
    await this.stopStreaming();
    await rtmpRelayService.cleanup();
    await liveKitEgressService.cleanup();
    this.statusCallbacks.clear();
    console.log("Output Manager cleaned up");
  }
}

export const outputManager = OutputManager.getInstance();
