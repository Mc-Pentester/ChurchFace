/**
 * Composant de modération pour Mobile Live
 * ChurchFace V1 - Live Mobile Instantané
 * Interface pour les admins de modérer les lives en direct
 */

"use client";

import { useState, useEffect } from "react";
import { Shield, Ban, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";

interface MobileLiveModerationProps {
  sessionId: string;
  sessionOwner: string;
}

interface ModerationAction {
  type: "STOP_LIVE" | "DELETE_COMMENT" | "BAN_USER" | "WARN_USER";
  reason: string;
  timestamp: Date;
}

export default function MobileLiveModeration({
  sessionId,
  sessionOwner,
}: MobileLiveModerationProps) {
  const { data: session } = useSession();
  const [canModerate, setCanModerate] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [reason, setReason] = useState("");
  const [actionType, setActionType] = useState<"STOP_LIVE" | "WARN">("STOP_LIVE");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur peut modérer
    const checkModerationPermission = async () => {
      try {
        const res = await fetch(`/api/mobilelive/session/${sessionId}/can-moderate`);
        if (res.ok) {
          const data = await res.json();
          setCanModerate(data.canModerate);
        }
      } catch (error) {
        console.error("Error checking moderation permission:", error);
      }
    };

    checkModerationPermission();
  }, [sessionId]);

  const handleModerationAction = async () => {
    if (!reason.trim()) {
      alert("Veuillez fournir une raison pour cette action.");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch(`/api/mobilelive/session/${sessionId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionType,
          reason: reason.trim(),
        }),
      });

      if (res.ok) {
        alert("Action de modération effectuée avec succès.");
        setShowPanel(false);
        setReason("");
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.message || "Action échouée"}`);
      }
    } catch (error) {
      console.error("Error performing moderation action:", error);
      alert("Erreur lors de l'action de modération.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForceStop = async () => {
    if (!confirm("Êtes-vous sûr de vouloir arrêter ce live ? Cette action est irréversible.")) {
      return;
    }

    if (!reason.trim()) {
      alert("Veuillez fournir une raison pour l'arrêt forcé.");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch(`/api/mobilelive/session/${sessionId}/force-stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (res.ok) {
        alert("Live arrêté avec succès.");
        setShowPanel(false);
        setReason("");
        // Recharger la page ou rediriger
        window.location.reload();
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.message || "Action échouée"}`);
      }
    } catch (error) {
      console.error("Error force stopping live:", error);
      alert("Erreur lors de l'arrêt forcé.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!canModerate || !session?.user) {
    return null;
  }

  return (
    <div className="relative">
      {/* Bouton de modération */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
        title="Modération"
      >
        <Shield className="w-5 h-5" />
      </button>

      {/* Panneau de modération */}
      {showPanel && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-gray-900">Modération</h3>
            </div>

            <div className="space-y-3">
              {/* Arrêt forcé */}
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <Ban className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-900">Arrêt forcé</span>
                </div>
                <p className="text-sm text-red-700 mb-2">
                  Arrêter immédiatement ce live pour violation des règles.
                </p>
                <textarea
                  placeholder="Raison de l'arrêt..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm resize-none"
                  rows={2}
                />
                <button
                  onClick={handleForceStop}
                  disabled={isProcessing || !reason.trim()}
                  className="mt-2 w-full py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Ban className="w-4 h-4" />
                      Arrêter le live
                    </>
                  )}
                </button>
              </div>

              {/* Avertissement */}
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Avertir le diffuseur</span>
                </div>
                <textarea
                  placeholder="Message d'avertissement..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm resize-none"
                  rows={2}
                />
                <button
                  onClick={handleModerationAction}
                  disabled={isProcessing || !reason.trim()}
                  className="mt-2 w-full py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text_white rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      Envoyer l'avertissement
                    </>
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-900">
                    Session ID: {sessionId.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPanel(false)}
              className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
