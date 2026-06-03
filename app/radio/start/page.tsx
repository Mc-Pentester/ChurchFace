"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Headphones, AlertCircle } from "lucide-react";

export default function StartRadioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAuth = status === "authenticated";

  const startRadio = async () => {
    if (!isAuth) return;
    if (!title.trim()) {
      setError("Le titre est requis.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/radio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur création de la radio.");
        return;
      }

      router.push(`/radio/${data.radio.id}`);
    } catch (err) {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuth) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <AlertCircle className="mx-auto text-gray-400 mb-3" size={40} />
        <p className="text-gray-600">Connecte-toi pour démarrer une radio.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Headphones className="text-emerald-600" />
        Démarrer une radio live
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre de la radio *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Prière du matin, Louange & Adoration..."
            className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="De quoi parle cette émission ?"
            rows={3}
            className="w-full p-3 bg-gray-50 rounded-xl outline-none resize-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        <button
          onClick={startRadio}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-medium py-3 rounded-xl transition"
        >
          {loading ? "Création..." : "🎙️ Démarrer la radio"}
        </button>
      </div>
    </div>
  );
}
