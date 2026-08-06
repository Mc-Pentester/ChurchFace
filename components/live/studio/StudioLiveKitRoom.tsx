"use client";

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { RemoteParticipant } from "livekit-client";
import { liveKitService, ConnectionState, LiveKitConfig, LiveKitCallbacks } from "@/lib/livekit/LiveKitService";
import { connectionManager, DisconnectReason } from "@/lib/livekit/ConnectionManager";

interface StudioLiveKitRoomProps {
  token: string;
  serverUrl: string;
  roomName: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onLocalStreamChange?: (stream: MediaStream | null) => void;
  onParticipantJoined?: (participant: RemoteParticipant) => void;
  onParticipantLeft?: (participant: RemoteParticipant) => void;
  onCameraEnabledChange?: (enabled: boolean) => void;
  onMicEnabledChange?: (enabled: boolean) => void;
  onDevicesAvailable?: (devices: { cameras: MediaDeviceInfo[], microphones: MediaDeviceInfo[] }) => void;
  onStateChange?: (state: ConnectionState) => void;
  initialCameraEnabled?: boolean;
  initialMicEnabled?: boolean;
}

export interface StudioLiveKitRoomRef {
  disconnect: () => Promise<void>;
  room: any;
  localParticipant: any;
  switchCamera: (deviceId: string) => Promise<boolean>;
  switchMicrophone: (deviceId: string) => Promise<boolean>;
  getState: () => ConnectionState;
  isLiveKitReady: () => boolean;
}

const StudioLiveKitRoom = forwardRef<StudioLiveKitRoomRef, StudioLiveKitRoomProps>(({
  token,
  serverUrl,
  roomName,
  onConnected,
  onDisconnected,
  onLocalStreamChange,
  onParticipantJoined,
  onParticipantLeft,
  onCameraEnabledChange,
  onMicEnabledChange,
  onDevicesAvailable,
  onStateChange,
  initialCameraEnabled = true,
  initialMicEnabled = true,
}, ref) => {
  const mountedRef = useRef(true);
  const connectingRef = useRef(false);
  const configRef = useRef<LiveKitConfig | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLiveKitReady, setIsLiveKitReady] = useState(false);

  // Setup callbacks for the service
  useEffect(() => {
    const callbacks: LiveKitCallbacks = {
      onConnected: () => {
        if (mountedRef.current) {
          setIsConnected(true);
          // Don't set isLiveKitReady here - wait for status change
          onConnected?.();
        }
      },
      onDisconnected: () => {
        if (mountedRef.current) {
          setIsConnected(false);
          setIsLiveKitReady(false);
          onDisconnected?.();
        }
      },
      onError: (error) => {
        // Filter non-critical DataChannel errors
        const errorStr = error?.message || String(error);
        const isDataChannelError = errorStr.includes("DataChannel");
        const isUserAbort = errorStr.includes("User-Initiated Abort");
        
        // Only log critical errors
        if (!isDataChannelError && !isUserAbort) {
          console.error("LiveKit: Error:", error);
        }
      },
      onLocalStreamChange: (stream) => {
        if (mountedRef.current) {
          onLocalStreamChange?.(stream);
        }
      },
      onParticipantJoined: (participant) => {
        if (mountedRef.current) {
          onParticipantJoined?.(participant);
        }
      },
      onParticipantLeft: (participant) => {
        if (mountedRef.current) {
          onParticipantLeft?.(participant);
        }
      },
      onCameraEnabledChange: (enabled) => {
        if (mountedRef.current) {
          onCameraEnabledChange?.(enabled);
        }
      },
      onMicEnabledChange: (enabled) => {
        if (mountedRef.current) {
          onMicEnabledChange?.(enabled);
        }
      },
      onDevicesAvailable: (devices) => {
        if (mountedRef.current) {
          onDevicesAvailable?.(devices);
        }
      },
      onStateChange: (state) => {
        if (mountedRef.current) {
          onStateChange?.(state);
        }
      },
      onStatusChange: (status) => {
        if (mountedRef.current) {
          console.log("StudioLiveKitRoom: LiveKit status changed to:", status);
          if (status === "ready") {
            setIsLiveKitReady(true);
          } else {
            setIsLiveKitReady(false);
          }
        }
      },
    };

    liveKitService.setCallbacks(callbacks);

    return () => {
      liveKitService.clearCallbacks();
    };
  }, [onConnected, onDisconnected, onLocalStreamChange, onParticipantJoined, onParticipantLeft, onCameraEnabledChange, onMicEnabledChange, onDevicesAvailable, onStateChange]);

  // Connect to LiveKit using startStudioSession
  useEffect(() => {
    mountedRef.current = true;

    async function connect() {
      if (!token || !serverUrl || !roomName) {
        return;
      }

      // Prevent multiple simultaneous connections
      if (connectingRef.current) {
        console.log("StudioLiveKitRoom: Already connecting, skipping");
        return;
      }

      // Release stale locks before attempting connection
      connectionManager.releaseStaleLock();

      const config: LiveKitConfig = {
        token,
        serverUrl,
        roomName,
        initialCameraEnabled,
        initialMicEnabled,
      };

      // Check if we should connect using ConnectionManager
      if (!connectionManager.shouldConnect(config)) {
        return;
      }

      // Acquire connection lock
      if (!connectionManager.acquireLock("StudioLiveKitRoom")) {
        return;
      }

      connectingRef.current = true;
      configRef.current = config;

      // Update connection state
      connectionManager.updateState({
        roomName,
        isConnecting: true,
        isReconnecting: false,
      });

      try {
        console.log("StudioLiveKitRoom: Starting studio session");
        await liveKitService.startStudio(config);
        
        connectionManager.setRoom(liveKitService.getRoom());
        connectionManager.setConfig(config);
        
        // Release lock after successful connection
        connectionManager.releaseLock();
      } catch (error) {
        console.error("StudioLiveKitRoom: Failed to start studio session:", error);
        
        // Update connection state on error
        connectionManager.updateState({
          isConnecting: false,
          isConnected: false,
          lastDisconnectedAt: Date.now(),
        });
        
        // Release lock on error
        connectionManager.releaseLock();
      } finally {
        connectingRef.current = false;
      }
    }

    connect();

    return () => {
      mountedRef.current = false;
      connectingRef.current = false;
      
      // Only disconnect if this component initiated the connection
      // and it's not a Fast Refresh
      const state = connectionManager.getState();
      if (state.isConnected && state.roomName === roomName) {
        console.log("StudioLiveKitRoom: Component unmounting, disconnecting");
        connectionManager.updateState({
          isConnected: false,
          isConnecting: false,
          lastDisconnectedAt: Date.now(),
        });
        liveKitService.disconnect();
      }
    };
  }, [token, serverUrl, roomName, initialCameraEnabled, initialMicEnabled]);

  // Camera controls
  const toggleCamera = useCallback(async (enabled: boolean) => {
    if (!isLiveKitReady) {
      console.warn("LiveKit: Cannot toggle camera - LiveKit not ready");
      return false;
    }
    try {
      return await liveKitService.toggleCamera(enabled);
    } catch (error) {
      console.error("LiveKit: Toggle camera error:", error);
      return false;
    }
  }, [isLiveKitReady]);

  const switchCamera = useCallback(async (deviceId: string) => {
    if (!isLiveKitReady) {
      console.warn("LiveKit: Cannot switch camera - LiveKit not ready");
      return false;
    }
    try {
      return await liveKitService.switchCamera(deviceId);
    } catch (error) {
      console.error("LiveKit: Switch camera error:", error);
      return false;
    }
  }, [isLiveKitReady]);

  // Microphone controls
  const toggleMicrophone = useCallback(async (enabled: boolean) => {
    if (!isLiveKitReady) {
      console.warn("LiveKit: Cannot toggle microphone - LiveKit not ready");
      return false;
    }
    try {
      return await liveKitService.toggleMicrophone(enabled);
    } catch (error) {
      console.error("LiveKit: Toggle microphone error:", error);
      return false;
    }
  }, [isLiveKitReady]);

  const switchMicrophone = useCallback(async (deviceId: string) => {
    if (!isLiveKitReady) {
      console.warn("LiveKit: Cannot switch microphone - LiveKit not ready");
      return false;
    }
    try {
      return await liveKitService.switchMicrophone(deviceId);
    } catch (error) {
      console.error("LiveKit: Switch microphone error:", error);
      return false;
    }
  }, [isLiveKitReady]);

  // Screen share controls
  const startScreenShare = useCallback(async () => {
    if (!isLiveKitReady) {
      console.warn("LiveKit: Cannot start screen share - LiveKit not ready");
      return false;
    }
    try {
      return await liveKitService.startScreenShare();
    } catch (error) {
      console.error("LiveKit: Start screen share error:", error);
      return false;
    }
  }, [isLiveKitReady]);

  const stopScreenShare = useCallback(async () => {
    if (!isLiveKitReady) {
      console.warn("LiveKit: Cannot stop screen share - LiveKit not ready");
      return false;
    }
    try {
      return await liveKitService.stopScreenShare();
    } catch (error) {
      console.error("LiveKit: Stop screen share error:", error);
      return false;
    }
  }, [isLiveKitReady]);

  // Disconnect
  const disconnect = useCallback(async () => {
    try {
      await liveKitService.disconnect();
      setIsConnected(false);
    } catch (error) {
      console.error("LiveKit: Disconnect error:", error);
    }
  }, []);

  // Expose control functions via ref for parent components
  useImperativeHandle(ref, () => ({
    disconnect,
    toggleCamera,
    switchCamera,
    toggleMicrophone,
    switchMicrophone,
    startScreenShare,
    stopScreenShare,
    room: liveKitService.getRoom(),
    localParticipant: liveKitService.getLocalParticipant(),
    getState: () => liveKitService.getState(),
    isLiveKitReady: () => isLiveKitReady,
  }), [disconnect, toggleCamera, switchCamera, toggleMicrophone, switchMicrophone, startScreenShare, stopScreenShare, isLiveKitReady]);

  return null; // This component manages the connection but doesn't render anything
});

StudioLiveKitRoom.displayName = "StudioLiveKitRoom";

export default StudioLiveKitRoom;
