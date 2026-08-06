/**
 * Types pour le domaine Mobile Live
 * ChurchFace V1 - Live Mobile Instantané
 */

export type MobileLiveContext = "PERSONAL" | "CHURCH";

export type MobileLiveVisibility = "PUBLIC" | "SUBSCRIBERS" | "PRIVATE";

export type MobileLiveStatus = "SETUP" | "CONNECTING" | "LIVE" | "ENDED" | "ERROR";

export type MobileLiveCamera = "front" | "back";

export interface MobileLiveConfig {
  title: string;
  description?: string;
  category?: string;
  visibility: MobileLiveVisibility;
  enableRecording: boolean;
  enableChat: boolean;
  enableReactions: boolean;
  externalDestinations?: Array<{
    type: "YOUTUBE" | "FACEBOOK" | "TWITCH" | "CUSTOM";
    rtmpUrl?: string;
    streamKey?: string;
    enabled: boolean;
  }>;
}

export interface MobileLiveSession {
  id: string;
  userId: string;
  context: MobileLiveContext;
  ownerId: string;
  ownerType: "USER" | "CHURCH";
  config: MobileLiveConfig;
  status: MobileLiveStatus;
  broadcastId?: string;
  roomName?: string;
  livekitToken?: string;
  livekitUrl?: string;
  camera: MobileLiveCamera;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  viewerCount: number;
  duration: number;
  startedAt?: Date;
  endedAt?: Date;
  thumbnail?: string;
  replayUrl?: string;
}

export interface MobileLivePermissions {
  canStartLive: boolean;
  canStreamToChurch: boolean;
  canRecord: boolean;
  canUseChat: boolean;
  canUseReactions: boolean;
  canMultiStream: boolean;
  reason?: string;
}

export interface MobileLiveStats {
  viewerCount: number;
  peakViewers: number;
  duration: number;
  bitrate: number;
  fps: number;
  droppedFrames: number;
  networkQuality: "EXCELLENT" | "GOOD" | "POOR" | "DISCONNECTED";
}
