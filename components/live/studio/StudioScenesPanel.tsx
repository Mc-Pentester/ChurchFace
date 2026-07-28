"use client";

import { useState } from "react";
import { Plus, GripVertical, Trash2, Edit2 } from "lucide-react";

interface StudioScene {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
}

interface StudioScenesPanelProps {
  scenes: StudioScene[];
  onSceneSelect: (sceneId: string) => void;
  onSceneAdd: () => void;
  onSceneDelete: (sceneId: string) => void;
  onSceneRename: (sceneId: string, name: string) => void;
  onSceneReorder: (fromIndex: number, toIndex: number) => void;
}

export default function StudioScenesPanel({
  scenes,
  onSceneSelect,
  onSceneAdd,
  onSceneDelete,
  onSceneRename,
  onSceneReorder,
}: StudioScenesPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleStartEdit = (scene: StudioScene) => {
    setEditingId(scene.id);
    setEditName(scene.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      onSceneRename(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const sortedScenes = [...scenes].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-[#16161f] rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Scènes</h3>
        <button
          onClick={onSceneAdd}
          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-white transition"
          aria-label="Add Scene"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {sortedScenes.map((scene, index) => (
          <div
            key={scene.id}
            className={`group relative bg-[#252535] rounded-lg p-3 border-2 transition cursor-pointer ${
              scene.isActive ? "border-emerald-500" : "border-transparent hover:border-gray-600"
            }`}
            onClick={() => onSceneSelect(scene.id)}
          >
            <div className="flex items-center gap-2">
              <button
                className="text-gray-500 hover:text-gray-300 cursor-grab"
                aria-label="Drag to reorder"
                onMouseDown={(e) => {
                  // Simple drag implementation - can be enhanced with dnd-kit
                  e.preventDefault();
                }}
              >
                <GripVertical size={14} />
              </button>

              {editingId === scene.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleSaveEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-gray-700 text-white text-sm px-2 py-1 rounded outline-none"
                  autoFocus
                />
              ) : (
                <div className="flex-1">
                  <p className="text-white text-sm font-medium truncate">{scene.name}</p>
                  {scene.description && (
                    <p className="text-gray-400 text-xs truncate">{scene.description}</p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                {editingId !== scene.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(scene);
                    }}
                    className="p-1 text-gray-400 hover:text-white transition"
                    aria-label="Rename Scene"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSceneDelete(scene.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-400 transition"
                  aria-label="Delete Scene"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {scene.isActive && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </div>
        ))}

        {sortedScenes.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-3xl mb-2">🎬</div>
            <p className="text-sm">Aucune scène</p>
            <p className="text-xs mt-1">Créez votre première scène</p>
          </div>
        )}
      </div>
    </div>
  );
}
