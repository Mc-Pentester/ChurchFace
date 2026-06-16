"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";

type Suggestion = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  church: string | null;
  city: string | null;
  score: number;
  mutualFriends: number;
};

export default function FriendSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch("/api/friends/suggestions");
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Fetch suggestions error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId }),
      });
      if (res.ok) {
        // Remove from suggestions
        setSuggestions((prev) => prev.filter((s) => s.id !== receiverId));
      }
    } catch (error) {
      console.error("Send request error:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Suggestions pour vous</h2>
      
      {suggestions.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">Aucune suggestion disponible</p>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {suggestion.image ? (
                    <img src={suggestion.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-blue-700 font-bold text-xl">
                      {(suggestion.name || suggestion.email)[0]?.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{suggestion.name || "Anonyme"}</p>
                  <p className="text-sm text-gray-500 truncate mb-1">{suggestion.church || suggestion.email}</p>
                  {(suggestion.mutualFriends ?? 0) > 0 && (
                    <p className="text-xs text-gray-400 mb-3">{suggestion.mutualFriends} amis communs</p>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => sendFriendRequest(suggestion.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <UserPlus size={16} />
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
