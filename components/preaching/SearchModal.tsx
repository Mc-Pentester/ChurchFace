"use client";

import { useState, useEffect } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import type { Preaching } from "@/types/preaching";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Preaching[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("recentPreachingSearches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (err) {
          console.error("Failed to parse recent searches:", err);
          localStorage.removeItem("recentPreachingSearches");
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/preachings/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(data.preachings || []);
        } catch (error) {
          console.error("Error searching:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    // Save to recent searches
    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentPreachingSearches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentPreachingSearches");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher des prédications..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="flex-1 text-lg outline-none"
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {query.trim().length < 2 ? (
            <div className="p-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Clock size={16} />
                      Recherches récentes
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Effacer
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => handleSearch(search)}
                        className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <TrendingUp size={16} />
                  Tendances
                </h3>
                <div className="space-y-2">
                  {[
                    "Foi",
                    "Guérison",
                    "Prière",
                    "Louange",
                    "Famille",
                    "Espérance",
                    "Grâce",
                    "Amour",
                  ].map((trend) => (
                    <button
                      key={trend}
                      onClick={() => handleSearch(trend)}
                      className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Recherche en cours...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucun résultat pour "{query}"</p>
            </div>
          ) : (
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-4">{results.length} résultats</p>
              <div className="space-y-3">
                {results.map((preaching) => (
                  <a
                    key={preaching.id}
                    href={`/preachings/${preaching.id}`}
                    onClick={onClose}
                    className="block p-3 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="flex gap-3">
                      {preaching.thumbnail && (
                        <img
                          src={preaching.thumbnail}
                          alt={preaching.title}
                          className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-2">
                          {preaching.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {preaching.author?.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {preaching.views} vues
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50 text-xs text-gray-500 text-center">
          Appuyez sur <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Esc</kbd> pour fermer
        </div>
      </div>
    </div>
  );
}
