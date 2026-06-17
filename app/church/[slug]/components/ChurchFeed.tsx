"use client";

import { useState, useEffect } from "react";
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

interface ChurchFeedProps {
  churchId: string;
}

export default function ChurchFeed({ churchId }: ChurchFeedProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    fetchPosts();
  }, [churchId]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/church/${churchId}/posts?limit=10`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "posts", label: "Publications" },
    { id: "events", label: "Événements" },
    { id: "media", label: "Médias" },
    { id: "members", label: "Membres" },
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
      {activeTab === "posts" && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
              Aucune publication pour le moment
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm p-6">
                {post.content && (
                  <p className="text-gray-900 mb-4">{post.content}</p>
                )}
                
                {post.imageUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt="Post image"
                      className="w-full object-cover"
                    />
                  </div>
                )}

                {post.videoUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <video
                      src={post.videoUrl}
                      controls
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex items-center gap-6 pt-4 border-t">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition">
                    {post.isLiked ? (
                      <HeartIconSolid className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    <span className="text-sm">{post._count.likes}</span>
                  </button>
                  
                  <button className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition">
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                    <span className="text-sm">{post._count.comments}</span>
                  </button>
                  
                  <button className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition">
                    <ShareIcon className="w-5 h-5" />
                    <span className="text-sm">Partager</span>
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab !== "posts" && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          Cette fonctionnalité sera bientôt disponible
        </div>
      )}
    </div>
  );
}
