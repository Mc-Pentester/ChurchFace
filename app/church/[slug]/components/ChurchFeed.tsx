"use client";

import { useState, useEffect } from "react";
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

interface ChurchFeedProps {
  churchId: string;
  churchSlug: string;
}

export default function ChurchFeed({ churchId, churchSlug }: ChurchFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [live, setLive] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    fetchPosts();
    fetchLive();
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
      // corrected endpoint: studio/live
      const response = await fetch(`/api/church/${churchSlug}/studio/live`);
      const data = await response.json();
      // API returns { churchLive, liveBroadcast } — prefer churchLive then liveBroadcast
      setLive(data.churchLive || data.liveBroadcast || null);
    } catch (error) {
      console.error("Error fetching live:", error);
    }
  };

  const tabs = [
    { id: "home", label: "Accueil" },
    { id: "posts", label: "Publications" },
    { id: "events", label: "Événements" },
    { id: "lives", label: "Lives" },
    { id: "radio", label: "Radio" },
    { id: "courses", label: "Formations" },
    { id: "prayers", label: "Prières" },
  ];

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
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Content */}
      {activeTab === "home" && (
        <div className="space-y-6">
          {/* Live Event - Affiché en priorité si live */}
          {live && (live.status === "LIVE" || live.isLive) ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-red-500">
              {/* simplified live preview */}
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
      )}

      {activeTab !== "home" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500">Onglet {activeTab} (bientôt disponible)</p>
        </div>
      )}
    </div>
  );
}
