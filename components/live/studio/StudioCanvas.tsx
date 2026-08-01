"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { GripVertical, RotateCw, Trash2, Lock } from "lucide-react";

interface CanvasSource {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  isVisible: boolean;
  isLocked: boolean;
}

interface StudioCanvasProps {
  sources: CanvasSource[];
  onSourceUpdate: (sourceId: string, updates: Partial<CanvasSource>) => void;
  onSourceDelete: (sourceId: string) => void;
  stream?: MediaStream | null;
}

export default function StudioCanvas({
  sources,
  onSourceUpdate,
  onSourceDelete,
  stream,
}: StudioCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  // Handle video stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Cancel any pending play request
    if (playPromiseRef.current) {
      playPromiseRef.current.catch(() => {});
      playPromiseRef.current = null;
    }

    if (stream) {
      video.srcObject = stream;
      playPromiseRef.current = video.play().catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Video play error:', error);
        }
      });
    } else {
      video.srcObject = null;
    }

    return () => {
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {});
      }
      if (video.srcObject) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, [stream]);

  const visibleSources = sources.filter(s => s.isVisible).sort((a, b) => a.zIndex - b.zIndex);

  // Handle mouse down on source
  const handleSourceMouseDown = useCallback((e: React.MouseEvent, source: CanvasSource) => {
    if (source.isLocked) return;
    
    e.stopPropagation();
    setSelectedSource(source.id);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: e.clientX - rect.left - source.x,
      y: e.clientY - rect.top - source.y,
    });
    setIsDragging(true);
  }, []);

  // Handle mouse down on resize handle
  const handleResizeMouseDown = useCallback((e: React.MouseEvent, sourceId: string, handle: string) => {
    e.stopPropagation();
    setSelectedSource(sourceId);
    setResizeHandle(handle);
    setIsResizing(true);
  }, []);

  // Handle mouse down on rotate handle
  const handleRotateMouseDown = useCallback((e: React.MouseEvent, sourceId: string) => {
    e.stopPropagation();
    setSelectedSource(sourceId);
    setIsRotating(true);
  }, []);

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (isDragging && selectedSource) {
        const source = sources.find(s => s.id === selectedSource);
        if (source) {
          onSourceUpdate(selectedSource, {
            x: Math.max(0, Math.min(rect.width - source.width, x - dragOffset.x)),
            y: Math.max(0, Math.min(rect.height - source.height, y - dragOffset.y)),
          });
        }
      }

      if (isResizing && selectedSource && resizeHandle) {
        const source = sources.find(s => s.id === selectedSource);
        if (source) {
          let updates: Partial<CanvasSource> = {};

          switch (resizeHandle) {
            case 'se':
              updates.width = Math.max(50, x - source.x);
              updates.height = Math.max(50, y - source.y);
              break;
            case 'sw':
              updates.width = Math.max(50, source.x + source.width - x);
              updates.x = x;
              updates.height = Math.max(50, y - source.y);
              break;
            case 'ne':
              updates.width = Math.max(50, x - source.x);
              updates.height = Math.max(50, source.y + source.height - y);
              updates.y = y;
              break;
            case 'nw':
              updates.width = Math.max(50, source.x + source.width - x);
              updates.x = x;
              updates.height = Math.max(50, source.y + source.height - y);
              updates.y = y;
              break;
          }

          onSourceUpdate(selectedSource, updates);
        }
      }

      if (isRotating && selectedSource) {
        const source = sources.find(s => s.id === selectedSource);
        if (source) {
          const centerX = source.x + source.width / 2;
          const centerY = source.y + source.height / 2;
          const angle = Math.atan2(y - centerY, x - centerX);
          const degrees = (angle * 180) / Math.PI + 90;
          onSourceUpdate(selectedSource, { rotation: degrees });
        }
      }
    };

    if (isDragging || isResizing || isRotating) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, isResizing, isRotating, selectedSource, resizeHandle, dragOffset, sources, onSourceUpdate]);

  // Handle mouse up
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
      setResizeHandle(null);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedSource(null);
    }
  }, []);

  // Handle delete
  const handleDelete = useCallback((sourceId: string) => {
    onSourceDelete(sourceId);
    setSelectedSource(null);
  }, [onSourceDelete]);

  // Handle lock toggle
  const handleLockToggle = useCallback((sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    if (source) {
      onSourceUpdate(sourceId, { isLocked: !source.isLocked });
    }
  }, [sources, onSourceUpdate]);

  // Handle bring to front
  const handleBringToFront = useCallback((sourceId: string) => {
    const maxZIndex = Math.max(...sources.map(s => s.zIndex));
    onSourceUpdate(sourceId, { zIndex: maxZIndex + 1 });
  }, [sources, onSourceUpdate]);

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-[#0a0a0f] overflow-hidden"
      onClick={handleCanvasClick}
    >
      {/* Grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(to right, #333 1px, transparent 1px),
            linear-gradient(to bottom, #333 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Stream background */}
      {stream && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          muted
          playsInline
        />
      )}

      {/* Sources */}
      {visibleSources.map((source) => {
        const isSelected = selectedSource === source.id;
        
        return (
          <div
            key={source.id}
            className={`absolute cursor-move ${isSelected ? 'ring-2 ring-violet-500' : ''}`}
            style={{
              left: source.x,
              top: source.y,
              width: source.width,
              height: source.height,
              transform: `rotate(${source.rotation}deg)`,
              zIndex: source.zIndex,
            }}
            onMouseDown={(e) => handleSourceMouseDown(e, source)}
          >
            {/* Source content placeholder */}
            <div className="w-full h-full bg-[#16161f] border border-gray-700 rounded flex items-center justify-center">
              <span className="text-gray-400 text-sm">{source.name}</span>
            </div>

            {/* Selection controls */}
            {isSelected && !source.isLocked && (
              <>
                {/* Resize handles */}
                <div
                  className="absolute -top-1 -left-1 w-3 h-3 bg-violet-500 rounded-full cursor-nwse-resize"
                  onMouseDown={(e) => handleResizeMouseDown(e, source.id, 'nw')}
                />
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full cursor-nesw-resize"
                  onMouseDown={(e) => handleResizeMouseDown(e, source.id, 'ne')}
                />
                <div
                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-violet-500 rounded-full cursor-nesw-resize"
                  onMouseDown={(e) => handleResizeMouseDown(e, source.id, 'sw')}
                />
                <div
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-violet-500 rounded-full cursor-nwse-resize"
                  onMouseDown={(e) => handleResizeMouseDown(e, source.id, 'se')}
                />

                {/* Rotate handle */}
                <div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 bg-violet-500 rounded-full p-1 cursor-pointer"
                  onMouseDown={(e) => handleRotateMouseDown(e, source.id)}
                >
                  <RotateCw size={12} className="text-white" />
                </div>

                {/* Action buttons */}
                <div className="absolute -top-8 right-0 flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleBringToFront(source.id); }}
                    className="bg-gray-700 hover:bg-gray-600 rounded p-1"
                    title="Bring to front"
                  >
                    <GripVertical size={12} className="text-white" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleLockToggle(source.id); }}
                    className="bg-gray-700 hover:bg-gray-600 rounded p-1"
                    title="Lock/Unlock"
                  >
                    <Lock size={12} className="text-white" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(source.id); }}
                    className="bg-red-600 hover:bg-red-700 rounded p-1"
                    title="Delete"
                  >
                    <Trash2 size={12} className="text-white" />
                  </button>
                </div>
              </>
            )}

            {/* Locked indicator */}
            {source.isLocked && (
              <div className="absolute top-2 right-2 bg-gray-700 rounded-full p-1">
                <Lock size={12} className="text-gray-400" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
