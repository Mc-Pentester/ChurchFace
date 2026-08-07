"use client";

import { useState } from "react";
import { Type, Image, Clock, Layers, Plus, Trash2, Eye, EyeOff, Lock, Unlock, BookOpen, Megaphone, Layout, MessageSquare, Timer as TimerIcon } from "lucide-react";
import { Overlay } from "@/hooks/useOverlayEngine";

interface StudioOverlaysProps {
  overlays: Overlay[];
  onOverlayAdd: (overlay: Omit<Overlay, "id">) => void;
  onOverlayUpdate: (overlayId: string, updates: Partial<Overlay>) => void;
  onOverlayDelete: (overlayId: string) => void;
}

const OVERLAY_TYPES = [
  { type: "VERSE" as const, label: "Verset", icon: BookOpen },
  { type: "ANNOUNCEMENT" as const, label: "Annonce", icon: Megaphone },
  { type: "LOWER_THIRD" as const, label: "Lower Third", icon: Layout },
  { type: "TITLE" as const, label: "Titre", icon: Type },
  { type: "LOGO" as const, label: "Logo", icon: Layers },
  { type: "TIMER" as const, label: "Timer", icon: Clock },
  { type: "COUNTDOWN" as const, label: "Countdown", icon: TimerIcon },
  { type: "BANNER" as const, label: "Bannière", icon: Layout },
  { type: "CHAT" as const, label: "Chat", icon: MessageSquare },
  { type: "CUSTOM" as const, label: "Custom", icon: Type },
];

export default function StudioOverlays({
  overlays,
  onOverlayAdd,
  onOverlayUpdate,
  onOverlayDelete,
}: StudioOverlaysProps) {
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleAddOverlay = (type: Overlay["type"]) => {
    const baseOverlay: Omit<Overlay, "id"> = {
      type,
      name: `Overlay ${type.toLowerCase()}`,
      content: type === "VERSE" ? "Ainsi la foi vient de ce qu'on entend, et ce qu'on entend vient de la parole de Christ." : "",
      x: 50,
      y: 50,
      width: 300,
      height: 100,
      opacity: 1,
      isVisible: true,
      isLocked: false,
      zIndex: overlays.length + 1,
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
    };

    onOverlayAdd(baseOverlay);
    setShowAddMenu(false);
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
    const overlayType = OVERLAY_TYPES.find(t => t.type === type);
    return overlayType?.icon || Layers;
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
            <div className="absolute right-0 top-full mt-2 bg-[#252535] border border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[150px] max-h-64 overflow-y-auto">
              {OVERLAY_TYPES.map((overlayType) => {
                const Icon = overlayType.icon;
                return (
                  <button
                    key={overlayType.type}
                    onClick={() => handleAddOverlay(overlayType.type)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-300 hover:bg-[#353545] text-sm"
                  >
                    <Icon size={14} />
                    <span>{overlayType.label}</span>
                  </button>
                );
              })}
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

                    <div>
                      <label className="text-gray-400 text-xs block mb-1">Contenu</label>
                      <textarea
                        value={overlay.content}
                        onChange={(e) => onOverlayUpdate(overlay.id, { content: e.target.value })}
                        className="w-full bg-[#16161f] text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                        rows={2}
                      />
                    </div>

                    {overlay.style && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Taille</label>
                          <input
                            type="number"
                            value={overlay.style.fontSize || 16}
                            onChange={(e) => onOverlayUpdate(overlay.id, { 
                              style: { ...overlay.style, fontSize: Number(e.target.value) }
                            })}
                            className="w-full bg-[#16161f] text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs block mb-1">Couleur</label>
                          <input
                            type="color"
                            value={overlay.style.textColor || "#ffffff"}
                            onChange={(e) => onOverlayUpdate(overlay.id, { 
                              style: { ...overlay.style, textColor: e.target.value }
                            })}
                            className="w-full h-8 bg-[#16161f] rounded cursor-pointer"
                          />
                        </div>
                      </div>
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
                      <label className="text-gray-400 text-xs block mb-1">Opacité ({Math.round(overlay.opacity * 100)}%)</label>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
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
