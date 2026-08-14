"use client";

import { X, Share2, MessageCircle, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title: string;
}

export function ShareModal({ isOpen, onClose, shareUrl, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  // Copier automatiquement le lien quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      // Copier uniquement le lien pour maximiser les chances qu'il soit cliquable
      // Les plateformes détectent mieux les liens quand ils sont seuls
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch((error) => {
        console.error("Erreur copie automatique:", error);
      });
    }
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erreur copie lien:", error);
    }
  };

  const handleFacebookShare = () => {
    // Utiliser uniquement l'URL pour maximiser les chances que le lien soit cliquable
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleWhatsAppShare = () => {
    // Pour WhatsApp, inclure le titre mais mettre le lien sur une ligne séparée
    const text = `${title}\n\n${shareUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleChurchFaceShare = () => {
    // Rediriger vers le système de publication ChurchFace (feed)
    // Pré-remplir le contenu avec le lien et le titre
    const content = `${title}\n\n${shareUrl}`;
    // Utiliser localStorage pour passer les données au formulaire de création
    localStorage.setItem('shareContent', content);
    localStorage.setItem('shareUrl', shareUrl);
    // Rediriger vers la page de création de post du feed
    // Note: L'utilisateur doit avoir une église pour créer un post
    // Pour l'instant, rediriger vers la page d'accueil où il peut créer un post
    window.location.href = '/';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Partager</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600 mb-4">Partagez cette salle de prière sur :</p>

          <div className="space-y-3">
            {/* ChurchFace */}
            <button
              onClick={handleChurchFaceShare}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">ChurchFace</p>
                <p className="text-sm text-gray-600">Partager sur ChurchFace</p>
              </div>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookShare}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Facebook</p>
                <p className="text-sm text-gray-600">Partager sur Facebook</p>
              </div>
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">WhatsApp</p>
                <p className="text-sm text-gray-600">Partager sur WhatsApp</p>
              </div>
            </button>

            {/* Copier le lien */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                {copied ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Copy className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">
                  {copied ? "Lien copié !" : "Copier le lien"}
                </p>
                <p className="text-sm text-gray-600">
                  {copied ? "Prêt à coller" : "Copier dans le presse-papiers"}
                </p>
              </div>
            </button>
          </div>

          {/* Link preview */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Lien de partage :</p>
            <p className="text-sm text-gray-700 truncate">{shareUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
