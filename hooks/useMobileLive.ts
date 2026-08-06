/**
 * Hook React pour gérer les sessions Mobile Live
 * ChurchFace V1 - Live Mobile Instantané
 */

import { useState, useCallback, useEffect } from "react";
import { MobileLiveContext, MobileLiveConfig, MobileLiveSession, MobileLivePermissions } from "@/lib/mobilelive/MobileLiveTypes";

export function useMobileLive() {
  const [session, setSession] = useState<MobileLiveSession | null>(null);
  const [permissions, setPermissions] = useState<MobileLivePermissions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Vérifie les permissions pour un contexte donné
   */
  const checkPermissions = useCallback(async (context: MobileLiveContext, ownerId?: string, ownerType?: "USER" | "CHURCH") => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        context,
        ...(ownerId && { ownerId }),
        ...(ownerType && { ownerType }),
      });

      const response = await fetch(`/api/mobilelive/permissions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
        return data;
      } else {
        throw new Error("Failed to check permissions");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Crée une nouvelle session de live
   */
  const createSession = useCallback(async (params: {
    context: MobileLiveContext;
    ownerId: string;
    ownerType: "USER" | "CHURCH";
    config: MobileLiveConfig;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/mobilelive/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data);
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create session");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Démarre un live
   */
  const startLive = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/mobilelive/session/${sessionId}/start`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data);
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start live");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Arrête un live
   */
  const stopLive = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/mobilelive/session/${sessionId}/stop`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data);
        return data;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to stop live");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Met à jour les statistiques
   */
  const updateStats = useCallback(async (sessionId: string, stats: { viewerCount: number; bitrate?: number; fps?: number }) => {
    try {
      await fetch(`/api/mobilelive/session/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats),
      });
    } catch (err) {
      console.error("Failed to update stats:", err);
    }
  }, []);

  /**
   * Réinitialise la session
   */
  const resetSession = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  return {
    session,
    permissions,
    isLoading,
    error,
    checkPermissions,
    createSession,
    startLive,
    stopLive,
    updateStats,
    resetSession,
  };
}
