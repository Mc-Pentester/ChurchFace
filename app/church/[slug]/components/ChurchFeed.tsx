"use client";

import { useState, useEffect } from "react";
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon } from "@heroicons/react/24/outline";
import { socket } from "@/lib/socket";

interface ChurchFeedProps {
  churchId: string;
  churchSlug: string;
}

export default function ChurchFeed({ churchId, churchSlug }: ChurchFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [live, setLive] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    fetchLive();
  }, [churchId]);

  // Subscribe to realtime church posts scoped to this church's room.
  useEffect(() => {
    socket.emit("joinChurch", churchId);

    const handleNewPost = (post: any) => {
      if (!post || post.churchId !== churchId) return;
      setPosts((prev) => {
        if (prev.some((p) => p.id === post.id)) return prev;
        return [post, ...prev];
      });
    };

    socket.on("post:created", handleNewPost);

    return () => {
      socket.emit("leaveChurch", churchId);
      socket.off("post:created", handleNewPost);
    };
  }, [churchId]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/church/posts?churchId=${churchId}`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLive = async () => {
    try {
      // Public endpoint (no auth) — returns { isLive, live }
      const response = await fetch(`/api/church/${churchSlug}/live`);
      if (!response.ok) {
        setLive(null);
        return;
      }
      const data = await response.json();
      setLive(data.live || null);
    } catch (error) {
      console.error("Error fetching live:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Event - Affiché en priorité si live */}
      {live && (live.status === "LIVE" || live.isLive) ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-red-500">
          <div className="p-4">
            <p className="font-semibold text-gray-900">En direct — {live.title}</p>
            {live.streamUrl && (
              <p className="text-sm text-gray-500">Stream: {live.streamUrl}</p>
            )}
          </div>
        </div>
      ) : null}

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            Aucune publication pour le moment
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-gray-900 mb-2">{post.content}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <button className="flex items-center gap-2">
                  <HeartIcon className="w-5 h-5" /> {post._count?.likes || 0}
                </button>
                <button className="flex items-center gap-2">
                  <ChatBubbleLeftIcon className="w-5 h-5" /> {post._count?.comments || 0}
                </button>
                <button className="flex items-center gap-2">
                  <ShareIcon className="w-5 h-5" /> Partager
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
