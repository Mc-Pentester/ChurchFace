"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, X, Copy, Check } from "lucide-react";

interface ShareMenuProps {
  postId: string;
  postContent?: string;
  postUrl?: string;
  onInternalShare?: () => void;
}

export default function ShareMenu({
  postId,
  postContent = "",
  postUrl,
  onInternalShare,
}: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const url = postUrl || (typeof window !== "undefined"
    ? `${window.location.origin}/post/${postId}`
    : `/post/${postId}`);

  const text = encodeURIComponent(postContent || "Regarde ce post sur ChurchFace !");
  const encodedUrl = encodeURIComponent(url);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const shareLinks = [
    {
      name: "Facebook",
      icon: "📘",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Twitter / X",
      icon: "🐦",
      href: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
    },
    {
      name: "WhatsApp",
      icon: "💬",
      href: `https://wa.me/?text=${text}%20${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: "💼",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Telegram",
      icon: "✈️",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${text}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "ChurchFace",
          text: postContent || "Regarde ce post sur ChurchFace !",
          url,
        });
        setOpen(false);
      } catch {
        // user cancelled
      }
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-600 hover:text-emerald-600 flex items-center gap-1"
      >
        <Share2 size={16} />
      </button>

      {open && (
        <div className="absolute bottom-8 right-0 z-20 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border p-3 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Partager</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>

          {/* Internal share */}
          {onInternalShare && (
            <button
              onClick={() => {
                onInternalShare();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 text-sm text-emerald-700 transition"
            >
              🔁 Repartager sur ChurchFace
            </button>
          )}

          {/* Divider */}
          <div className="" />

          {/* Social networks */}
          <div className="space-y-1">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition"
              >
                <span>{link.icon}</span>
                {link.name}
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="" />

          {/* Copy link */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? "Lien copié !" : "Copier le lien"}
          </button>

          {/* Native share (mobile) */}
          {typeof navigator !== "undefined" && !!navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition"
            >
              📱 Partager via mon appareil
            </button>
          )}
        </div>
      )}
    </div>
  );
}
