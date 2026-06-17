"use client";

import { useState } from "react";
import { Search, UserPlus, Check } from "lucide-react";
import type { UserBasic } from "@/types/friends";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserBasic[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (res.ok) {
        setPendingRequests((prev) => new Set(prev).add(userId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Rechercher des amis</h3>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 bg-blue-500/10" />
        </div>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {results.map((user) => (
          <div
            key={user.id}
            className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.image ? (
                  <img src={user.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-blue-700 font-bold text-xl">
                    {(user.name || user.email)[0]?.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.name || "Anonyme"}</p>
                <p className="text-sm text-gray-500 truncate mb-3">{user.email}</p>
                
                {pendingRequests.has(user.id) ? (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                    <Check size={16} />
                    <span>Demande envoyée</span>
                  </div>
                ) : (
                  <button
                    onClick={() => sendFriendRequest(user.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition w-full"
                  >
                    Ajouter ami
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">Aucun résultat trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
