"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface MonitoringStats {
  // Viewers
  currentViewers: number;
  peakViewers: number;
  averageViewers: number;

  // Performance
  cpuUsage: number;
  memoryUsage: number;
  bitrate: number;
  bandwidth: number;

  // Network
  rtt: number;
  packetLoss: number;
  droppedFrames: number;
  jitter: number;

  // LiveKit
  liveKitConnected: boolean;
  liveKitRoomParticipants: number;
  liveKitPublishedTracks: number;
  liveKitSubscribedTracks: number;

  // Relay
  relayEnabled: boolean;
  relayActiveDestinations: number;
  relayTotalBitrate: number;
  relayErrors: number;

  // Recording
  recordingEnabled: boolean;
  recordingStatus: "STOPPED" | "RECORDING" | "PAUSED" | "ERROR";
  recordingDuration: number;
  recordingFileSize: number;

  // Server
  serverStatus: "online" | "degraded" | "offline";
  serverLatency: number;
  uptime: number;
}

export interface MonitoringAlert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export function useStudioMonitoring(broadcastId?: string) {
  const [stats, setStats] = useState<MonitoringStats>({
    currentViewers: 0,
    peakViewers: 0,
    averageViewers: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    bitrate: 0,
    bandwidth: 0,
    rtt: 0,
    packetLoss: 0,
    droppedFrames: 0,
    jitter: 0,
    liveKitConnected: false,
    liveKitRoomParticipants: 0,
    liveKitPublishedTracks: 0,
    liveKitSubscribedTracks: 0,
    relayEnabled: false,
    relayActiveDestinations: 0,
    relayTotalBitrate: 0,
    relayErrors: 0,
    recordingEnabled: false,
    recordingStatus: "STOPPED",
    recordingDuration: 0,
    recordingFileSize: 0,
    serverStatus: "online",
    serverLatency: 0,
    uptime: 0,
  });

  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const viewerHistoryRef = useRef<number[]>([]);
  const startTimeRef = useRef<Date>(new Date());
  const statsRef = useRef(stats);

  // Keep statsRef in sync with stats
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    setIsMonitoring(true);

    updateIntervalRef.current = setInterval(() => {
      updateStats();
    }, 1000);
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  // Update stats (simulated for demo)
  const updateStats = useCallback(async () => {
    try {
      // In a real implementation, this would fetch from monitoring APIs
      // For now, we simulate the data
      
      const currentStats = statsRef.current;
      
      const newStats: MonitoringStats = {
        ...currentStats,
        // Simulate viewer count changes
        currentViewers: Math.max(0, currentStats.currentViewers + Math.floor(Math.random() * 10) - 5),
        peakViewers: Math.max(currentStats.peakViewers, currentStats.currentViewers),
        
        // Simulate performance metrics
        cpuUsage: Math.random() * 30 + 20, // 20-50%
        memoryUsage: Math.random() * 20 + 40, // 40-60%
        bitrate: 3000 + Math.random() * 2000, // 3000-5000 kbps
        bandwidth: currentStats.bitrate / 8, // Convert to kB/s
        
        // Simulate network metrics
        rtt: 20 + Math.random() * 30, // 20-50ms
        packetLoss: Math.random() * 2, // 0-2%
        droppedFrames: Math.floor(Math.random() * 5),
        jitter: 1 + Math.random() * 4, // 1-5ms
        
        // Calculate uptime
        uptime: Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000),
      };

      // Calculate average viewers
      viewerHistoryRef.current.push(newStats.currentViewers);
      if (viewerHistoryRef.current.length > 60) {
        viewerHistoryRef.current.shift();
      }
      const avgViewers =
        viewerHistoryRef.current.reduce((a, b) => a + b, 0) /
        viewerHistoryRef.current.length;
      newStats.averageViewers = Math.floor(avgViewers);

      // Check for alerts
      checkAlerts(newStats);

      setStats(newStats);
    } catch (error) {
      console.error("Error updating monitoring stats:", error);
    }
  }, []);

  // Check for alerts
  const checkAlerts = useCallback((newStats: MonitoringStats) => {
    const newAlerts: MonitoringAlert[] = [];

    // High CPU usage
    if (newStats.cpuUsage > 80) {
      newAlerts.push({
        id: `alert_${Date.now()}_cpu`,
        type: "warning",
        message: `CPU usage high: ${newStats.cpuUsage.toFixed(1)}%`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    // High packet loss
    if (newStats.packetLoss > 5) {
      newAlerts.push({
        id: `alert_${Date.now()}_packetloss`,
        type: "error",
        message: `High packet loss: ${newStats.packetLoss.toFixed(1)}%`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    // High dropped frames
    if (newStats.droppedFrames > 10) {
      newAlerts.push({
        id: `alert_${Date.now()}_dropped`,
        type: "warning",
        message: `High dropped frames: ${newStats.droppedFrames}`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    // Low bitrate
    if (newStats.bitrate < 1000) {
      newAlerts.push({
        id: `alert_${Date.now()}_bitrate`,
        type: "warning",
        message: `Low bitrate: ${newStats.bitrate.toFixed(0)} kbps`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev]);
    }
  }, []);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  }, []);

  // Clear acknowledged alerts
  const clearAcknowledgedAlerts = useCallback(() => {
    setAlerts((prev) => prev.filter((alert) => !alert.acknowledged));
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Update specific stat
  const updateStat = useCallback(
    <K extends keyof MonitoringStats>(key: K, value: MonitoringStats[K]) => {
      setStats((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Get health status
  const getHealthStatus = useCallback((): "healthy" | "warning" | "critical" => {
    const currentStats = statsRef.current;
    if (
      currentStats.cpuUsage > 90 ||
      currentStats.packetLoss > 10 ||
      currentStats.droppedFrames > 20 ||
      currentStats.bitrate < 500
    ) {
      return "critical";
    }
    if (
      currentStats.cpuUsage > 70 ||
      currentStats.packetLoss > 5 ||
      currentStats.droppedFrames > 10 ||
      currentStats.bitrate < 1000
    ) {
      return "warning";
    }
    return "healthy";
  }, []);

  // Format uptime
  const formatUptime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }, []);

  // Format bitrate
  const formatBitrate = useCallback((kbps: number): string => {
    if (kbps >= 1000) {
      return `${(kbps / 1000).toFixed(1)} Mbps`;
    }
    return `${kbps.toFixed(0)} kbps`;
  }, []);

  // Format bytes
  const formatBytes = useCallback((bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${bytes} B`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    // State
    stats,
    alerts,
    isMonitoring,
    healthStatus: getHealthStatus(),

    // Actions
    startMonitoring,
    stopMonitoring,
    acknowledgeAlert,
    clearAcknowledgedAlerts,
    clearAllAlerts,
    updateStat,

    // Utilities
    formatUptime,
    formatBitrate,
    formatBytes,
  };
}
