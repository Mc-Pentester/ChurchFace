"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { UserPlus, UserCheck, UserMinus, MessageCircle, MoreVertical, Lock, Shield, Upload } from "lucide-react";
import Image from "next/image";
import { useMediaUploadOptimized } from "@/hooks/useMediaUploadOptimized";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    coverImage: string | null;
    bio: string | null;
    username: string | null;
  };
  friendshipStatus?: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "BLOCKED";
  friendshipId?: string | null;
  isOwnProfile: boolean;
  profileLocked?: boolean;
  onSendFriendRequest?: () => void;
  onAcceptFriendRequest?: () => void;
  onUnfriend?: () => void;
  onMessage?: () => void;
  onBlock?: () => void;
}

export default function ProfileHeader({
  user,
  friendshipStatus = "NONE",
  friendshipId = null,
  isOwnProfile,
  profileLocked = false,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onUnfriend,
  onMessage,
  onBlock,
}: ProfileHeaderProps) {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const { isUploading, uploadFile } = useMediaUploadOptimized();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const result = await uploadFile(files[0]);
      if (result) {
        await fetch("/api/profile/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: {
              url: result.originalUrl,
              type: result.metadata.mimeType || "image/jpeg",
              thumbnail: result.variants.thumbnail?.url,
            }
          }),
        });
        window.location.reload();
      }
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const result = await uploadFile(files[0]);
      if (result) {
        await fetch("/api/profile/cover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: {
              url: result.originalUrl,
              type: result.metadata.mimeType || "image/jpeg",
              thumbnail: result.variants.thumbnail?.url,
            }
          }),
        });
        window.location.reload();
      }
    }
  };

  return (
    <div className="relative">
      {/* Cover Photo */}
      <div className="h-48 md:h-64 bg-gradient-to-br from-emerald-500 to-purple-600 relative cursor-pointer" onClick={() => user.coverImage && (setModalImage(user.coverImage), setShowImageModal(true))}>
        {user.coverImage ? (
          <Image
            src={user.coverImage}
            alt="Cover"
            fill
            className="object-cover"
          />
        ) : null}

        {isOwnProfile && (
          <label className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg cursor-pointer text-sm transition" onClick={(e) => e.stopPropagation()}>
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Upload...</span>
              </div>
            ) : (
              "Changer couverture"
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Profile Info */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-16 md:-mt-20">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
          {/* Avatar */}
          <div className="relative">
            <div
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white cursor-pointer relative"
              onClick={() => user.image && (setModalImage(user.image), setShowImageModal(true))}
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "Avatar"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-purple-400 flex items-center justify-center text-white text-3xl font-bold">
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {isOwnProfile && (
              <label className="absolute bottom-2 right-2 bg-white hover:bg-gray-100 p-2 rounded-full shadow cursor-pointer transition" onClick={(e) => e.stopPropagation()}>
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 text-gray-700" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Name and Actions */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {user.name || "Anonyme"}
                </h1>
                {user.username && (
                  <p className="text-gray-500 text-sm">@{user.username}</p>
                )}
                {profileLocked && (
                  <div className="flex items-center gap-1 text-amber-600 text-sm mt-1">
                    <Lock size={14} />
                    <span>Profil verrouillÃ©</span>
                  </div>
                )}
              </div>

              {!isOwnProfile && (
                <div className="flex flex-wrap gap-2">
                  {friendshipStatus === "NONE" && (
                    <button
                      onClick={onSendFriendRequest}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
                    >
                      <UserPlus size={18} />
                      Ajouter aux amis
                    </button>
                  )}

                  {friendshipStatus === "PENDING_SENT" && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium">
                      <UserPlus size={18} />
                      Demande envoyÃ©e
                    </div>
                  )}

                  {friendshipStatus === "PENDING_RECEIVED" && (
                    <button
                      onClick={onAcceptFriendRequest}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
                    >
                      <UserCheck size={18} />
                      Accepter
                    </button>
                  )}

                  {friendshipStatus === "ACCEPTED" && (
                    <>
                      <button
                        onClick={onMessage}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition font-medium"
                      >
                        <MessageCircle size={18} />
                        Message
                      </button>
                      <button
                        onClick={onUnfriend}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                      >
                        <UserMinus size={18} />
                        Supprimer
                      </button>
                    </>
                  )}

                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-10">
                        <button
                          onClick={() => {
                            onBlock?.();
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600 flex items-center gap-2"
                        >
                          <Shield size={16} />
                          Bloquer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {user.bio && (
            <p className="text-gray-700 mt-3 max-w-2xl">{user.bio}</p>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && modalImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={modalImage || ""}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
