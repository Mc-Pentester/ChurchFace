"use client";

import { useState, useEffect } from "react";
import { X, Camera, Monitor, Image, Video, Music, Type, Globe, Upload, Mic } from "lucide-react";

interface StudioSourceSettingsProps {
  source: {
    id: string;
    type: "CAMERA" | "SCREEN" | "IMAGE" | "VIDEO" | "PLAYLIST" | "TEXT" | "LOGO" | "BROWSER" | "AUDIO";
    name: string;
    url?: string;
    settings?: any;
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  availableDevices?: {
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
  };
}

export default function StudioSourceSettings({ source, isOpen, onClose, onSave, availableDevices }: StudioSourceSettingsProps) {
  const [name, setName] = useState(source.name);
  const [url, setUrl] = useState(source.url || "");
  const [settings, setSettings] = useState(source.settings || {});
  const [selectedDeviceId, setSelectedDeviceId] = useState(source.settings?.deviceId || "");

  useEffect(() => {
    setName(source.name);
    setUrl(source.url || "");
    setSettings(source.settings || {});
    setSelectedDeviceId(source.settings?.deviceId || "");
  }, [source]);

  const handleSave = () => {
    onSave({
      name,
      url,
      settings: {
        ...settings,
        deviceId: selectedDeviceId,
      },
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#16161f] rounded-xl w-full max-w-md mx-4 border border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#252535] rounded-lg flex items-center justify-center">
              {source.type === "CAMERA" && <Camera size={20} className="text-emerald-400" />}
              {source.type === "TEXT" && <Type size={20} className="text-emerald-400" />}
              {source.type === "LOGO" && <Image size={20} className="text-emerald-400" />}
              {source.type === "BROWSER" && <Globe size={20} className="text-emerald-400" />}
              {source.type === "AUDIO" && <Music size={20} className="text-emerald-400" />}
            </div>
            <div>
              <h3 className="text-white font-semibold">Paramètres de source</h3>
              <p className="text-gray-400 text-sm">{source.type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#252535] rounded-lg transition"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#252535] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              placeholder="Nom de la source"
            />
          </div>

          {/* Device selection for CAMERA and AUDIO */}
          {(source.type === "CAMERA" || source.type === "AUDIO") && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                {source.type === "CAMERA" ? "Périphérique vidéo" : "Périphérique audio"}
              </label>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full bg-[#252535] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Sélectionner un périphérique</option>
                {(source.type === "CAMERA" ? availableDevices?.cameras : availableDevices?.microphones)?.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || device.deviceId}
                  </option>
                ))}
              </select>
              {(!availableDevices || (source.type === "CAMERA" ? availableDevices.cameras.length === 0 : availableDevices.microphones.length === 0)) && (
                <p className="text-gray-500 text-xs mt-1">Aucun périphérique détecté</p>
              )}
            </div>
          )}

          {/* URL for certain types */}
          {(source.type === "IMAGE" || source.type === "VIDEO" || source.type === "BROWSER") && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[#252535] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                placeholder="https://exemple.com/image.jpg"
              />
            </div>
          )}

          {/* File upload for IMAGE/VIDEO */}
          {(source.type === "IMAGE" || source.type === "VIDEO") && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Ou importer un fichier</label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-emerald-500 transition cursor-pointer">
                <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Cliquez pour importer</p>
                <p className="text-gray-500 text-xs mt-1">{source.type === "IMAGE" ? "JPG, PNG, GIF" : "MP4, WebM"}</p>
              </div>
            </div>
          )}

          {/* Text content for TEXT */}
          {source.type === "TEXT" && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Contenu du texte</label>
              <textarea
                value={settings.text || ""}
                onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                className="w-full bg-[#252535] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 min-h-[100px]"
                placeholder="Votre texte..."
              />
            </div>
          )}

          {/* Position settings */}
          {(source.type === "IMAGE" || source.type === "VIDEO" || source.type === "LOGO" || source.type === "TEXT") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Position X</label>
                <input
                  type="number"
                  value={settings.x || 0}
                  onChange={(e) => setSettings({ ...settings, x: parseInt(e.target.value) })}
                  className="w-full bg-[#252535] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Position Y</label>
                <input
                  type="number"
                  value={settings.y || 0}
                  onChange={(e) => setSettings({ ...settings, y: parseInt(e.target.value) })}
                  className="w-full bg-[#252535] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Largeur</label>
                <input
                  type="number"
                  value={settings.width || 100}
                  onChange={(e) => setSettings({ ...settings, width: parseInt(e.target.value) })}
                  className="w-full bg-[#252535] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Hauteur</label>
                <input
                  type="number"
                  value={settings.height || 100}
                  onChange={(e) => setSettings({ ...settings, height: parseInt(e.target.value) })}
                  className="w-full bg-[#252535] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#252535] text-gray-300 rounded-lg hover:bg-[#353545] transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
