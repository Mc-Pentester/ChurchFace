"use client";

import { useState } from "react";
import { 
  Newspaper, 
  User, 
  Users, 
  Image as ImageIcon, 
  Lock,
  Info
} from "lucide-react";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOwnProfile: boolean;
  profileLocked?: boolean;
}

export default function ProfileTabs({
  activeTab,
  onTabChange,
  isOwnProfile,
  profileLocked = false,
}: ProfileTabsProps) {
  const tabs = [
    { id: "posts", label: "Publications", icon: Newspaper },
    { id: "about", label: "À propos", icon: Info },
    { id: "friends", label: "Amis", icon: Users },
    { id: "media", label: "Photos & Vidéos", icon: ImageIcon },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 mt-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition
                  ${
                    isActive
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {profileLocked && !isOwnProfile && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <Lock className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-amber-900">Profil verrouillé</p>
            <p className="text-sm text-amber-700 mt-1">
              Cet utilisateur a verrouillé son profil. Seuls ses amis peuvent voir ses publications, photos et vidéos complètes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
