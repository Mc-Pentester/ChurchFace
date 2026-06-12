"use client";

import { useState } from "react";
import { Search, UserPlus, Check, X } from "lucide-react";

type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
};

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
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
    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
      <h3 className="font-semibold text-gray-800">Rechercher des amis</h3>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
        </div>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {results.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
              {user.image ? (
                <img src={user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-emerald-700 font-semibold text-sm">
                  {(user.name || user.email)[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{user.name || "Anonyme"}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>

            {pendingRequests.has(user.id) ? (
              <div className="flex items-center gap-1 text-emerald-600 text-sm">
                <Check size={16} />
                <span>Envoyé</span>
              </div>
            ) : (
              <button
                onClick={() => sendFriendRequest(user.id)}
                className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                title="Envoyer une demande d'ami"
              >
                <UserPlus size={18} />
              </button>
            )}
          </div>
        ))}

        {!loading && query.length >= 2 && results.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-4">Aucun résultat</p>
        )}
      </div>
    </div>
  );
}
