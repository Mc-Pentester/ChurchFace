"use client";

import { useEffect, useState } from "react";
import { UserMinus, MessageCircle } from "lucide-react";
import { socket } from "@/lib/socket";
import Link from "next/link";

type Friend = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  church: string | null;
  city: string | null;
  friendshipId: string;
  isSender: boolean;
  status: string;
  createdAt: string;
};

export default function FriendsListWithOnline() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
    
    socket.on("presence:update", setOnlineUsers);
    
    return () => {
      socket.off("presence:update");
    };
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await fetch("/api/friends/list");
      const data = await res.json();
      setFriends(data.users || []);
    } catch (error) {
      console.error("Fetch friends error:", error);
    } finally {
      setLoading(false);
    }
  };

  const unfriend = async (friendshipId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet ami ?")) return;

    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
      }
    } catch (error) {
      console.error("Unfriend error:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 bg-blue-500/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Mes amis</h2>
        <span className="text-sm text-gray-500">{friends.length} amis</span>
      </div>

      {friends.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">Vous n'avez pas encore d'amis</p>
      ) : (
        <div className="space-y-2">
          {friends.map((friend) => (
            <div
              key={friend.friendshipId}
              className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition flex items-center gap-4"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                  {friend.image ? (
                    <img src={friend.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-emerald-700 font-bold text-lg">
                      {(friend.name || friend.email)[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                  onlineUsers.includes(friend.id) ? "bg-green-500" : "bg-gray-400"
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{friend.name || "Anonyme"}</p>
                <p className="text-xs text-gray-500">
                  {onlineUsers.includes(friend.id) ? "🟢 En ligne" : "⚪ Hors ligne"}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Link
                  href={`/chat?userId=${friend.id}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition"
                >
                  <MessageCircle size={16} />
                </Link>
                <button
                  onClick={() => unfriend(friend.friendshipId)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition"
                >
                  <UserMinus size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
