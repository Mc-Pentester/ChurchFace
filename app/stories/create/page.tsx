"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";

export default function Page() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "">("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!content.trim() && !mediaUrl.trim()) return;

    setLoading(true);

    try {
      // Send mediaUrl and mediaType to server
      const body: any = { 
        content,
        mediaUrl,
        mediaType
      };

      const res = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Erreur création story");
      }

      setContent("");
      setMediaUrl("");
      setMediaType("");

      router.back();
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
          Média (optionnel)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <UploadButton
            endpoint="mediaUploader"
            onClientUploadComplete={(files) => {
              console.log("UploadThing files:", files);
              if (files && files.length > 0) {
                const file = files[0] as any;
                console.log("File:", file);
                console.log("File name:", file.name);
                console.log("File type:", file.type);
                
                setMediaUrl(file.ufsUrl || file.url || file.appUrl);
                
                // Detect file type from name extension (most reliable)
                const isVideo = file.name?.match(/\.(mp4|webm|mov|avi|mkv)$/i) ||
                               (file.ufsUrl || file.url || file.appUrl)?.match(/\.(mp4|webm|mov|avi|mkv)$/i);
                
                console.log("Detected as video:", isVideo);
                setMediaType(isVideo ? 'video' : 'image');
              }
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error);
              alert(`Erreur: ${error.message}`);
            }}
          />
        </div>
        {mediaUrl && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Aperçu:</p>
            {mediaType === 'image' ? (
              <img
                src={mediaUrl}
                alt="Preview"
                className="w-full max-w-md rounded-lg"
              />
            ) : (
              <video
                src={mediaUrl}
                controls
                className="w-full max-w-md rounded-lg"
              />
            )}
            <button
              type="button"
              onClick={() => {
                setMediaUrl("");
                setMediaType("");
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-700"
            >
              Supprimer le média
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