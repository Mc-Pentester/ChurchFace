"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";

export default function CreatePostPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    content: "",
    imageUrl: "",
    videoUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/church/post/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          churchId: params.slug,
        }),
      });

      if (response.ok) {
        router.back();
      } else {
        alert("Erreur lors de la création de la publication");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Erreur lors de la création de la publication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Créer une publication</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenu
            </label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Partagez quelque chose..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image (optionnel)
            </label>
            <UploadButton
              endpoint="mediaUploader"
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  setFormData({ ...formData, imageUrl: res[0].url });
                }
              }}
              onUploadError={(error: Error) => {
                alert(`Erreur: ${error.message}`);
              }}
            />
            {formData.imageUrl && (
              <div className="mt-4">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full max-w-md rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: "" })}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Supprimer l'image
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vidéo (optionnel)
            </label>
            <UploadButton
              endpoint="mediaUploader"
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  setFormData({ ...formData, videoUrl: res[0].url });
                }
              }}
              onUploadError={(error: Error) => {
                alert(`Erreur: ${error.message}`);
              }}
            />
            {formData.videoUrl && (
              <div className="mt-4">
                <video
                  src={formData.videoUrl}
                  controls
                  className="w-full max-w-md rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, videoUrl: "" })}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Supprimer la vidéo
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? "Publication..." : "Publier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
