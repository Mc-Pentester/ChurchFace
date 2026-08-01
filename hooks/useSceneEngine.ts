"use client";

import { useState, useCallback, useRef } from "react";

export interface SceneSource {
  id: string;
  type: "CAMERA" | "SCREEN" | "IMAGE" | "VIDEO" | "PLAYLIST" | "TEXT" | "LOGO" | "BROWSER" | "AUDIO" | "TIMER" | "VERSE" | "LOWER_THIRD" | "CHAT" | "COUNTER";
  name: string;
  url?: string;
  settings?: any;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  isVisible: boolean;
  isLocked: boolean;
  volume: number;
  muted: boolean;
}

export interface Scene {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  sources: SceneSource[];
  transition?: {
    type: "CUT" | "FADE" | "DISSOLVE" | "SLIDE" | "ZOOM" | "WIPE";
    duration: number;
  };
}

export interface SceneEngineConfig {
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export function useSceneEngine(initialConfig?: Partial<SceneEngineConfig>) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [config, setConfig] = useState<SceneEngineConfig>({
    gridSize: 20,
    snapToGrid: true,
    showGrid: true,
    canvasWidth: 1920,
    canvasHeight: 1080,
    ...initialConfig,
  });

  const draggedSourceRef = useRef<{ sourceId: string; offsetX: number; offsetY: number } | null>(null);
  const resizedSourceRef = useRef<{ sourceId: string; handle: string; startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);
  const sceneOrderRef = useRef(0);

  const activeScene = scenes.find(s => s.id === activeSceneId);

  // Scene management
  const createScene = useCallback((name: string, description?: string) => {
    const newScene: Scene = {
      id: `scene_${Date.now()}`,
      name,
      description,
      order: sceneOrderRef.current++,
      isActive: false,
      sources: [],
      transition: { type: "CUT", duration: 500 },
    };
    setScenes(prev => [...prev, newScene]);
    return newScene;
  }, []);

  const updateScene = useCallback((sceneId: string, updates: Partial<Scene>) => {
    setScenes(prev => prev.map(scene => 
      scene.id === sceneId ? { ...scene, ...updates } : scene
    ));
  }, []);

  const deleteScene = useCallback((sceneId: string) => {
    setScenes(prev => prev.filter(scene => scene.id !== sceneId));
    if (activeSceneId === sceneId) {
      setActiveSceneId(null);
    }
  }, [activeSceneId]);

  const setActiveScene = useCallback((sceneId: string) => {
    setScenes(prev => prev.map(scene => ({
      ...scene,
      isActive: scene.id === sceneId,
    })));
    setActiveSceneId(sceneId);
  }, []);

  const reorderScenes = useCallback((fromIndex: number, toIndex: number) => {
    setScenes(prev => {
      const newScenes = [...prev];
      const [movedScene] = newScenes.splice(fromIndex, 1);
      newScenes.splice(toIndex, 0, movedScene);
      return newScenes.map((scene, index) => ({ ...scene, order: index }));
    });
  }, []);

  // Source management
  const addSource = useCallback((sceneId: string, source: Omit<SceneSource, "id">) => {
    const newSource: SceneSource = {
      ...source,
      id: `source_${Date.now()}_${Math.random()}`,
    };
    setScenes(prev => prev.map(scene =>
      scene.id === sceneId
        ? { ...scene, sources: [...scene.sources, newSource] }
        : scene
    ));
    return newSource;
  }, []);

  const updateSource = useCallback((sceneId: string, sourceId: string, updates: Partial<SceneSource>) => {
    setScenes(prev => prev.map(scene =>
      scene.id === sceneId
        ? {
            ...scene,
            sources: scene.sources.map(source =>
              source.id === sourceId ? { ...source, ...updates } : source
            ),
          }
        : scene
    ));
  }, []);

  const deleteSource = useCallback((sceneId: string, sourceId: string) => {
    setScenes(prev => prev.map(scene =>
      scene.id === sceneId
        ? { ...scene, sources: scene.sources.filter(s => s.id !== sourceId) }
        : scene
    ));
  }, []);

  const duplicateSource = useCallback((sceneId: string, sourceId: string) => {
    setScenes(prev => prev.map(scene => {
      if (scene.id !== sceneId) return scene;
      const source = scene.sources.find(s => s.id === sourceId);
      if (!source) return scene;
      const newSource = {
        ...source,
        id: `source_${Date.now()}_${Math.random()}`,
        x: source.x + 20,
        y: source.y + 20,
      };
      return { ...scene, sources: [...scene.sources, newSource] };
    }));
  }, []);

  // Drag and drop
  const startDrag = useCallback((sourceId: string, offsetX: number, offsetY: number) => {
    draggedSourceRef.current = { sourceId, offsetX, offsetY };
  }, []);

  const onDrag = useCallback((deltaX: number, deltaY: number) => {
    if (!draggedSourceRef.current || !activeSceneId) return;
    const { sourceId, offsetX, offsetY } = draggedSourceRef.current;
    
    let newX = deltaX - offsetX;
    let newY = deltaY - offsetY;

    // Snap to grid
    if (config.snapToGrid) {
      newX = Math.round(newX / config.gridSize) * config.gridSize;
      newY = Math.round(newY / config.gridSize) * config.gridSize;
    }

    updateSource(activeSceneId, sourceId, { x: newX, y: newY });
  }, [activeSceneId, config.snapToGrid, config.gridSize, updateSource]);

  const endDrag = useCallback(() => {
    draggedSourceRef.current = null;
  }, []);

  // Resize
  const startResize = useCallback((sourceId: string, handle: string, startX: number, startY: number, startWidth: number, startHeight: number) => {
    resizedSourceRef.current = { sourceId, handle, startX, startY, startWidth, startHeight };
  }, []);

  const onResize = useCallback((deltaX: number, deltaY: number) => {
    if (!resizedSourceRef.current || !activeSceneId) return;
    const { sourceId, handle, startX, startY, startWidth, startHeight } = resizedSourceRef.current;

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

    updateSource(activeSceneId, sourceId, { width: newWidth, height: newHeight });
  }, [activeSceneId, config.snapToGrid, config.gridSize, updateSource]);

  const endResize = useCallback(() => {
    resizedSourceRef.current = null;
  }, []);

  // Alignment
  const alignSource = useCallback((sceneId: string, sourceId: string, alignment: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;
    const source = scene.sources.find(s => s.id === sourceId);
    if (!source) return;

    let newX = source.x;
    let newY = source.y;

    switch (alignment) {
      case "left":
        newX = 0;
        break;
      case "center":
        newX = (config.canvasWidth - source.width) / 2;
        break;
      case "right":
        newX = config.canvasWidth - source.width;
        break;
      case "top":
        newY = 0;
        break;
      case "middle":
        newY = (config.canvasHeight - source.height) / 2;
        break;
      case "bottom":
        newY = config.canvasHeight - source.height;
        break;
    }

    updateSource(sceneId, sourceId, { x: newX, y: newY });
  }, [scenes, config.canvasWidth, config.canvasHeight, updateSource]);

  // Z-index management
  const bringToFront = useCallback((sceneId: string, sourceId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;
    const maxZIndex = Math.max(...scene.sources.map(s => s.zIndex), 0);
    updateSource(sceneId, sourceId, { zIndex: maxZIndex + 1 });
  }, [scenes, updateSource]);

  const sendToBack = useCallback((sceneId: string, sourceId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;
    const minZIndex = Math.min(...scene.sources.map(s => s.zIndex), 0);
    updateSource(sceneId, sourceId, { zIndex: minZIndex - 1 });
  }, [scenes, updateSource]);

  // Lock/Unlock
  const toggleLock = useCallback((sceneId: string, sourceId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;
    const source = scene.sources.find(s => s.id === sourceId);
    if (!source) return;
    updateSource(sceneId, sourceId, { isLocked: !source.isLocked });
  }, [scenes, updateSource]);

  // Visibility
  const toggleVisibility = useCallback((sceneId: string, sourceId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) return;
    const source = scene.sources.find(s => s.id === sourceId);
    if (!source) return;
    updateSource(sceneId, sourceId, { isVisible: !source.isVisible });
  }, [scenes, updateSource]);

  // Config management
  const updateConfig = useCallback((updates: Partial<SceneEngineConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    // State
    scenes,
    activeScene,
    activeSceneId,
    config,
    
    // Scene operations
    createScene,
    updateScene,
    deleteScene,
    setActiveScene,
    reorderScenes,
    
    // Source operations
    addSource,
    updateSource,
    deleteSource,
    duplicateSource,
    
    // Drag and drop
    startDrag,
    onDrag,
    endDrag,
    
    // Resize
    startResize,
    onResize,
    endResize,
    
    // Alignment
    alignSource,
    
    // Z-index
    bringToFront,
    sendToBack,
    
    // Lock/Visibility
    toggleLock,
    toggleVisibility,
    
    // Config
    updateConfig,
  };
}
