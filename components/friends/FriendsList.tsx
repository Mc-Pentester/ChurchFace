"use client";

import { useEffect, useState } from "react";
import { UserMinus, MessageCircle, MoreHorizontal } from "lucide-react";
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
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Amis</h3>
        <span className="text-sm text-gray-500">{friends.length} amis</span>
      </div>

      {friends.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserMinus size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">
            Vous n'avez pas encore d'amis. Recherchez des personnes pour commencer !
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {friends.map((friend) => (
            <div
              key={friend.friendshipId}
              className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition group"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {friend.image ? (
                    <img src={friend.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-blue-700 font-bold text-xl">
                      {(friend.name || friend.email)[0]?.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{friend.name || "Anonyme"}</p>
                  <p className="text-sm text-gray-500 truncate mb-3">{friend.email}</p>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/chat?userId=${friend.id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition text-center"
                    >
                      Message
                    </Link>
                    <button
                      onClick={() => unfriend(friend.friendshipId)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition"
                    >
                      <UserMinus size={16} />
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
