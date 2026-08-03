"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type StudioPanelId = 
  | "scenes"
  | "sources"
  | "preview"
  | "program"
  | "audio"
  | "chat"
  | "stats"
  | "controls"
  | "transitions"
  | "media"
  | "overlays"
  | "guests"
  | "playlist";

export interface StudioPanel {
  id: StudioPanelId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW: number;
  minH: number;
  isResizable: boolean;
  isDraggable: boolean;
  isVisible: boolean;
  isCollapsed: boolean;
  zIndex: number;
}

export interface StudioLayout {
  panels: StudioPanel[];
  mode: "RADIO" | "VIDEO";
}

const DEFAULT_VIDEO_LAYOUT: StudioLayout = {
  mode: "VIDEO",
  panels: [
    {
      id: "scenes",
      title: "Scènes",
      x: 0,
      y: 0,
      w: 3,
      h: 8,
      minW: 2,
      minH: 4,
      isResizable: true,
      isDraggable: true,
      isVisible: true,
      isCollapsed: false,
      zIndex: 1,
    },
    {
      id: "sources",
      title: "Sources",
      x: 3,
      y: 0,
      w: 3,
      h: 8,
      minW: 2,
      minH: 4,
      isResizable: true,
      isDraggable: true,
      isVisible: true,
      isCollapsed: false,
      zIndex: 1,
    },
    {
      id: "preview",
      title: "Preview",
      x: 6,
      y: 0,
      w: 6,
      h: 6,
      minW: 4,
      minH: 4,
      isResizable: true,
      isDraggable: true,
      isVisible: true,
      isCollapsed: false,
      zIndex: 1,
    },
    {
      id: "program",
      title: "Program",
      x: 12,
      y: 0,
      w: 6,
      h: 6,
      minW: 4,
      minH: 4,
      isResizable: true,
      isDraggable: true,
      isVisible: true,
      isCollapsed: false,
      zIndex: 1,
    },
    {
      id: "chat",
      title: "Chat",
      x: 18,
      y: 0,
      w: 4,
      h: 8,
      minW: 3,
      minH: 4,
      isResizable: true,
      isDraggable: true,
      isVisible: true,
      isCollapsed: false,
      zIndex: 1,
    },
    {
      id: "stats",
      title: "Statistiques",
      x: 22,
      y: 0,
      w: 4,
      h: 4,
      minW: 3,
      minH: 3,
      isResizable: true,
      isDraggable: true,
      isVisible: true,
      isCollapsed: false,
      zIndex: 1,
    },
    {
      id: "audio",
      title: "Audio Mixer",
      x: 0,
      y: 8,
      w: 12,
      h: 4,
      minW: 8,
      minH: 3,
      isResizable: true,
      isDraggable: true,
      isVisible: true,
      isCollapsed: false,
      zIndex: 1,
    },
    {
      id: "controls",
      title: "Contrôles",
      x: 12,
      y: 6,
      w: 6,
      h: 2,
      minW: 4,
      minH: 2,
      isResizable: true,
      isDraggable: true,
      isVisible: true,
      isCollapsed: false,
      zIndex: 1,
    },
    {
      id: "transitions",
      title: "Transitions",
      x: 12,
      y: 8,
      w: 6,
      h: 2,
      minW: 4,
      minH: 2,
      isResizable: true,
      isDraggable: true,
      isVisible: true,
      isCollapsed: false,
      zIndex: 1,
    },
  ],
};

const DEFAULT_RADIO_LAYOUT: StudioLayout = {
  mode: "RADIO",
  panels: [
    {
      id: "playlist",
      title: "Playlist",
      x: 0,
      y: 0,
      w: 6,
      h: 8,
      minW: 4,
      minH: 4,
      isResizable: true,
      isDraggable: true,
      isVisible: true,
      isCollapsed: false,
      zIndex: 1,
    },
    {
      id: "sources",
      title: "Sources Audio",
      x: 6,
      y: 0,
      w: 6,
      h: 8,
      minW: 4,
      minH: 4,
      isResizable: true,
      isDraggable: true,
      isVisible: true,
      isCollapsed: false,
      zIndex: 1,
    },
    {
      id: "audio",
      title: "Audio Mixer",
      x: 0,
      y: 8,
      w: 12,
      h: 6,
      minW: 8,
      minH: 4,
      isResizable: true,
      isDraggable: true,
      isVisible: true,
      isCollapsed: false,
      zIndex: 1,
    },
    {
      id: "chat",
      title: "Chat",
      x: 12,
      y: 0,
      w: 4,
      h: 8,
      minW: 3,
      minH: 4,
      isResizable: true,
      isDraggable: true,
      isVisible: true,
      isCollapsed: false,
      zIndex: 1,
    },
    {
      id: "stats",
      title: "Statistiques",
      x: 16,
      y: 0,
      w: 4,
      h: 4,
      minW: 3,
      minH: 3,
      isResizable: true,
      isDraggable: true,
      isVisible: true,
      isCollapsed: false,
      zIndex: 1,
    },
    {
      id: "controls",
      title: "Contrôles",
      x: 12,
      y: 8,
      w: 8,
      h: 2,
      minW: 4,
      minH: 2,
      isResizable: true,
      isDraggable: true,
      isVisible: true,
      isCollapsed: false,
      zIndex: 1,
    },
  ],
};

export function useStudioLayout(contextId?: string, mode: "RADIO" | "VIDEO" = "VIDEO") {
  const [layout, setLayout] = useState<StudioLayout>(() => {
    // Try to load saved layout from localStorage
    if (typeof window !== "undefined" && contextId) {
      const saved = localStorage.getItem(`studio_layout_${contextId}_${mode}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Fall back to default
        }
      }
    }
    return mode === "RADIO" ? DEFAULT_RADIO_LAYOUT : DEFAULT_VIDEO_LAYOUT;
  });

  const layoutRef = useRef(layout);

  useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  // Save layout to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && contextId) {
      localStorage.setItem(`studio_layout_${contextId}_${mode}`, JSON.stringify(layout));
    }
  }, [layout, contextId, mode]);

  const updatePanel = useCallback((panelId: StudioPanelId, updates: Partial<StudioPanel>) => {
    setLayout(prev => ({
      ...prev,
      panels: prev.panels.map(panel =>
        panel.id === panelId ? { ...panel, ...updates } : panel
      ),
    }));
  }, []);

  const togglePanelVisibility = useCallback((panelId: StudioPanelId) => {
    setLayout(prev => ({
      ...prev,
      panels: prev.panels.map(panel =>
        panel.id === panelId ? { ...panel, isVisible: !panel.isVisible } : panel
      ),
    }));
  }, []);

  const togglePanelCollapsed = useCallback((panelId: StudioPanelId) => {
    setLayout(prev => ({
      ...prev,
      panels: prev.panels.map(panel =>
        panel.id === panelId ? { ...panel, isCollapsed: !panel.isCollapsed } : panel
      ),
    }));
  }, []);

  const resetLayout = useCallback(() => {
    setLayout(mode === "RADIO" ? DEFAULT_RADIO_LAYOUT : DEFAULT_VIDEO_LAYOUT);
  }, [mode]);

  const switchMode = useCallback((newMode: "RADIO" | "VIDEO") => {
    setLayout(newMode === "RADIO" ? DEFAULT_RADIO_LAYOUT : DEFAULT_VIDEO_LAYOUT);
  }, []);

  return {
    layout,
    updatePanel,
    togglePanelVisibility,
    togglePanelCollapsed,
    resetLayout,
    switchMode,
  };
}
