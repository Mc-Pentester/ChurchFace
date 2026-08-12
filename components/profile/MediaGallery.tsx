"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Video, Plus, Grid, Folder, Upload } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import MediaModal from "@/components/media/MediaModal";

interface MediaGalleryProps {
  userId: string;
  isOwnProfile: boolean;
}

interface Album {
  id: string;
  name: string;
  type: string;
  visibility: string;
  _count: { media: number };
}

interface Media {
  id: string;
  type: string;
  url: string;
  thumbnail: string | null;
  caption: string | null;
  createdAt: string;
}

export default function MediaGallery({ userId, isOwnProfile }: MediaGalleryProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [modalMedia, setModalMedia] = useState<any[] | null>(null);
  const [modalInitialIndex, setModalInitialIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState("");

  const { startUpload } = useUploadThing("mediaUploader", {
    onUploadBegin: () => {
      setIsUploading(true);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setIsUploading(false);
    },
    onClientUploadComplete: async (res) => {
      if (res && res.length > 0) {
        const fileData = {
          ...res[0],
          url: res[0].ufsUrl || res[0].url
        };
        await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            file: fileData,
            albumId: selectedAlbum || null,
            visibility: "PUBLIC"
          }),
        });
        if (selectedAlbum) {
          fetchMedia(selectedAlbum);
        } else {
          fetchMedia(null);
        }
      }
      setIsUploading(false);
    },
  });

  useEffect(() => {
    fetchAlbums();
  }, [userId]);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/albums?userId=${userId}`);
      const data = await res.json();
      setAlbums(data.albums || []);
    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedia = async (albumId: string | null) => {
    try {
      const url = albumId 
        ? `/api/media?userId=${userId}&albumId=${albumId}`
        : `/api/media?userId=${userId}`;
      const res = await fetch(url);
      const data = await res.json();
      setMedia(data.media || []);
    } catch (error) {
      console.error("Error fetching media:", error);
    }
  };

  const handleAlbumClick = (albumId: string) => {
    setSelectedAlbum(albumId);
    fetchMedia(albumId);
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    setMedia([]);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      startUpload([files[0]]);
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;

    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newAlbumName,
          type: "CUSTOM",
          visibility: "PUBLIC"
        }),
      });
      const data = await res.json();
      if (data.album) {
        setNewAlbumName("");
        setShowUploadModal(false);
        fetchAlbums();
      }
    } catch (error) {
      console.error("Error creating album:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (selectedAlbum) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBackToAlbums}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Retour aux albums
          </button>
          {isOwnProfile && (
            <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium cursor-pointer">
              {isUploading ? "Upload..." : <><Upload size={18} /> Ajouter média</>}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {media.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Aucun média dans cet album</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item, index) => (
              <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                {item.type === "VIDEO" ? (
                  <div className="relative w-full h-full">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => {
                        setModalMedia(media.map(m => ({
                          id: m.id,
                          type: m.type,
                          url: m.url,
                          thumbnail: m.thumbnail,
                          order: 0
                        })));
                        setModalInitialIndex(index);
                      }}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      Vidéo
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.thumbnail || item.url}
                    alt={item.caption || "Média"}
                    className="w-full h-full object-cover hover:scale-105 transition cursor-pointer"
                    onClick={() => {
                      setModalMedia(media.map(m => ({
                        id: m.id,
                        type: m.type,
                        url: m.url,
                        thumbnail: m.thumbnail,
                        order: 0
                      })));
                      setModalInitialIndex(index);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Photos & Vidéos</h2>
        {isOwnProfile && (
          <div className="flex gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium cursor-pointer">
              {isUploading ? "Upload..." : <><Upload size={18} /> Ajouter média</>}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              <Plus size={18} />
              Nouvel album
            </button>
          </div>
        )}
      </div>

      {albums.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Folder size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Aucun album</p>
          {isOwnProfile && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Créer un album
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => handleAlbumClick(album.id)}
              className="group relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-emerald-100 to-purple-100 hover:shadow-lg transition"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <Folder size={32} className="text-emerald-600 mb-2" />
                <p className="font-medium text-center text-sm">{album.name}</p>
                <p className="text-xs text-gray-500 mt-1">{album._count.media} médias</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
            </button>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Créer un album</h3>
            <input
              type="text"
              placeholder="Nom de l'album"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setNewAlbumName("");
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateAlbum}
                disabled={!newAlbumName.trim()}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Modal */}
      {modalMedia && (
        <MediaModal
          media={modalMedia}
          initialIndex={modalInitialIndex}
          onClose={() => setModalMedia(null)}
        />
      )}
    </div>
  );
}
