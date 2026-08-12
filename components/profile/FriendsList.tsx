"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, MessageCircle, UserMinus } from "lucide-react";

interface Friend {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  friendshipId: string;
}

interface FriendsListProps {
  userId?: string;
  isOwnProfile: boolean;
}

export default function FriendsList({ userId, isOwnProfile }: FriendsListProps) {
  const { data: session } = useSession();
  const router = useRouter();

  console.log("FriendsList component - userId prop:", userId, "isOwnProfile:", isOwnProfile);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, [userId]);

  const fetchFriends = async () => {
    try {
      const url = userId 
        ? `/api/friends/list?userId=${userId}`
        : "/api/friends/list";
      console.log("FriendsList - fetching from:", url);
      const res = await fetch(url);
      const data = await res.json();
      console.log("FriendsList - response data:", data);
      setFriends(data.users || []);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriend = async (friendshipId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet ami ?")) return;

    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchFriends();
      }
    } catch (error) {
      console.error("Error unfriending:", error);
    }
  };

  const handleMessage = (friendId: string) => {
    router.push(`/chat?userId=${friendId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <User size={48} className="mx-auto mb-4 text-gray-300" />
        <p>Aucun ami pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
        >
          <div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400 flex items-center justify-center text-white font-semibold cursor-pointer"
            onClick={() => router.push(`/profile/${friend.id}`)}
          >
            {friend.image ? (
              <img
                src={friend.image}
                alt={friend.name || "Friend"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              (friend.name || "U").charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-gray-900 truncate cursor-pointer hover:text-emerald-600"
              onClick={() => router.push(`/profile/${friend.id}`)}
            >
              {friend.name || "Utilisateur"}
            </h3>
            {friend.bio && (
              <p className="text-sm text-gray-500 truncate">{friend.bio}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleMessage(friend.id)}
              className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
              title="Envoyer un message"
            >
              <MessageCircle size={20} />
            </button>
            {isOwnProfile && (
              <button
                onClick={() => handleUnfriend(friend.friendshipId)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                title="Supprimer l'ami"
              >
                <UserMinus size={20} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
