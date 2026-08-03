/**
 * Hook pour détecter automatiquement le contexte Mobile Live depuis l'URL
 * ChurchFace V1 - Live Mobile Instantané
 */

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MobileLiveContext } from "@/lib/mobilelive/MobileLiveTypes";
import { useSession } from "next-auth/react";

interface MobileLiveContextData {
  context: MobileLiveContext;
  ownerId: string;
  ownerType: "USER" | "CHURCH";
  ownerName: string;
  isLoading: boolean;
}

export function useMobileLiveContext(): MobileLiveContextData {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [contextData, setContextData] = useState<MobileLiveContextData>({
    context: "PERSONAL",
    ownerId: session?.user?.id || "",
    ownerType: "USER",
    ownerName: session?.user?.name || "User",
    isLoading: true,
  });

  useEffect(() => {
    // Analyser l'URL pour déterminer le contexte
    const detectContext = () => {
      // Pattern pour les pages d'église: /church/[slug]
      const churchMatch = pathname.match(/^\/church\/([^\/]+)/);
      
      if (churchMatch) {
        // Contexte église
        const churchSlug = churchMatch[1];
        setContextData({
          context: "CHURCH",
          ownerId: churchSlug, // Sera résolu côté serveur
          ownerType: "CHURCH",
          ownerName: churchSlug, // Sera résolu côté serveur
          isLoading: false,
        });
        return;
      }

      // Pattern pour les pages profil: /[username]
      const profileMatch = pathname.match(/^\/([^\/]+)$/);
      
      if (profileMatch) {
        const username = profileMatch[1];
        
        // Si c'est notre propre profil, contexte personnel
        if (session?.user?.name === username || session?.user?.id === username) {
          setContextData({
            context: "PERSONAL",
            ownerId: session.user.id,
            ownerType: "USER",
            ownerName: session.user.name || "User",
            isLoading: false,
          });
          return;
        }
        
        // Sinon, c'est le profil d'un autre utilisateur - pas de contexte de diffusion
        setContextData({
          context: "PERSONAL",
          ownerId: session?.user?.id || "",
          ownerType: "USER",
          ownerName: session?.user?.name || "User",
          isLoading: false,
        });
        return;
      }

      // Par défaut, contexte personnel
      setContextData({
        context: "PERSONAL",
        ownerId: session?.user?.id || "",
        ownerType: "USER",
        ownerName: session?.user?.name || "User",
        isLoading: false,
      });
    };

    detectContext();
  }, [pathname, session]);

  return contextData;
}
