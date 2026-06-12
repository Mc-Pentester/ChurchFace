"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!content.trim() && !imageUrl.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, imageUrl }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Erreur création story");
      }

      setContent("");
      setImageUrl("");

      router.push("/stories");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création de la story");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Créer une story</h1>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Écris quelque chose..."
        className="w-full border p-3 rounded mb-3"
      />

      <input
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Image URL (optionnel)"
        className="w-full border p-3 rounded mb-3"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-emerald-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
      >
        {loading ? "Publication..." : "Publier la story"}
      </button>
    </div>
  );
}