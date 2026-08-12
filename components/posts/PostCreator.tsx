"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import { X, Image as ImageIcon, Send, Plus } from "lucide-react";

interface PostCreatorProps {
  onPostCreated?: () => void;
  userId?: string;
}

interface Album {
  id: string;
  name: string;
  type: string;
  visibility: string;
  _count: {
    media: number;
  };
}

export default function PostCreator({ onPostCreated, userId }: PostCreatorProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<("IMAGE" | "VIDEO")[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [albumId, setAlbumId] = useState<string | null>(null);
  const [showAlbumSelector, setShowAlbumSelector] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const currentUserId = userId || (session?.user as any)?.id;

  // Charger les albums de l'utilisateur
  useEffect(() => {
    if (currentUserId && showAlbumSelector) {
      loadAlbums();
    }
  }, [currentUserId, showAlbumSelector]);

  const loadAlbums = async () => {
    setIsLoadingAlbums(true);
    try {
      const response = await fetch(`/api/albums?userId=${currentUserId}`);
      const data = await response.json();
      if (data.albums) {
        setAlbums(data.albums);
      }
    } catch (error) {
      console.error("Error loading albums:", error);
    } finally {
      setIsLoadingAlbums(false);
    }
  };

  const createAlbum = async (name: string) => {
    try {
      const response = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type: "CUSTOM", visibility: "PUBLIC" }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.album) {
          setAlbumId(data.album.id);
          loadAlbums(); // Recharger la liste des albums
        }
      }
    } catch (error) {
      console.error("Error creating album:", error);
      alert("Erreur lors de la création de l'album");
    }
  };

  const handleMediaUpload = (res: any[]) => {
    if (!res || res.length === 0) return;
    
    res.forEach((uploadedFile) => {
      const isVideo = uploadedFile.type && uploadedFile.type.startsWith("video/");
      
      if (uploadedFile.url) {
        setMediaUrls(prev => [...prev, uploadedFile.url]);
        setMediaTypes(prev => [...prev, isVideo ? "VIDEO" : "IMAGE"]);
      }
    });
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
    setMediaTypes(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAllMedia = () => {
    setMediaUrls([]);
    setMediaTypes([]);
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!currentUserId) {
      alert("Vous devez être connecté pour publier");
      return;
    }

    if (!content && mediaUrls.length === 0) {
      alert("Veuillez ajouter du contenu ou un média");
      return;
    }

    setIsSubmitting(true);

    try {
      // Pour le moment, on utilise le premier média pour le post principal
      // L'API posts existante ne supporte qu'un seul média
      const firstMediaUrl = mediaUrls[0];
      const firstMediaType = mediaTypes[0];

      // Créer le post via l'API existante
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim() || undefined,
          imageUrl: firstMediaType === "IMAGE" ? firstMediaUrl : undefined,
          videoUrl: firstMediaType === "VIDEO" ? firstMediaUrl : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la publication");
      }

      // Créer les entrées Media pour la galerie (tous les médias)
      for (let i = 0; i < mediaUrls.length; i++) {
        await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: { 
              url: mediaUrls[i], 
              type: mediaTypes[i] === "VIDEO" ? "video/mp4" : "image/jpeg" 
            },
            albumId,
            caption: content.trim() || null,
            visibility: "PUBLIC",
          }),
        });
      }

      // Reset form
      setContent("");
      handleClearAllMedia();
      setAlbumId(null);

      if (onPostCreated) {
        onPostCreated();
      }

      alert("Publication réussie !");
    } catch (error) {
      console.error("Error creating post:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de la publication");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || isUploading || (!content && mediaUrls.length === 0);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4">
      <div className="flex items-start gap-3">
        {/* Avatar utilisateur */}
        {session?.user?.image && (
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={session.user.image}
              alt={session.user.name || "Avatar"}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        )}

        <div className="flex-1">
          {/* Zone de texte */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Que voulez-vous partager ?"
            className="w-full min-h-[80px] p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
            maxLength={2000}
            disabled={isSubmitting}
          />

          {/* Prévisualisation des médias */}
          {mediaUrls.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  {mediaTypes[index] === "IMAGE" ? (
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <video
                      src={url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    onClick={() => handleRemoveMedia(index)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                    disabled={isSubmitting}
                  >
                    <X size={16} />
                  </button>
                  {mediaTypes[index] === "VIDEO" && (
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Vidéo
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Sélecteur d'album (optionnel) */}
          {showAlbumSelector && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              {isLoadingAlbums ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600" />
                  <span>Chargement des albums...</span>
                </div>
              ) : (
                <>
                  <select
                    value={albumId || ""}
                    onChange={(e) => setAlbumId(e.target.value || null)}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                    disabled={isSubmitting}
                  >
                    <option value="">Aucun album</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.name} ({album._count.media} médias)
                      </option>
                    ))}
                  </select>
                  {albums.length === 0 && (
                    <button
                      onClick={() => {
                        const albumName = prompt("Nom du nouvel album:");
                        if (albumName) {
                          createAlbum(albumName);
                        }
                      }}
                      className="mt-2 flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                      disabled={isSubmitting}
                    >
                      <Plus size={16} />
                      Créer un nouvel album
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Barre d'actions */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Upload Photo/Vidéo */}
              <UploadButton
                endpoint="mediaUploader"
                onClientUploadComplete={(res) => {
                  handleMediaUpload(res);
                  setIsUploading(false);
                  setUploadProgress(100);
                }}
                onUploadBegin={() => {
                  setIsUploading(true);
                  setUploadProgress(0);
                }}
                onUploadError={(error) => {
                  setIsUploading(false);
                  setUploadProgress(0);
                  console.error("Upload error:", error);
                }}
                config={{
                  mode: "auto",
                }}
                appearance={{
                  button: {
                    background: "#059669",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                  },
                }}
              />

              {/* Sélecteur d'album */}
              <button
                onClick={() => setShowAlbumSelector(!showAlbumSelector)}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <span className="text-sm">Album: {albumId ? "Sélectionné" : "Aucun"}</span>
              </button>
            </div>

            {/* Bouton Publier */}
            <button
              onClick={handleSubmit}
              disabled={isDisabled}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send size={20} />
              )}
              <span>Publier</span>
            </button>
          </div>

          {/* Progression d'upload détaillée */}
          {isUploading && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Upload en cours...</span>
                <span className="text-emerald-600 font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}