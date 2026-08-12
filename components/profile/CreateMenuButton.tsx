"use client";

import { useState, useEffect } from "react";
import { Plus, X, Video, FileText } from "lucide-react";
import GoLiveButton from "@/components/mobilelive/GoLiveButton";
import { MobileLiveContext } from "@/lib/mobilelive/MobileLiveTypes";

interface CreateMenuButtonProps {
  userId: string;
  onOpenPostCreator: () => void;
  onOpenMobileLiveSetup: () => void;
  isPostCreatorOpen: boolean;
}

export default function CreateMenuButton({
  userId,
  onOpenPostCreator,
  onOpenMobileLiveSetup,
  isPostCreatorOpen,
}: CreateMenuButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Fermer le menu si PostCreator est ouvert
  useEffect(() => {
    if (isPostCreatorOpen) {
      setIsOpen(false);
    }
  }, [isPostCreatorOpen]);

  const handleToggle = () => {
    if (isPostCreatorOpen) {
      onOpenPostCreator(); // Fermer le PostCreator
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handlePostCreator = () => {
    setIsOpen(false);
    onOpenPostCreator();
  };

  const handleMobileLive = () => {
    setIsOpen(false);
    onOpenMobileLiveSetup();
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3">
      {/* Menu déroulant */}
      {isOpen && (
        <div className="flex flex-col gap-2 mb-2">
          {/* Option: Diffuser en direct */}
          <div className="flex items-center gap-2">
            <span className="bg-gray-900 text-white text-sm px-3 py-1 rounded-lg shadow-lg">
              Diffuser en direct
            </span>
            <button
              onClick={handleMobileLive}
              className="w-12 h-12 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <Video className="w-5 h-5" />
            </button>
          </div>

          {/* Option: Créer une publication */}
          <div className="flex items-center gap-2">
            <span className="bg-gray-900 text-white text-sm px-3 py-1 rounded-lg shadow-lg">
              Créer une publication
            </span>
            <button
              onClick={handlePostCreator}
              className="w-12 h-12 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Bouton principal */}
      <button
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen || isPostCreatorOpen
            ? "bg-red-600 hover:bg-red-700 rotate-45"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        {isOpen || isPostCreatorOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Debug info */}
      <div className="bg-yellow-100 p-2 rounded text-xs mt-2">
        Debug: isOpen={isOpen ? 'true' : 'false'}, isPostCreatorOpen={isPostCreatorOpen ? 'true' : 'false'}
      </div>
    </div>
  );
}
