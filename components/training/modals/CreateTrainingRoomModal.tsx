"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface CreateTrainingRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    title: string;
    description: string;
    roomType: "VIDEO" | "AUDIO" | "TEXT";
    isPublic: boolean;
    maxParticipants: number | null;
    scheduledStart: string | null;
    scheduledEnd: string | null;
  }) => void;
}

export function CreateTrainingRoomModal({ isOpen, onClose, onCreate }: CreateTrainingRoomModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    roomType: "VIDEO" as "VIDEO" | "AUDIO" | "TEXT",
    isPublic: true,
    maxParticipants: null as number | null,
    scheduledStart: "",
    scheduledEnd: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      title: formData.title,
      description: formData.description,
      roomType: formData.roomType,
      isPublic: formData.isPublic,
      maxParticipants: formData.maxParticipants,
      scheduledStart: formData.scheduledStart || null,
      scheduledEnd: formData.scheduledEnd || null,
    });
    onClose();
    setFormData({
      title: "",
      description: "",
      roomType: "VIDEO",
      isPublic: true,
      maxParticipants: null,
      scheduledStart: "",
      scheduledEnd: "",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Créer une formation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Titre de la formation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Description de la formation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de formation *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["VIDEO", "AUDIO", "TEXT"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, roomType: type as any })}
                  className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                    formData.roomType === type
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {type === "VIDEO" ? "🎥 Vidéo" : type === "AUDIO" ? "🎙️ Audio" : "📝 Texte"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibilité
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPublic: true })}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                  formData.isPublic
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                🌐 Public
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPublic: false })}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                  !formData.isPublic
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                🔒 Privé
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participants maximum (optionnel)
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxParticipants || ""}
              onChange={(e) => setFormData({
                ...formData,
                maxParticipants: e.target.value ? parseInt(e.target.value) : null
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Laisser vide pour illimité"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Début programmé (optionnel)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledStart}
                onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fin programmée (optionnel)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledEnd}
                onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
