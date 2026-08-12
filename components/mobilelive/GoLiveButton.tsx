/**
 * Composant bouton "Diffuser en direct" pour Mobile Live
 * ChurchFace V1 - Live Mobile Instantané
 */

"use client";

import { useState, useEffect } from "react";
import { Video, Loader2 } from "lucide-react";
import { useMobileLive } from "@/hooks/useMobileLive";
import { MobileLiveContext } from "@/lib/mobilelive/MobileLiveTypes";

interface GoLiveButtonProps {
  context: MobileLiveContext;
  ownerId?: string;
  ownerType?: "USER" | "CHURCH";
  onOpenSetup?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
}

export default function GoLiveButton({
  context,
  ownerId,
  ownerType,
  onOpenSetup,
  className = "",
  variant = "primary",
}: GoLiveButtonProps) {
  const { checkPermissions, permissions, isLoading } = useMobileLive();
  const [hasPermission, setHasPermission] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      setChecking(true);
      console.log("GoLiveButton - checking permissions for:", { context, ownerId, ownerType });
      const perms = await checkPermissions(context, ownerId, ownerType);
      console.log("GoLiveButton - permissions result:", perms);
      setHasPermission(perms?.canStartLive || false);
      setChecking(false);
    };

    check();
  }, [context, ownerId, ownerType, checkPermissions]);

  const handleClick = () => {
    if (onOpenSetup) {
      onOpenSetup();
    }
  };

  // Ne pas afficher le bouton si l'utilisateur n'a pas la permission
  if (checking) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Vérification...</span>
      </div>
    );
  }

  // Temporairement désactiver la vérification de permission pour le débogage
  // if (!hasPermission) {
  //   console.log("GoLiveButton - No permission, button hidden");
  //   return null;
  // }

  const baseStyles = "flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200";
  
  const variantStyles = {
    primary: "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25",
    secondary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-500/25",
    ghost: "bg-transparent hover:bg-red-600/10 text-red-600 border border-red-600",
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Video className="w-5 h-5" />
      )}
      <span>Diffuser en direct</span>
    </button>
  );
}
