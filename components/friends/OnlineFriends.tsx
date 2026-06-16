"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

interface OnlineFriend {
  id: string;
  name: string;
  email: string;
  image: string | null;
  church: string | null;
}

export default function OnlineFriends() {
  const [onlineFriends, setOnlineFriends] = useState<OnlineFriend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOnlineFriends();
  }, []);

  const fetchOnlineFriends = async () => {
    try {
      const response = await fetch("/api/friends/list");
      if (response.ok) {
        const data = await response.json();
        // Filter friends who are online (you may need to add online status tracking)
        setOnlineFriends(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching online friends:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={18} className="text-green-500" />
          Amis en ligne
        </h3>
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Users size={18} className="text-green-500" />
        Amis en ligne
        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
          {onlineFriends.length}
        </span>
      </h3>

      {onlineFriends.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucun ami en ligne</p>
      ) : (
        <div className="space-y-3">
          {onlineFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="relative">
                {friend.image ? (
                  <img
                    src={friend.image}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-700 font-bold text-sm">
                      {(friend.name || friend.email)[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{friend.name || "Anonyme"}</p>
                <p className="text-xs text-gray-500 truncate">{friend.church || friend.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
