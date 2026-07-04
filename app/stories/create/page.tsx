"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";

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

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image (optionnel)
        </label>
        <UploadButton
          endpoint="mediaUploader"
          onClientUploadComplete={(res) => {
            if (res && res[0]) {
              setImageUrl(res[0].url);
            }
          }}
          onUploadError={(error: Error) => {
            alert(`Erreur: ${error.message}`);
          }}
        />
        {imageUrl && (
          <div className="mt-4">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full max-w-md rounded-lg"
            />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="mt-2 text-sm text-red-600 hover:text-red-700"
            >
              Supprimer l'image
            </button>
          </div>
        )}
      </div>

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