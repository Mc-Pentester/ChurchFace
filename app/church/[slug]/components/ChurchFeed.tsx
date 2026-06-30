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
      const response = await fetch(`/api/church/${churchSlug}/live`);
      const data = await response.json();
      console.log("Live data from API:", data);
      setLive(data.live || null);
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
              <div className="relative h-64 bg-gradient-to-r from-red-600 to-red-800">
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                  <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                  🔴 En direct maintenant
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{live.title || "Diffusion en direct"}</h3>
                  <p className="text-white/90 text-sm mb-4">Rejoignez la diffusion en cours</p>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <span className="flex items-center gap-1">
                      👁 {live.viewerCount || 0} spectateurs
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <a
                  href={`/church/${churchSlug}/live`}
                  className="block w-full bg-red-600 text-white py-4 rounded-lg font-bold hover:bg-red-700 transition text-center text-lg"
                >
                  Regarder le direct
                </a>
              </div>
            </div>
          ) : null}

          {/* Next Event */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-lg">
                📅
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Prochain événement</h3>
                <p className="text-sm text-gray-500">12 juillet 2025</p>
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Croisade de guérison</h4>
            <p className="text-gray-600 text-sm mb-4">
              Une soirée spéciale de prière et de guérison
            </p>
            <button className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition">
              Je participe
            </button>
          </div>

          {/* Prayer Requests */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
                🙏
              </div>
              <h3 className="font-bold text-gray-900">Demandes de prière</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 text-sm">Prière pour la guérison de ma mère</p>
                <p className="text-gray-500 text-xs mt-1">Il y a 2 heures</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 text-sm">Prière pour mon emploi</p>
                <p className="text-gray-500 text-xs mt-1">Il y a 5 heures</p>
              </div>
            </div>
            <button className="w-full mt-4 border border-emerald-600 text-emerald-600 py-2 rounded-lg font-medium hover:bg-emerald-50 transition">
              Envoyer une demande de prière
            </button>
          </div>

          {/* Daily Verse */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                📖
              </div>
              <h3 className="font-bold">Verset du jour</h3>
            </div>
            <p className="text-lg font-medium mb-2">
              "Car là où deux ou trois sont réunis en mon nom, je suis au milieu d'eux."
            </p>
            <p className="text-sm opacity-90">— Matthieu 18:20</p>
          </div>
        </div>
      )}

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

      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 text-emerald-600 p-4 rounded-lg text-center min-w-16">
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs">JUIL</div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Croisade de guérison</h4>
                <p className="text-gray-600 text-sm mb-3">Une soirée spéciale de prière et de guérison</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>📍 Salle principale</span>
                  <span>⏰ 19:00</span>
                </div>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition">
                  Je participe
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-100 text-emerald-600 p-4 rounded-lg text-center min-w-16">
                <div className="text-2xl font-bold">20</div>
                <div className="text-xs">JUIL</div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Conférence jeunesse</h4>
                <p className="text-gray-600 text-sm mb-3">Formation et partage pour les jeunes</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>📍 Salle des jeunes</span>
                  <span>⏰ 14:00</span>
                </div>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition">
                  Je participe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "lives" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-red-600 to-red-800">
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                🔴 En direct
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold mb-1">Culte du Dimanche</h3>
                <p className="text-sm opacity-90">En direct maintenant</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👁</span>
                  <span className="text-gray-600">1,234 spectateurs</span>
                </div>
              </div>
              <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition">
                Regarder le direct
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-gray-700 to-gray-900">
              <div className="absolute top-4 left-4 bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                ▶ Replay disponible
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold mb-1">Culte du Dimanche dernier</h3>
                <p className="text-sm opacity-90">Durée: 2h 15min</p>
              </div>
            </div>
            <div className="p-4">
              <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition">
                Voir le replay
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "radio" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 text-purple-600 p-4 rounded-lg">
                🎙
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Radio Salem</h3>
                <p className="text-sm text-gray-500">En direct maintenant</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-sm opacity-90 mb-1">En cours de diffusion</p>
                  <p className="font-medium">Louange et Adoration</p>
                </div>
                <button className="bg-white text-purple-600 px-6 py-2 rounded-full font-medium">
                  ▶ Écouter
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>🎧 456 auditeurs</span>
              <span>•</span>
              <span>📊 1,234 écoutes totales</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "courses" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-blue-600 to-blue-800"></div>
            <div className="p-6">
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">Nouveaux convertis</span>
              <h4 className="font-semibold text-gray-900 mt-2 mb-2">Fondements de la foi</h4>
              <p className="text-gray-600 text-sm mb-4">Les bases de la vie chrétienne pour les nouveaux convertis</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>📚 12 leçons</span>
                  <span>⏱️ 6 heures</span>
                </div>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition">
                  Commencer
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-green-600 to-green-800"></div>
            <div className="p-6">
              <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">Leadership</span>
              <h4 className="font-semibold text-gray-900 mt-2 mb-2">Leadership chrétien</h4>
              <p className="text-gray-600 text-sm mb-4">Développez vos compétences de leadership selon les principes bibliques</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>📚 8 leçons</span>
                  <span>⏱️ 4 heures</span>
                </div>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition">
                  Commencer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "prayers" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Envoyer une demande de prière</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet de prière</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                  placeholder="Décrivez votre demande de prière"
                />
              </div>
              <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition">
                Envoyer ma demande
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Demandes récentes</h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 text-sm">Prière pour la guérison de ma mère</p>
                <p className="text-gray-500 text-xs mt-1">Il y a 2 heures</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 text-sm">Prière pour mon emploi</p>
                <p className="text-gray-500 text-xs mt-1">Il y a 5 heures</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 text-sm">Prière pour ma famille</p>
                <p className="text-gray-500 text-xs mt-1">Il y a 1 jour</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab !== "home" && activeTab !== "posts" && activeTab !== "events" && activeTab !== "lives" && activeTab !== "radio" && activeTab !== "courses" && activeTab !== "prayers" && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          Cette fonctionnalité sera bientôt disponible
        </div>
      )}
    </div>
  );
}
