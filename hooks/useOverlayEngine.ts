"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface Overlay {
  id: string;
  type: "VERSE" | "ANNOUNCEMENT" | "LOWER_THIRD" | "TITLE" | "LOGO" | "TIMER" | "COUNTDOWN" | "BANNER" | "CHAT" | "COUNTER" | "CUSTOM";
  name: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  isVisible: boolean;
  isLocked: boolean;
  zIndex: number;
  rotation: number;
  animation?: {
    type: "FADE_IN" | "FADE_OUT" | "SLIDE_IN" | "SLIDE_OUT" | "ZOOM_IN" | "ZOOM_OUT" | "NONE";
    duration: number;
    delay: number;
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    padding?: number;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
  };
  verseData?: {
    book: string;
    chapter: number;
    verseStart: number;
    verseEnd?: number;
    text: string;
    translation?: string;
  };
  timerData?: {
    duration: number;
    currentTime: number;
    isRunning: boolean;
  };
  countdownData?: {
    targetDate: Date;
    currentTime: number;
  };
}

export interface OverlayEngineConfig {
  canvasWidth: number;
  canvasHeight: number;
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
}

export function useOverlayEngine(initialConfig?: Partial<OverlayEngineConfig>) {
  const [overlays, setOverlays] = useState<Overlay[]>([
    {
      id: "default-overlay",
      type: "VERSE",
      name: "Overlay verse",
      content: "Ainsi la foi vient de ce qu'on entend, et ce qu'on entend vient de la parole de Christ.",
      x: 50,
      y: 50,
      width: 300,
      height: 100,
      opacity: 1,
      isVisible: true,
      isLocked: false,
      zIndex: 1,
      rotation: 0,
      style: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        textColor: "#ffffff",
        fontSize: 16,
        fontFamily: "Arial",
        fontWeight: "normal",
        padding: 20,
        borderRadius: 8,
      },
      verseData: {
        book: "Romains",
        chapter: 10,
        verseStart: 17,
        text: "Ainsi la foi vient de ce qu'on entend, et ce qu'on entend vient de la parole de Christ.",
      },
    },
  ]);
  const [config, setConfig] = useState<OverlayEngineConfig>({
    canvasWidth: 1920,
    canvasHeight: 1080,
    gridSize: 20,
    snapToGrid: true,
    showGrid: true,
    ...initialConfig,
  });

  const draggedOverlayRef = useRef<{ overlayId: string; offsetX: number; offsetY: number } | null>(null);
  const resizedOverlayRef = useRef<{ overlayId: string; handle: string; startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);
  const timerIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const overlaysRef = useRef<Overlay[]>([]);

  // Keep overlaysRef in sync with overlays state
  useEffect(() => {
    overlaysRef.current = overlays;
  }, [overlays]);

  // Timer management
  useEffect(() => {
    // Start timers for running overlays
    overlaysRef.current.forEach(overlay => {
      if (overlay.type === "TIMER" && overlay.timerData?.isRunning) {
        const existingInterval = timerIntervalsRef.current.get(overlay.id);
        if (existingInterval) return;

        const interval = setInterval(() => {
          setOverlays(prev => prev.map(o => {
            if (o.id !== overlay.id || !o.timerData) return o;
            const newTime = o.timerData.currentTime + 1;
            const isRunning = newTime < o.timerData.duration;
            return {
              ...o,
              timerData: {
                ...o.timerData,
                currentTime: newTime,
                isRunning,
              },
            };
          }));
        }, 1000);

        timerIntervalsRef.current.set(overlay.id, interval);
      } else if (overlay.type === "COUNTDOWN") {
        const existingInterval = timerIntervalsRef.current.get(overlay.id);
        if (existingInterval) return;

        const interval = setInterval(() => {
          setOverlays(prev => prev.map(o => {
            if (o.id !== overlay.id || !o.countdownData) return o;
            const now = new Date();
            const target = new Date(o.countdownData.targetDate);
            const diff = target.getTime() - now.getTime();
            const currentTime = Math.max(0, Math.floor(diff / 1000));

            return {
              ...o,
              countdownData: {
                ...o.countdownData,
                currentTime,
              },
            };
          }));
        }, 1000);

        timerIntervalsRef.current.set(overlay.id, interval);
      }
    });

    // Cleanup intervals for overlays that no longer exist or are not running
    const activeOverlayIds = new Set(
      overlaysRef.current
        .filter(o => 
          (o.type === "TIMER" && o.timerData?.isRunning) ||
          (o.type === "COUNTDOWN")
        )
        .map(o => o.id)
    );

    timerIntervalsRef.current.forEach((interval, overlayId) => {
      if (!activeOverlayIds.has(overlayId)) {
        clearInterval(interval);
        timerIntervalsRef.current.delete(overlayId);
      }
    });

    return () => {
      timerIntervalsRef.current.forEach(interval => clearInterval(interval));
      timerIntervalsRef.current.clear();
    };
  }, []);

  // Overlay management
  const addOverlay = useCallback((overlay: Omit<Overlay, "id">) => {
    const newOverlay: Overlay = {
      ...overlay,
      id: `overlay_${Date.now()}_${Math.random()}`,
    };
    setOverlays(prev => [...prev, newOverlay]);
    return newOverlay;
  }, []);

  const updateOverlay = useCallback((overlayId: string, updates: Partial<Overlay>) => {
    setOverlays(prev => prev.map(overlay =>
      overlay.id === overlayId ? { ...overlay, ...updates } : overlay
    ));
  }, []);

  const deleteOverlay = useCallback((overlayId: string) => {
    setOverlays(prev => prev.filter(overlay => overlay.id !== overlayId));
    const interval = timerIntervalsRef.current.get(overlayId);
    if (interval) {
      clearInterval(interval);
      timerIntervalsRef.current.delete(overlayId);
    }
  }, []);

  const duplicateOverlay = useCallback((overlayId: string) => {
    const overlay = overlaysRef.current.find(o => o.id === overlayId);
    if (!overlay) return;
    const newOverlay = {
      ...overlay,
      id: `overlay_${Date.now()}_${Math.random()}`,
      x: overlay.x + 20,
      y: overlay.y + 20,
    };
    setOverlays(prev => [...prev, newOverlay]);
    return newOverlay;
  }, []);

  // Verse overlay
  const addVerseOverlay = useCallback((verseData: Overlay["verseData"], position = { x: 50, y: 50 }) => {
    return addOverlay({
      type: "VERSE",
      name: `Verset ${verseData?.book} ${verseData?.chapter}:${verseData?.verseStart}`,
      content: verseData?.text || "",
      verseData,
      x: position.x,
      y: position.y,
      width: 400,
      height: 150,
      opacity: 1,
      isVisible: true,
      isLocked: false,
      zIndex: 100,
      rotation: 0,
      style: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        textColor: "#ffffff",
        fontSize: 16,
        fontFamily: "Arial",
        fontWeight: "normal",
        padding: 20,
        borderRadius: 8,
      },
    });
  }, [addOverlay]);

  // Announcement overlay
  const addAnnouncementOverlay = useCallback((content: string, position = { x: 50, y: 50 }) => {
    return addOverlay({
      type: "ANNOUNCEMENT",
      name: "Annonce",
      content,
      x: position.x,
      y: position.y,
      width: 500,
      height: 100,
      opacity: 1,
      isVisible: true,
      isLocked: false,
      zIndex: 100,
      rotation: 0,
      style: {
        backgroundColor: "rgba(59, 130, 246, 0.9)",
        textColor: "#ffffff",
        fontSize: 18,
        fontFamily: "Arial",
        fontWeight: "bold",
        padding: 15,
        borderRadius: 8,
      },
      animation: {
        type: "FADE_IN",
        duration: 500,
        delay: 0,
      },
    });
  }, [addOverlay]);

  // Lower third overlay
  const addLowerThirdOverlay = useCallback((title: string, subtitle?: string, position = { x: 0, y: 900 }) => {
    return addOverlay({
      type: "LOWER_THIRD",
      name: "Lower Third",
      content: `${title}${subtitle ? `\n${subtitle}` : ""}`,
      x: position.x,
      y: position.y,
      width: 600,
      height: 120,
      opacity: 1,
      isVisible: true,
      isLocked: false,
      zIndex: 100,
      rotation: 0,
      style: {
        backgroundColor: "linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)",
        textColor: "#ffffff",
        fontSize: 24,
        fontFamily: "Arial",
        fontWeight: "bold",
        padding: 20,
        borderRadius: 0,
      },
      animation: {
        type: "SLIDE_IN",
        duration: 300,
        delay: 0,
      },
    });
  }, [addOverlay]);

  // Timer overlay
  const addTimerOverlay = useCallback((duration: number, position = { x: 50, y: 50 }) => {
    return addOverlay({
      type: "TIMER",
      name: "Timer",
      content: formatTime(duration),
      x: position.x,
      y: position.y,
      width: 150,
      height: 80,
      opacity: 1,
      isVisible: true,
      isLocked: false,
      zIndex: 100,
      rotation: 0,
      style: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        textColor: "#ffffff",
        fontSize: 32,
        fontFamily: "monospace",
        fontWeight: "bold",
        padding: 15,
        borderRadius: 8,
      },
      timerData: {
        duration,
        currentTime: 0,
        isRunning: false,
      },
    });
  }, [addOverlay]);

  // Countdown overlay
  const addCountdownOverlay = useCallback((targetDate: Date, position = { x: 50, y: 50 }) => {
    return addOverlay({
      type: "COUNTDOWN",
      name: "Countdown",
      content: "",
      x: position.x,
      y: position.y,
      width: 200,
      height: 100,
      opacity: 1,
      isVisible: true,
      isLocked: false,
      zIndex: 100,
      rotation: 0,
      style: {
        backgroundColor: "rgba(220, 38, 38, 0.9)",
        textColor: "#ffffff",
        fontSize: 28,
        fontFamily: "monospace",
        fontWeight: "bold",
        padding: 15,
        borderRadius: 8,
      },
      countdownData: {
        targetDate,
        currentTime: 0,
      },
    });
  }, [addOverlay]);

  // Logo overlay
  const addLogoOverlay = useCallback((imageUrl: string, position = { x: 1700, y: 50 }) => {
    return addOverlay({
      type: "LOGO",
      name: "Logo",
      content: imageUrl,
      x: position.x,
      y: position.y,
      width: 150,
      height: 150,
      opacity: 1,
      isVisible: true,
      isLocked: false,
      zIndex: 100,
      rotation: 0,
    });
  }, [addOverlay]);

  // Banner overlay
  const addBannerOverlay = useCallback((content: string, position = { x: 0, y: 0 }) => {
    return addOverlay({
      type: "BANNER",
      name: "Banner",
      content,
      x: position.x,
      y: position.y,
      width: 1920,
      height: 60,
      opacity: 1,
      isVisible: true,
      isLocked: false,
      zIndex: 100,
      rotation: 0,
      style: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        textColor: "#ffffff",
        fontSize: 20,
        fontFamily: "Arial",
        fontWeight: "bold",
        padding: 15,
        borderRadius: 0,
      },
      animation: {
        type: "SLIDE_IN",
        duration: 300,
        delay: 0,
      },
    });
  }, [addOverlay]);

  // Timer control
  const startTimer = useCallback((overlayId: string) => {
    updateOverlay(overlayId, {
      timerData: {
        ...(overlays.find(o => o.id === overlayId)?.timerData || { duration: 60, currentTime: 0 }),
        isRunning: true,
      },
    });
  }, [overlays, updateOverlay]);

  const stopTimer = useCallback((overlayId: string) => {
    updateOverlay(overlayId, {
      timerData: {
        ...(overlays.find(o => o.id === overlayId)?.timerData || { duration: 60, currentTime: 0 }),
        isRunning: false,
      },
    });
  }, [overlays, updateOverlay]);

  const resetTimer = useCallback((overlayId: string) => {
    updateOverlay(overlayId, {
      timerData: {
        ...(overlays.find(o => o.id === overlayId)?.timerData || { duration: 60, currentTime: 0 }),
        currentTime: 0,
        isRunning: false,
      },
    });
  }, [overlays, updateOverlay]);

  // Drag and drop
  const startDrag = useCallback((overlayId: string, offsetX: number, offsetY: number) => {
    draggedOverlayRef.current = { overlayId, offsetX, offsetY };
  }, []);

  const onDrag = useCallback((deltaX: number, deltaY: number) => {
    if (!draggedOverlayRef.current) return;
    const { overlayId, offsetX, offsetY } = draggedOverlayRef.current;

    let newX = deltaX - offsetX;
    let newY = deltaY - offsetY;

    // Snap to grid
    if (config.snapToGrid) {
      newX = Math.round(newX / config.gridSize) * config.gridSize;
      newY = Math.round(newY / config.gridSize) * config.gridSize;
    }

    updateOverlay(overlayId, { x: newX, y: newY });
  }, [config.snapToGrid, config.gridSize, updateOverlay]);

  const endDrag = useCallback(() => {
    draggedOverlayRef.current = null;
  }, []);

  // Resize
  const startResize = useCallback((overlayId: string, handle: string, startX: number, startY: number, startWidth: number, startHeight: number) => {
    resizedOverlayRef.current = { overlayId, handle, startX, startY, startWidth, startHeight };
  }, []);

  const onResize = useCallback((deltaX: number, deltaY: number) => {
    if (!resizedOverlayRef.current) return;
    const { overlayId, handle, startX, startY, startWidth, startHeight } = resizedOverlayRef.current;

    let newWidth = startWidth;
    let newHeight = startHeight;

    if (handle.includes("e")) newWidth = startWidth + (deltaX - startX);
    if (handle.includes("w")) newWidth = startWidth - (deltaX - startX);
    if (handle.includes("s")) newHeight = startHeight + (deltaY - startY);
    if (handle.includes("n")) newHeight = startHeight - (deltaY - startY);

    // Snap to grid
    if (config.snapToGrid) {
      newWidth = Math.round(newWidth / config.gridSize) * config.gridSize;
      newHeight = Math.round(newHeight / config.gridSize) * config.gridSize;
    }

    // Minimum size
    newWidth = Math.max(50, newWidth);
    newHeight = Math.max(50, newHeight);

    updateOverlay(overlayId, { width: newWidth, height: newHeight });
  }, [config.snapToGrid, config.gridSize, updateOverlay]);

  const endResize = useCallback(() => {
    resizedOverlayRef.current = null;
  }, []);

  // Visibility
  const toggleVisibility = useCallback((overlayId: string) => {
    const overlay = overlays.find(o => o.id === overlayId);
    if (!overlay) return;
    updateOverlay(overlayId, { isVisible: !overlay.isVisible });
  }, [overlays, updateOverlay]);

  // Lock
  const toggleLock = useCallback((overlayId: string) => {
    const overlay = overlays.find(o => o.id === overlayId);
    if (!overlay) return;
    updateOverlay(overlayId, { isLocked: !overlay.isLocked });
  }, [overlays, updateOverlay]);

  // Z-index
  const bringToFront = useCallback((overlayId: string) => {
    const maxZIndex = Math.max(...overlays.map(o => o.zIndex), 0);
    updateOverlay(overlayId, { zIndex: maxZIndex + 1 });
  }, [overlays, updateOverlay]);

  const sendToBack = useCallback((overlayId: string) => {
    const minZIndex = Math.min(...overlays.map(o => o.zIndex), 0);
    updateOverlay(overlayId, { zIndex: minZIndex - 1 });
  }, [overlays, updateOverlay]);

  // Config
  const updateConfig = useCallback((updates: Partial<OverlayEngineConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Helper function to format time
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return {
    // State
    overlays,
    config,

    // Overlay management
    addOverlay,
    updateOverlay,
    deleteOverlay,
    duplicateOverlay,

    // Preset overlays
    addVerseOverlay,
    addAnnouncementOverlay,
    addLowerThirdOverlay,
    addTimerOverlay,
    addCountdownOverlay,
    addLogoOverlay,
    addBannerOverlay,

    // Timer control
    startTimer,
    stopTimer,
    resetTimer,

    // Drag and drop
    startDrag,
    onDrag,
    endDrag,

    // Resize
    startResize,
    onResize,
    endResize,

    // Visibility/Lock
    toggleVisibility,
    toggleLock,

    // Z-index
    bringToFront,
    sendToBack,

    // Config
    updateConfig,
  };
}
