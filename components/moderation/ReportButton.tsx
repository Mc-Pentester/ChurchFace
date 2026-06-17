"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ReportButtonProps {
  targetId: string;
  targetType: "post" | "comment" | "story" | "user";
}

export default function ReportButton({ targetId, targetType }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = [
    { id: "spam", label: "Spam" },
    { id: "harassment", label: "Harcèlement" },
    { id: "fake_account", label: "Faux compte" },
    { id: "offensive", label: "Contenu offensant" },
    { id: "inappropriate", label: "Contenu inapproprié" },
    { id: "other", label: "Autre" },
  ];

  const handleReport = async (reason: string, description?: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, targetType, reason, description }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Erreur lors du signalement");
        return;
      }

      alert("Signalement envoyé avec succès");
      setIsOpen(false);
    } catch (error) {
      console.error("Error reporting:", error);
      alert("Erreur lors du signalement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-500 hover:text-red-500 transition flex items-center gap-1 text-sm"
      >
        <AlertTriangle size={16} />
        Signaler
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Signaler ce contenu</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Choisissez un motif pour ce signalement
            </p>

            <div className="space-y-2 mb-4">
              {reasons.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => handleReport(reason.id)}
                  disabled={isSubmitting}
                  className="w-full p-3 text-left rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
                >
                  {reason.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
}
