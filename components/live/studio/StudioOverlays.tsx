"use client";

import { useState } from "react";
import { Type, Image, Clock, Layers, Plus, Trash2, Eye, EyeOff, Lock, Unlock } from "lucide-react";

interface Overlay {
  id: string;
  type: "TEXT" | "IMAGE" | "TIMER" | "LOGO";
  name: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  opacity?: number;
  zIndex: number;
  isVisible: boolean;
  isLocked: boolean;
}

interface StudioOverlaysProps {
  overlays: Overlay[];
  onOverlayAdd: (overlay: Overlay) => void;
  onOverlayUpdate: (overlayId: string, updates: Partial<Overlay>) => void;
  onOverlayDelete: (overlayId: string) => void;
}

export default function StudioOverlays({
  overlays,
  onOverlayAdd,
  onOverlayUpdate,
  onOverlayDelete,
}: StudioOverlaysProps) {
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleAddOverlay = (type: Overlay["type"]) => {
    const newOverlay: Overlay = {
      id: Date.now().toString(),
      type,
      name: `Overlay ${type.toLowerCase()}`,
      content: type === "TEXT" ? "Votre texte ici" : "",
      x: 50,
      y: 50,
      width: type === "TEXT" ? 300 : 200,
      height: type === "TEXT" ? 100 : 200,
      fontSize: 24,
      fontFamily: "Arial",
      color: "#ffffff",
      backgroundColor: "transparent",
      opacity: 100,
      zIndex: overlays.length + 1,
      isVisible: true,
      isLocked: false,
    };

    onOverlayAdd(newOverlay);
    setShowAddMenu(false);
    setSelectedOverlay(newOverlay.id);
  };

  const handleToggleVisibility = (overlayId: string) => {
    const overlay = overlays.find(o => o.id === overlayId);
    if (overlay) {
      onOverlayUpdate(overlayId, { isVisible: !overlay.isVisible });
    }
  };

  const handleToggleLock = (overlayId: string) => {
    const overlay = overlays.find(o => o.id === overlayId);
    if (overlay) {
      onOverlayUpdate(overlayId, { isLocked: !overlay.isLocked });
    }
  };

  const getOverlayIcon = (type: Overlay["type"]) => {
    switch (type) {
      case "TEXT":
        return Type;
      case "IMAGE":
        return Image;
      case "TIMER":
        return Clock;
      case "LOGO":
        return Layers;
      default:
        return Layers;
    }
  };

  return (
    <div className="bg-[#16161f] rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Overlays</h3>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
          >
            <Plus size={14} />
            <span>Ajouter</span>
          </button>

          {showAddMenu && (
            <div className="absolute right-0 top-full mt-2 bg-[#252535] border border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
              <button
                onClick={() => handleAddOverlay("TEXT")}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-300 hover:bg-[#353545] text-sm"
              >
                <Type size={14} />
                <span>Texte</span>
              </button>
              <button
                onClick={() => handleAddOverlay("IMAGE")}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-300 hover:bg-[#353545] text-sm"
              >
                <Image size={14} />
                <span>Image</span>
              </button>
              <button
                onClick={() => handleAddOverlay("TIMER")}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-300 hover:bg-[#353545] text-sm"
              >
                <Clock size={14} />
                <span>Timer</span>
              </button>
              <button
                onClick={() => handleAddOverlay("LOGO")}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-300 hover:bg-[#353545] text-sm"
              >
                <Layers size={14} />
                <span>Logo</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {overlays.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Aucun overlay. Ajoutez-en un pour commencer.
          </div>
        ) : (
          overlays.map((overlay) => {
            const Icon = getOverlayIcon(overlay.type);
            const isSelected = selectedOverlay === overlay.id;

            return (
              <div
                key={overlay.id}
                className={`bg-[#252535] rounded-lg p-3 cursor-pointer transition ${
                  isSelected ? "ring-2 ring-violet-500" : "hover:bg-[#353545]"
                }`}
                onClick={() => setSelectedOverlay(isSelected ? null : overlay.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-600/20 rounded-lg flex items-center justify-center">
                    <Icon size={18} className="text-violet-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{overlay.name}</p>
                    <p className="text-gray-500 text-xs capitalize">{overlay.type}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(overlay.id);
                      }}
                      className={`p-1.5 rounded transition ${
                        overlay.isVisible
                          ? "bg-emerald-600/20 text-emerald-400"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {overlay.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLock(overlay.id);
                      }}
                      className={`p-1.5 rounded transition ${
                        overlay.isLocked
                          ? "bg-yellow-600/20 text-yellow-400"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {overlay.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOverlayDelete(overlay.id);
                      }}
                      className="p-1.5 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Nom</label>
                      <input
                        type="text"
                        value={overlay.name}
                        onChange={(e) => onOverlayUpdate(overlay.id, { name: e.target.value })}
                        className="w-full bg-[#16161f] text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>

                    {overlay.type === "TEXT" && (
                      <>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Contenu</label>
                          <textarea
                            value={overlay.content}
                            onChange={(e) => onOverlayUpdate(overlay.id, { content: e.target.value })}
                            className="w-full bg-[#16161f] text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-gray-400 text-xs block mb-1">Taille</label>
                            <input
                              type="number"
                              value={overlay.fontSize}
                              onChange={(e) => onOverlayUpdate(overlay.id, { fontSize: Number(e.target.value) })}
                              className="w-full bg-[#16161f] text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 text-xs block mb-1">Couleur</label>
                            <input
                              type="color"
                              value={overlay.color}
                              onChange={(e) => onOverlayUpdate(overlay.id, { color: e.target.value })}
                              className="w-full h-8 bg-[#16161f] rounded cursor-pointer"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Position X</label>
                        <input
                          type="number"
                          value={overlay.x}
                          onChange={(e) => onOverlayUpdate(overlay.id, { x: Number(e.target.value) })}
                          className="w-full bg-[#16161f] text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">Position Y</label>
                        <input
                          type="number"
                          value={overlay.y}
                          onChange={(e) => onOverlayUpdate(overlay.id, { y: Number(e.target.value) })}
                          className="w-full bg-[#16161f] text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Opacité ({overlay.opacity}%)</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={overlay.opacity}
                        onChange={(e) => onOverlayUpdate(overlay.id, { opacity: Number(e.target.value) })}
                        className="w-full accent-violet-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
