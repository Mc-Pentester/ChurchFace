"use client";

import { useEffect, useState } from "react";
import { Search, TrendingUp, Radio, BookOpen, Church, Music, Users, Heart, Calendar, Flame, Star, Play, Eye } from "lucide-react";
import VideoCard from "@/components/preaching/VideoCard";
import type { Preaching, PreachingCategory } from "@/types/preaching";

const categories = [
  { id: "trending", name: "🔥 Tendances", icon: Flame },
  { id: "live", name: "🔴 En direct", icon: Radio },
  { id: "sermons", name: "🎙 Sermons", icon: BookOpen },
  { id: "teachings", name: "📖 Enseignements", icon: BookOpen },
  { id: "services", name: "⛪ Cultes complets", icon: Church },
  { id: "worship", name: "🎵 Louanges", icon: Music },
  { id: "family", name: "👨👩👧 Couple et Famille", icon: Users },
  { id: "spiritual", name: "🙏 Vie spirituelle", icon: Heart },
  { id: "evangelism", name: "🎯 Évangélisation", icon: Star },
  { id: "bible", name: "📚 Études bibliques", icon: BookOpen },
];

const filters = [
  { id: "week", name: "Cette semaine" },
  { id: "month", name: "Ce mois-ci" },
  { id: "views", name: "Les plus vus" },
  { id: "recent", name: "Les plus récents" },
  { id: "rating", name: "Les mieux notés" },
];

export default function PreachingsPage() {
  const [preachings, setPreachings] = useState<Preaching[]>([]);
  const [categoriesList, setCategoriesList] = useState<PreachingCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("trending");
  const [selectedFilter, setSelectedFilter] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPreachings();
    fetchCategories();
  }, [selectedCategory, selectedFilter]);

  const fetchPreachings = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        sort: selectedFilter === "recent" ? "recent" : selectedFilter === "views" ? "views" : "recent",
        limit: "20",
      });

      if (selectedCategory !== "trending" && selectedCategory !== "live") {
        params.append("categoryId", selectedCategory);
      }

      const res = await fetch(`/api/preachings?${params}`);
      const data = await res.json();
      setPreachings(data.preachings || []);
    } catch (error) {
      console.error("Error fetching preachings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/preachings/categories");
      const data = await res.json();
      setCategoriesList(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPreachings();
      return;
    }

    try {
      const res = await fetch(`/api/preachings/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setPreachings(data.preachings || []);
    } catch (error) {
      console.error("Error searching preachings:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Featured Preaching */}
      {preachings.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-500 to-purple-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">PRÉDICATION À LA UNE</h1>
            <p className="text-emerald-100 mb-6">Découvrez la prédication du moment</p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex gap-6">
                <div className="w-1/2 aspect-video bg-black/30 rounded-xl flex items-center justify-center">
                  <Play size={64} className="text-white" />
                </div>
                <div className="w-1/2 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold mb-2">{preachings[0].title}</h2>
                  <p className="text-emerald-100 mb-4">{preachings[0].author?.name}</p>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Eye size={18} />
                      <span>{preachings[0].views} vues</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart size={18} />
                      <span>{preachings[0]._count?.likes || 0}</span>
                    </div>
                  </div>
                  <button className="bg-white text-emerald-600 font-semibold py-3 px-6 rounded-xl hover:bg-emerald-50 transition-colors">
                    ▶ Regarder maintenant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Catégories</h3>
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-gradient-to-r from-emerald-500 to-purple-600 text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <cat.icon size={18} />
                    <span className="text-sm">{cat.name}</span>
                  </button>
                ))}
              </nav>

              <h3 className="font-semibold text-gray-900 mt-6 mb-4">Filtres</h3>
              <nav className="space-y-1">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                      selectedFilter === filter.id
                        ? "bg-gradient-to-r from-emerald-500 to-purple-600 text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="text-sm">{filter.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="flex-1">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher des prédications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl shadow-sm border-0 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="aspect-video bg-gray-200 rounded-xl animate-pulse mb-4" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                  </div>
                ))}
              </div>
            ) : preachings.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Aucune prédication trouvée</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {preachings.map((preaching) => (
                  <VideoCard key={preaching.id} preaching={preaching} />
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="w-80 flex-shrink-0 hidden xl:block">
            <div className="sticky top-4 space-y-4">
              {/* Verse of the Day */}
              <div className="bg-gradient-to-br from-emerald-500 to-purple-600 rounded-2xl shadow-sm p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={20} />
                  <h3 className="font-semibold">Verset du jour</h3>
                </div>
                <p className="text-emerald-100 italic mb-2">
                  "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle."
                </p>
                <p className="text-sm text-emerald-200">Jean 3:16</p>
              </div>

              {/* Live Broadcasts */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Radio className="text-red-500" size={20} />
                  <h3 className="font-semibold text-gray-900">Lives en cours</h3>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <Radio size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Aucun live en cours</p>
                </div>
              </div>

              {/* Trending */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-emerald-500" size={20} />
                  <h3 className="font-semibold text-gray-900">Tendances</h3>
                </div>
                <div className="space-y-3">
                  {preachings.slice(0, 5).map((preaching) => (
                    <div key={preaching.id} className="flex gap-3">
                      <div className="w-24 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {preaching.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {preaching.author?.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="text-purple-500" size={20} />
                  <h3 className="font-semibold text-gray-900">Recommandé pour vous</h3>
                </div>
                <div className="space-y-3">
                  {preachings.slice(5, 10).map((preaching) => (
                    <div key={preaching.id} className="flex gap-3">
                      <div className="w-24 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {preaching.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {preaching.author?.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="text-emerald-500" size={20} />
                  <h3 className="font-semibold text-gray-900">Événements à venir</h3>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Aucun événement à venir</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
