/**
 * Types pour le système de diffusion multi-contexte
 * ChurchFace V1 Stabilization
 */

/**
 * Types de propriétaires de diffusion
 */
export type OwnerType = "USER" | "CHURCH" | "GLOBAL";

/**
 * Permissions de diffusion
 */
export interface BroadcastPermissions {
  canPublish: boolean;
  canRecord: boolean;
  canStream: boolean;
  canManageOutputs: boolean;
  canInviteGuests: boolean;
  canUseMultistream: boolean;
  canManageChat: boolean;
}

/**
 * Contexte de diffusion
 */
export interface BroadcastContext {
  ownerType: OwnerType;
  ownerId: string;
  ownerName: string;
  broadcastId: string;
  broadcastName: string;
  permissions: BroadcastPermissions;
  livekitConfig: {
    token: string;
    url: string;
    roomName: string;
  };
}

/**
 * Paramètres pour résoudre un contexte de diffusion
 */
export interface ResolveContextParams {
  // Pour contexte église
  churchSlug?: string;
  
  // Pour contexte global/utilisateur
  broadcastId?: string;
  
  // Session utilisateur
  userId: string;
  userRole?: string;
  userName?: string;
}

/**
 * Configuration de sortie de diffusion
 */
export interface BroadcastOutput {
  id: string;
  type: "RTMP" | "WEBRTC" | "HLS" | "DASH";
  url: string;
  enabled: boolean;
  status: "ACTIVE" | "INACTIVE" | "ERROR";
  metadata?: Record<string, any>;
}

/**
 * Statistiques de diffusion
 */
export interface BroadcastStats {
  viewerCount: number;
  peakViewerCount: number;
  duration: number;
  bitrate: number;
  bandwidth: number;
  packetLoss: number;
  cpuUsage: number;
}

/**
 * État de diffusion
 */
export type BroadcastStatus = 
  | "SCHEDULED"
  | "PREPARING"
  | "LIVE"
  | "PAUSED"
  | "ENDED"
  | "ERROR";
