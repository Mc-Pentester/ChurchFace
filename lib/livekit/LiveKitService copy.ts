import { Room, RoomEvent, Track, LocalParticipant, RemoteParticipant, createLocalVideoTrack, createLocalAudioTrack, LocalVideoTrack, LocalAudioTrack } from "livekit-client";
import { errorHandler, ErrorSeverity, ErrorCategory } from "./ErrorHandler";
import { connectionManager, DisconnectReason } from "./ConnectionManager";

export type ConnectionState = "idle" | "connecting" | "connected" | "reconnecting" | "disconnected" | "error";

export type LiveKitStatus = "idle" | "connecting" | "connected" | "participant_ready" | "media_ready" | "ready" | "error";

export interface LiveKitConfig {
  token: string;
  serverUrl: string;
  roomName: string;
  initialCameraEnabled?: boolean;
  initialMicEnabled?: boolean;
}

export interface StudioState {
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  screenSharing: boolean;
  cameraDeviceId?: string;
  microphoneDeviceId?: string;
}

export interface LiveKitCallbacks {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onReconnecting?: () => void;
  onError?: (error: Error) => void;
  onLocalStreamChange?: (stream: MediaStream | null) => void;
  onParticipantJoined?: (participant: RemoteParticipant) => void;
  onParticipantLeft?: (participant: RemoteParticipant) => void;
  onCameraEnabledChange?: (enabled: boolean) => void;
  onMicEnabledChange?: (enabled: boolean) => void;
  onDevicesAvailable?: (devices: { cameras: MediaDeviceInfo[], microphones: MediaDeviceInfo[] }) => void;
  onStateChange?: (state: ConnectionState) => void;
  onDeviceChange?: (type: 'camera' | 'microphone', deviceId: string | null) => void;
  onStatusChange?: (status: LiveKitStatus) => void;
}

class LiveKitService {
  private static instance: LiveKitService;
  private room: Room | null = null;
  private state: ConnectionState = "idle";
  private liveKitStatus: LiveKitStatus = "idle";
  private callbacks: LiveKitCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private reconnectTimer: NodeJS.Timeout | null = null;
  private mounted = true;
  private currentConfig: LiveKitConfig | null = null;
  private studioState: StudioState = {
    cameraEnabled: true,
    microphoneEnabled: true,
    screenSharing: false,
  };
  private deviceChangeHandler: ((event: Event) => void) | null = null;

  private constructor() {}

  static getInstance(): LiveKitService {
    if (!LiveKitService.instance) {
      LiveKitService.instance = new LiveKitService();
    }
    return LiveKitService.instance;
  }

  setState(newState: ConnectionState) {
    if (this.state !== newState) {
      this.state = newState;
      this.callbacks.onStateChange?.(newState);
    }
  }

  getState(): ConnectionState {
    return this.state;
  }

  setStatus(newStatus: LiveKitStatus) {
    if (this.liveKitStatus !== newStatus) {
      this.liveKitStatus = newStatus;
      console.log("LiveKit: Status changed to:", newStatus);
      this.callbacks.onStatusChange?.(newStatus);
    }
  }

  getStatus(): LiveKitStatus {
    return this.liveKitStatus;
  }

  isReady(): boolean {
    return this.liveKitStatus === "ready";
  }

  getRoom(): Room | null {
    return this.room;
  }

  getLocalParticipant(): LocalParticipant | null {
    return this.room?.localParticipant || null;
  }

  setCallbacks(callbacks: LiveKitCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  clearCallbacks() {
    this.callbacks = {};
  }

  getStudioState(): StudioState {
    return { ...this.studioState };
  }

  setStudioState(state: Partial<StudioState>): void {
    this.studioState = { ...this.studioState, ...state };
  }

  private setupDeviceChangeDetection(): void {
    // Remove existing handler if any
    if (this.deviceChangeHandler) {
      navigator.mediaDevices.removeEventListener('devicechange', this.deviceChangeHandler);
    }

    // Setup new handler
    this.deviceChangeHandler = async (event: Event) => {
      if (!this.mounted) return;

      console.log("LiveKit: Device change detected");

      // Get current devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const microphones = devices.filter(device => device.kind === 'audioinput');

      this.callbacks.onDevicesAvailable?.({ cameras, microphones });

      // Check if current camera device still exists
      if (this.studioState.cameraDeviceId) {
        const cameraExists = cameras.some(cam => cam.deviceId === this.studioState.cameraDeviceId);
        if (!cameraExists && this.studioState.cameraEnabled) {
          console.warn("LiveKit: Current camera device no longer available");
          this.callbacks.onDeviceChange?.('camera', null);
          // Try to switch to first available camera (only if connected)
          if (cameras.length > 0 && this.state === "connected") {
            try {
              await this.switchCamera(cameras[0].deviceId);
            } catch (error) {
              console.error("LiveKit: Failed to switch to fallback camera:", error);
            }
          }
        }
      }

      // Check if current microphone device still exists
      if (this.studioState.microphoneDeviceId) {
        const micExists = microphones.some(mic => mic.deviceId === this.studioState.microphoneDeviceId);
        if (!micExists && this.studioState.microphoneEnabled) {
          console.warn("LiveKit: Current microphone device no longer available");
          this.callbacks.onDeviceChange?.('microphone', null);
          // Try to switch to first available microphone (only if connected)
          if (microphones.length > 0 && this.state === "connected") {
            try {
              await this.switchMicrophone(microphones[0].deviceId);
            } catch (error) {
              console.error("LiveKit: Failed to switch to fallback microphone:", error);
            }
          }
        }
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', this.deviceChangeHandler);
  }

  private removeDeviceChangeDetection(): void {
    if (this.deviceChangeHandler) {
      navigator.mediaDevices.removeEventListener('devicechange', this.deviceChangeHandler);
      this.deviceChangeHandler = null;
    }
  }

  private async restoreStudioState(): Promise<void> {
    const participant = this.getLocalParticipant();
    if (!participant) return;

    try {
      // Restore camera state
      if (this.studioState.cameraEnabled) {
        if (this.studioState.cameraDeviceId) {
          await participant.setCameraEnabled(true, {
            deviceId: { exact: this.studioState.cameraDeviceId }
          });
        } else {
          await participant.setCameraEnabled(true);
        }
      } else {
        await participant.setCameraEnabled(false);
      }

      // Restore microphone state
      if (this.studioState.microphoneEnabled) {
        if (this.studioState.microphoneDeviceId) {
          await participant.setMicrophoneEnabled(true, {
            deviceId: { exact: this.studioState.microphoneDeviceId }
          });
        } else {
          await participant.setMicrophoneEnabled(true);
        }
      } else {
        await participant.setMicrophoneEnabled(false);
      }

      // Restore screen share
      if (this.studioState.screenSharing) {
        await participant.setScreenShareEnabled(true);
      }

      console.log("LiveKit: Studio state restored");
    } catch (error) {
      console.error("LiveKit: Failed to restore studio state:", error);
    }
  }

  async connect(config: LiveKitConfig): Promise<void> {
    // Use ConnectionManager to prevent duplicate connections
    if (!connectionManager.shouldConnect(config)) {
      console.log("LiveKitService: ConnectionManager blocked connection");
      return;
    }

    if (!config.token || !config.serverUrl || !config.roomName) {
      throw new Error("Missing required LiveKit configuration");
    }

    this.setStatus("connecting");
    this.setState("connecting");
    this.reconnectAttempts = 0;
    this.currentConfig = config;

    try {
      // Get available devices first (no permission request yet)
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const microphones = devices.filter(device => device.kind === 'audioinput');

      this.callbacks.onDevicesAvailable?.({ cameras, microphones });

      // Create room if not exists
      if (!this.room) {
        this.room = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        this.setupRoomListeners();
      }

      // Update ConnectionManager with room reference
      connectionManager.setRoom(this.room);

      // Connect to room
      await this.room.connect(config.serverUrl, config.token);
      this.setStatus("connected");

      // Camera and microphone will be enabled in RoomEvent.Connected handler
      // This ensures localParticipant exists before enabling devices

    } catch (error) {
      console.error("LiveKit: Connection error:", error);
      this.setStatus("error");
      this.setState("error");
      this.callbacks.onError?.(error as Error);
      
      // Update ConnectionManager state
      connectionManager.updateState({
        isConnecting: false,
        isConnected: false,
        lastDisconnectedAt: Date.now(),
      });
      
      // Log to error handler
      errorHandler.connectionError(
        "Échec de connexion LiveKit",
        (error as Error).message,
        true
      );
      
      throw error;
    }
  }

  // Centralized studio session startup
  async startStudioSession(config: LiveKitConfig): Promise<void> {
    await this.connect(config);
    
    // Wait for status to reach "ready" (set by RoomEvent handlers)
    return new Promise((resolve, reject) => {
      const checkStatus = () => {
        if (this.liveKitStatus === "ready") {
          resolve();
        } else if (this.liveKitStatus === "error") {
          reject(new Error("Failed to start studio session"));
        } else {
          setTimeout(checkStatus, 100);
        }
      };
      checkStatus();
    });
  }

  private setupRoomListeners(): void {
    if (!this.room) return;

    this.room.on(RoomEvent.Connected, () => {
      if (!this.mounted) return;
      console.log("LiveKit: Connected to room");
      this.setState("connected");
      this.setStatus("participant_ready");
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.callbacks.onConnected?.();

      // Enable camera and microphone AFTER connection (localParticipant exists)
      this.enableCameraAndMicrophone();
    });

    this.room.on(RoomEvent.LocalTrackPublished, (publication, participant) => {
      if (!this.mounted) return;
      console.log("LiveKit: Local track published:", publication.kind);
      
      // Check if we have both video and audio tracks published
      const videoTrack = this.room?.localParticipant?.getTrackPublication(Track.Source.Camera);
      const audioTrack = this.room?.localParticipant?.getTrackPublication(Track.Source.Microphone);
      
      if (videoTrack && audioTrack) {
        this.setStatus("media_ready");
        this.setStatus("ready");
        console.log("LiveKit: Studio ready - all tracks published");
      }
    });

    this.room.on(RoomEvent.Disconnected, () => {
      if (!this.mounted) return;
      console.log("LiveKit: Disconnected from room");
      this.setState("disconnected");
      this.setStatus("idle");
      this.callbacks.onDisconnected?.();

      // Update ConnectionManager state
      connectionManager.updateState({
        isConnected: false,
        isConnecting: false,
        lastDisconnectedAt: Date.now(),
      });

      // Only attempt reconnection if this wasn't an intentional disconnect
      // and the component is still mounted
      const disconnectReason = connectionManager.getState().disconnectReason;
      if (this.mounted && 
          this.reconnectAttempts < this.maxReconnectAttempts && 
          this.currentConfig &&
          disconnectReason !== "USER_ACTION" &&
          disconnectReason !== "PAGE_UNLOAD") {
        console.log(`LiveKit: Attempting reconnection (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        connectionManager.updateState({ isReconnecting: true });
        this.attemptReconnect();
      } else {
        console.log("LiveKit: Not reconnecting - intentional disconnect or max attempts reached");
        connectionManager.releaseLock();
      }
    });

    this.room.on(RoomEvent.Reconnecting, () => {
      if (!this.mounted) return;
      console.log("LiveKit: Reconnecting...");
      this.setState("reconnecting");
      this.callbacks.onReconnecting?.();
    });

    this.room.on(RoomEvent.Reconnected, () => {
      if (!this.mounted) return;
      console.log("LiveKit: Reconnected");
      this.setState("connected");
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      
      // Restore studio state after reconnection
      this.restoreStudioState();
    });

    this.room.on(RoomEvent.ParticipantConnected, (participant) => {
      if (!this.mounted) return;
      this.callbacks.onParticipantJoined?.(participant);
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      if (!this.mounted) return;
      this.callbacks.onParticipantLeft?.(participant);
    });

    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (!this.mounted) return;
      if (track.kind === Track.Kind.Video) {
        track.attach();
      }
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track) => {
      if (!this.mounted) return;
      track.detach();
    });

    this.room.on(RoomEvent.ConnectionStateChanged, (state) => {
      if (!this.mounted) return;
      console.log("LiveKit: Connection state changed:", state);
    });

    // Handle DataChannel errors gracefully (they can occur during reconnection)
    this.room.on(RoomEvent.SignalConnected, () => {
      if (!this.mounted) return;
      console.log("LiveKit: Signal connected");
    });
  }

  // Suppress non-critical DataChannel errors during reconnection
  private isDataChannelErrorCritical(error: any): boolean {
    // DataChannel errors during reconnection are expected and not critical
    const errorStr = error?.message || String(error);
    const isReconnecting = this.state === "reconnecting" || connectionManager.getState().isReconnecting;
    
    // Suppress DataChannel errors during reconnection
    if (isReconnecting && errorStr.includes("DataChannel")) {
      console.log("LiveKit: Suppressing DataChannel error during reconnection:", errorStr);
      return false;
    }

    // Suppress User-Initiated Abort errors (usually from cleanup)
    if (errorStr.includes("User-Initiated Abort")) {
      console.log("LiveKit: Suppressing User-Initiated Abort error:", errorStr);
      return false;
    }

    return true;
  }

  // Enable camera and microphone after room connection
  private async enableCameraAndMicrophone(): Promise<void> {
    if (!this.room?.localParticipant) {
      console.warn("LiveKit: Cannot enable camera/microphone - no local participant");
      return;
    }

    const config = this.currentConfig;
    if (!config) {
      console.warn("LiveKit: Cannot enable camera/microphone - no config");
      return;
    }

    try {
      // Request permission and enable camera
      try {
        await this.room.localParticipant.setCameraEnabled(config.initialCameraEnabled ?? true);
        this.studioState.cameraEnabled = config.initialCameraEnabled ?? true;
        this.callbacks.onCameraEnabledChange?.(config.initialCameraEnabled ?? true);
      } catch (cameraError) {
        console.error("LiveKit: Camera permission denied or device error:", cameraError);
        errorHandler.deviceError(
          "Caméra non disponible",
          "Permission refusée ou aucune caméra détectée",
          false
        );
        this.studioState.cameraEnabled = false;
        this.callbacks.onCameraEnabledChange?.(false);
      }

      // Request permission and enable microphone
      try {
        await this.room.localParticipant.setMicrophoneEnabled(config.initialMicEnabled ?? true);
        this.studioState.microphoneEnabled = config.initialMicEnabled ?? true;
        this.callbacks.onMicEnabledChange?.(config.initialMicEnabled ?? true);
      } catch (micError) {
        console.error("LiveKit: Microphone permission denied or device error:", micError);
        errorHandler.deviceError(
          "Microphone non disponible",
          "Permission refusée ou aucun microphone détecté",
          false
        );
        this.studioState.microphoneEnabled = false;
        this.callbacks.onMicEnabledChange?.(false);
      }

      // Get local stream for preview (even if one device failed)
      const tracks: MediaStreamTrack[] = [];
      const videoPublication = this.room.localParticipant.getTrackPublication(Track.Source.Camera);
      if (videoPublication?.track?.mediaStreamTrack) {
        tracks.push(videoPublication.track.mediaStreamTrack);
      }

      const audioPublication = this.room.localParticipant.getTrackPublication(Track.Source.Microphone);
      if (audioPublication?.track?.mediaStreamTrack) {
        tracks.push(audioPublication.track.mediaStreamTrack);
      }

      if (tracks.length > 0 && this.mounted) {
        const mediaStream = new MediaStream(tracks);
        this.callbacks.onLocalStreamChange?.(mediaStream);
      }

      // Setup device change detection
      this.setupDeviceChangeDetection();

      // Update ConnectionManager state
      connectionManager.updateState({
        isConnected: true,
        isConnecting: false,
        lastConnectedAt: Date.now(),
      });

    } catch (error) {
      console.error("LiveKit: Failed to enable camera/microphone:", error);
      errorHandler.deviceError(
        "Impossible d'activer la caméra ou le microphone",
        (error as Error).message,
        false
      );
    }
  }

  private attemptReconnect(): void {
    // Use ConnectionManager's reconnect timer
    connectionManager.clearReconnectTimer();

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`LiveKit: Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    const timer = setTimeout(async () => {
      if (!this.mounted || !this.room || !this.currentConfig) return;

      try {
        this.setState("reconnecting");
        await this.room.connect(this.currentConfig.serverUrl, this.currentConfig.token);
        
        // Update ConnectionManager state on successful reconnection
        connectionManager.updateState({
          isConnected: true,
          isReconnecting: false,
          lastConnectedAt: Date.now(),
        });
      } catch (error) {
        console.error("LiveKit: Reconnection failed:", error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        } else {
          this.setState("error");
          this.callbacks.onError?.(new Error("Max reconnection attempts reached"));
          
          // Update ConnectionManager state on max attempts
          connectionManager.updateState({
            isReconnecting: false,
            isConnected: false,
          });
          
          connectionManager.releaseLock();
        }
      }
    }, delay);

    connectionManager.setReconnectTimer(timer);
  }

  async disconnect(): Promise<void> {
    this.mounted = false;

    // Remove device change detection
    this.removeDeviceChangeDetection();

    // Clear reconnect timer using ConnectionManager
    connectionManager.clearReconnectTimer();

    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }

    // Update ConnectionManager state
    connectionManager.updateState({
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      disconnectReason: "USER_ACTION",
      lastDisconnectedAt: Date.now(),
    });

    // Release connection lock
    connectionManager.releaseLock();

    this.setState("idle");
    this.reconnectAttempts = 0;
  }

  // Camera controls
  async toggleCamera(): Promise<void> {
    const participant = this.getLocalParticipant();
    if (!participant) {
      throw new Error("No local participant available");
    }

    const currentState = participant.isCameraEnabled;
    await participant.setCameraEnabled(!currentState);
    this.studioState.cameraEnabled = !currentState;
    this.callbacks.onCameraEnabledChange?.(!currentState);
  }

  async switchCamera(deviceId: string): Promise<boolean> {
    // Check if LiveKit is ready
    if (!this.isReady()) {
      console.warn("LiveKit: Camera switch blocked - LiveKit not ready");
      return false;
    }

    const participant = this.getLocalParticipant();
    if (!participant) {
      console.warn("LiveKit: Cannot switch camera - no local participant available");
      return false;
    }

    if (this.state !== "connected") {
      console.warn("LiveKit: Cannot switch camera - not connected to LiveKit room");
      return false;
    }

    // Check if video track exists
    const videoTrack = participant.getTrackPublication(Track.Source.Camera);
    if (!videoTrack) {
      console.warn("LiveKit: Cannot switch camera - no video track published");
      return false;
    }

    try {
      await participant.setCameraEnabled(true, {
        deviceId: { exact: deviceId }
      });
      this.studioState.cameraEnabled = true;
      this.studioState.cameraDeviceId = deviceId;
      this.callbacks.onCameraEnabledChange?.(true);
      return true;
    } catch (error) {
      console.error("LiveKit: Camera switch error:", error);
      errorHandler.deviceError(
        "Échec du changement de caméra",
        (error as Error).message,
        false
      );
      return false;
    }
  }

  // Microphone controls
  async toggleMute(): Promise<void> {
    const participant = this.getLocalParticipant();
    if (!participant) {
      console.warn("LiveKit: Cannot toggle microphone - no local participant available");
      return;
    }

    const currentState = participant.isMicrophoneEnabled;
    await participant.setMicrophoneEnabled(!currentState);
    this.studioState.microphoneEnabled = !currentState;
    this.callbacks.onMicEnabledChange?.(!currentState);
  }

  async switchMicrophone(deviceId: string): Promise<boolean> {
    // Check if LiveKit is ready
    if (!this.isReady()) {
      console.warn("LiveKit: Microphone switch blocked - LiveKit not ready");
      return false;
    }

    const participant = this.getLocalParticipant();
    if (!participant) {
      console.warn("LiveKit: Cannot switch microphone - no local participant available");
      return false;
    }

    if (this.state !== "connected") {
      console.warn("LiveKit: Cannot switch microphone - not connected to LiveKit room");
      return false;
    }

    // Check if audio track exists
    const audioTrack = participant.getTrackPublication(Track.Source.Microphone);
    if (!audioTrack) {
      console.warn("LiveKit: Cannot switch microphone - no audio track published");
      return false;
    }

    try {
      await participant.setMicrophoneEnabled(true, {
        deviceId: { exact: deviceId }
      });
      this.studioState.microphoneEnabled = true;
      this.studioState.microphoneDeviceId = deviceId;
      this.callbacks.onMicEnabledChange?.(true);
      return true;
    } catch (error) {
      console.error("LiveKit: Microphone switch error:", error);
      errorHandler.deviceError(
        "Échec du changement de microphone",
        (error as Error).message,
        false
      );
      return false;
    }
  }

  // Screen share
  async startScreenShare(): Promise<void> {
    const participant = this.getLocalParticipant();
    if (!participant) {
      throw new Error("No local participant available");
    }

    await participant.setScreenShareEnabled(true);
    this.studioState.screenSharing = true;
  }

  async stopScreenShare(): Promise<void> {
    const participant = this.getLocalParticipant();
    if (!participant) {
      throw new Error("No local participant available");
    }

    await participant.setScreenShareEnabled(false);
    this.studioState.screenSharing = false;
  }

  // Stats
  // Note: getStats() may not be available in all LiveKit versions
  // This is a placeholder for future implementation
  async getStats(): Promise<any> {
    if (!this.room) {
      return null;
    }

    try {
      // TODO: Implement stats retrieval based on LiveKit version
      // Some versions use room.getStats(), others use participant.getStats()
      console.warn("LiveKit: Stats retrieval not yet implemented");
      return null;
    } catch (error) {
      console.error("LiveKit: Failed to get stats:", error);
      return null;
    }
  }

  // Create local camera preview track (not published to LiveKit yet)
  async createCameraPreview(deviceId?: string): Promise<LocalVideoTrack> {
    console.log("[Camera] Requesting device:", deviceId || "default");
    
    try {
      const track = await createLocalVideoTrack({
        deviceId: deviceId ? { exact: deviceId } : undefined,
        resolution: { width: 1280, height: 720 },
      });
      
      console.log("[Camera] Track created:", track.kind);
      return track;
    } catch (error) {
      console.error("[Camera] Failed to create track:", error);
      errorHandler.deviceError(
        "Impossible de créer la piste caméra",
        (error as Error).message,
        false
      );
      throw error;
    }
  }

  // Create local microphone preview track (not published to LiveKit yet)
  async createMicrophonePreview(deviceId?: string): Promise<LocalAudioTrack> {
    console.log("[Microphone] Requesting device:", deviceId || "default");
    
    try {
      const track = await createLocalAudioTrack({
        deviceId: deviceId ? { exact: deviceId } : undefined,
      });
      
      console.log("[Microphone] Track created:", track.kind);
      return track;
    } catch (error) {
      console.error("[Microphone] Failed to create track:", error);
      errorHandler.deviceError(
        "Impossible de créer la piste microphone",
        (error as Error).message,
        false
      );
      throw error;
    }
  }

  // Publish a local track to LiveKit (after preview validation)
  async publishTrack(track: LocalVideoTrack | LocalAudioTrack): Promise<void> {
    if (!this.room?.localParticipant) {
      console.error("[Camera] Cannot publish - no local participant");
      throw new Error("No local participant available");
    }

    console.log("[Camera] Publishing track to LiveKit:", track.kind);
    
    try {
      await this.room.localParticipant.publishTrack(track);
      console.log("[Camera] Track published successfully");
    } catch (error) {
      console.error("[Camera] Failed to publish track:", error);
      errorHandler.deviceError(
        "Impossible de publier la piste",
        (error as Error).message,
        false
      );
      throw error;
    }
  }
}

export const liveKitService = LiveKitService.getInstance();
