"use client";

import { useState, useEffect } from "react";
import { Lock, Globe, Users, EyeOff, Save } from "lucide-react";

interface PrivacySettingsProps {
  onClose?: () => void;
}

export default function PrivacySettings({ onClose }: PrivacySettingsProps) {
  const [settings, setSettings] = useState({
    profileLocked: false,
    postVisibility: "PUBLIC",
    friendVisibility: "PUBLIC",
    followPermission: "EVERYONE",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile/privacy");
      const data = await res.json();
      if (data.privacy) {
        setSettings({
          profileLocked: data.privacy.profileLocked,
          postVisibility: data.privacy.postVisibility,
          friendVisibility: data.privacy.friendVisibility,
          followPermission: data.privacy.followPermission,
        });
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        if (onClose) onClose();
      }
    } catch (error) {
      console.error("Error saving privacy settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const visibilityOptions = [
    { value: "PUBLIC", label: "Public", icon: Globe, description: "Tout le monde peut voir" },
    { value: "FRIENDS", label: "Amis", icon: Users, description: "Seulement vos amis" },
    { value: "PRIVATE", label: "Privé", icon: EyeOff, description: "Seulement vous" },
  ];

  const followOptions = [
    { value: "EVERYONE", label: "Tout le monde", icon: Globe, description: "N'importe qui peut vous suivre" },
    { value: "FRIENDS", label: "Amis", icon: Users, description: "Seulement vos amis" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Locked */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="text-emerald-600" size={24} />
          <div>
            <h3 className="font-semibold text-lg">Profil verrouillé</h3>
            <p className="text-sm text-gray-500">
              Limitez ce que les non-amis peuvent voir sur votre profil
            </p>
          </div>
        </div>
        
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={settings.profileLocked}
              onChange={(e) => setSettings({ ...settings, profileLocked: e.target.checked })}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition ${settings.profileLocked ? "bg-emerald-600" : "bg-gray-300"}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${settings.profileLocked ? "left-7" : "left-1"}`} />
            </div>
          </div>
          <span className="text-sm font-medium">
            {settings.profileLocked ? "Profil verrouillé" : "Profil public"}
          </span>
        </label>

        {settings.profileLocked && (
          <p className="mt-3 text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">
            Lorsque votre profil est verrouillé, seuls vos amis peuvent voir vos publications, photos et vidéos complètes.
          </p>
        )}
      </div>

      {/* Post Visibility */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-lg mb-4">Visibilité des publications</h3>
        <div className="space-y-3">
          {visibilityOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = settings.postVisibility === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => setSettings({ ...settings, postVisibility: option.value })}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Icon className={isSelected ? "text-emerald-600" : "text-gray-400"} size={24} />
                <div className="text-left">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
                {isSelected && (
                  <div className="ml-auto w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Friend Visibility */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-lg mb-4">Visibilité de la liste d'amis</h3>
        <div className="space-y-3">
          {visibilityOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = settings.friendVisibility === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => setSettings({ ...settings, friendVisibility: option.value })}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Icon className={isSelected ? "text-emerald-600" : "text-gray-400"} size={24} />
                <div className="text-left">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
                {isSelected && (
                  <div className="ml-auto w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Follow Permission */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-lg mb-4">Qui peut vous suivre</h3>
        <div className="space-y-3">
          {followOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = settings.followPermission === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => setSettings({ ...settings, followPermission: option.value })}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Icon className={isSelected ? "text-emerald-600" : "text-gray-400"} size={24} />
                <div className="text-left">
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
                {isSelected && (
                  <div className="ml-auto w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        
        {onClose && (
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}
