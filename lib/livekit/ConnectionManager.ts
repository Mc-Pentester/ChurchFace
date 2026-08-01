import { Room } from "livekit-client";
import { LiveKitConfig } from "./LiveKitService";

export type DisconnectReason = "NETWORK" | "USER_ACTION" | "PAGE_UNLOAD" | "FAST_REFRESH" | "CONFIG_CHANGE";

export interface ConnectionLock {
  isLocked: boolean;
  lockReason: string | null;
  lockTime: number;
}

export interface ConnectionState {
  roomName: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  disconnectReason: DisconnectReason | null;
  lastConnectedAt: number | null;
  lastDisconnectedAt: number | null;
}

class ConnectionManager {
  private static instance: ConnectionManager;
  private connectionLock: ConnectionLock = {
    isLocked: false,
    lockReason: null,
    lockTime: 0,
  };
  
  private connectionState: ConnectionState = {
    roomName: null,
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    disconnectReason: null,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
  };

  private reconnectTimer: NodeJS.Timeout | null = null;
  private currentRoom: Room | null = null;
  private currentConfig: LiveKitConfig | null = null;

  private constructor() {}

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  /**
   * Acquire a connection lock to prevent multiple simultaneous connections
   */
  acquireLock(reason: string): boolean {
    if (this.connectionLock.isLocked) {
      console.log(`ConnectionManager: Connection locked (${this.connectionLock.lockReason}), skipping ${reason}`);
      return false;
    }

    this.connectionLock = {
      isLocked: true,
      lockReason: reason,
      lockTime: Date.now(),
    };

    console.log(`ConnectionManager: Connection lock acquired for ${reason}`);
    return true;
  }

  /**
   * Release the connection lock
   */
  releaseLock(): void {
    if (this.connectionLock.isLocked) {
      console.log(`ConnectionManager: Connection lock released (${this.connectionLock.lockReason})`);
      this.connectionLock = {
        isLocked: false,
        lockReason: null,
        lockTime: 0,
      };
    }
  }

  /**
   * Check if we should connect (not already connected to same room)
   */
  shouldConnect(config: LiveKitConfig): boolean {
    const { roomName } = config;
    
    // If already connected to the same room, skip
    if (this.connectionState.isConnected && 
        this.connectionState.roomName === roomName &&
        this.currentRoom &&
        this.currentRoom.state === "connected") {
      console.log(`ConnectionManager: Already connected to ${roomName}, skipping connection`);
      return false;
    }

    // If currently connecting, skip
    if (this.connectionState.isConnecting) {
      console.log(`ConnectionManager: Already connecting, skipping new connection`);
      return false;
    }

    // If currently reconnecting, skip
    if (this.connectionState.isReconnecting) {
      console.log(`ConnectionManager: Currently reconnecting, skipping new connection`);
      return false;
    }

    return true;
  }

  /**
   * Update connection state
   */
  updateState(updates: Partial<ConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...updates };
    console.log("ConnectionManager: State updated:", this.connectionState);
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Set current room
   */
  setRoom(room: Room | null): void {
    this.currentRoom = room;
  }

  /**
   * Get current room
   */
  getRoom(): Room | null {
    return this.currentRoom;
  }

  /**
   * Set current config
   */
  setConfig(config: LiveKitConfig | null): void {
    this.currentConfig = config;
  }

  /**
   * Get current config
   */
  getConfig(): LiveKitConfig | null {
    return this.currentConfig;
  }

  /**
   * Clear reconnect timer
   */
  clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Set reconnect timer
   */
  setReconnectTimer(timer: NodeJS.Timeout): void {
    this.clearReconnectTimer();
    this.reconnectTimer = timer;
  }

  /**
   * Reset all state (for cleanup)
   */
  reset(): void {
    this.clearReconnectTimer();
    this.releaseLock();
    this.connectionState = {
      roomName: null,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      disconnectReason: null,
      lastConnectedAt: null,
      lastDisconnectedAt: null,
    };
    this.currentRoom = null;
    this.currentConfig = null;
    console.log("ConnectionManager: State reset");
  }

  /**
   * Check if lock is stale (older than 30 seconds)
   */
  isLockStale(): boolean {
    if (!this.connectionLock.isLocked) {
      return false;
    }
    const staleTime = 30000; // 30 seconds
    return Date.now() - this.connectionLock.lockTime > staleTime;
  }

  /**
   * Force release stale lock
   */
  releaseStaleLock(): void {
    if (this.isLockStale()) {
      console.log("ConnectionManager: Releasing stale lock");
      this.releaseLock();
    }
  }
}

export const connectionManager = ConnectionManager.getInstance();
