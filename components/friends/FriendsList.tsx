"use client";

import { useEffect, useState } from "react";
import { User, UserMinus, MessageCircle } from "lucide-react";
import Link from "next/link";

type Friend = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  friendshipId: string;
  isSender: boolean;
  status: string;
  createdAt: string;
};

export default function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await fetch("/api/friends?status=ACCEPTED");
      const data = await res.json();
      setFriends(data.users || []);
    } catch (e) {
      console.error(e);
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
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
      <h3 className="font-semibold text-gray-800">Mes amis ({friends.length})</h3>

      {friends.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-4">
          Vous n'avez pas encore d'amis. Recherchez des personnes pour commencer !
        </p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {friends.map((friend) => (
            <div
              key={friend.friendshipId}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                {friend.image ? (
                  <img src={friend.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-emerald-700 font-semibold text-sm">
                    {(friend.name || friend.email)[0]?.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{friend.name || "Anonyme"}</p>
                <p className="text-xs text-gray-500 truncate">{friend.email}</p>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/chat?userId=${friend.id}`}
                  className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                  title="Envoyer un message"
                >
                  <MessageCircle size={18} />
                </Link>
                <button
                  onClick={() => unfriend(friend.friendshipId)}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  title="Supprimer des amis"
                >
                  <UserMinus size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
