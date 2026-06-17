"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserPlus, UserCheck, UserMinus, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  createdAt: string;
};

type FriendshipStatus = "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "BLOCKED";

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>("NONE");
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetchUserProfile();
    fetchFriendshipStatus();
  }, [session, params.userId]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`/api/users/${params.userId}`);
      if (!res.ok) {
        router.push("/profile");
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch (e) {
      console.error(e);
      router.push("/profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendshipStatus = async () => {
    try {
      const res = await fetch(`/api/friends/check?userId=${params.userId}`);
      const data = await res.json();
      setFriendshipStatus(data.status || "NONE");
      setFriendshipId(data.friendshipId || null);
    } catch (e) {
      console.error(e);
    }
  };

  const sendFriendRequest = async () => {
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: params.userId }),
      });

      if (res.ok) {
        setFriendshipStatus("PENDING_SENT");
        const data = await res.json();
        setFriendshipId(data.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const acceptFriendRequest = async () => {
    if (!friendshipId) return;
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });

      if (res.ok) {
        setFriendshipStatus("ACCEPTED");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unfriend = async () => {
    if (!friendshipId) return;
    if (!confirm("Voulez-vous vraiment supprimer cet ami ?")) return;

    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFriendshipStatus("NONE");
        setFriendshipId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow w-full max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow w-full max-w-md">
          <p className="text-center text-gray-500">Utilisateur non trouvé</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = session?.user?.id === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      <Navbar onLoginClick={() => {}} />
      <div className="p-4 md:p-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow w-full max-w-md space-y-4">
          <div className="flex items-start gap-4">
            <img
              src={user.image || "/avatar.png"}
              alt={user.name || "Avatar utilisateur"}
              className="w-20 h-20 rounded-full"
            />

            <div className="flex-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">{user.name || "Anonyme"}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              {user.bio && <p className="mt-2 text-gray-700 text-sm">{user.bio}</p>}
            </div>
          </div>

        {!isOwnProfile && (
          <div className="flex gap-2 pt-4 border-t">
            {friendshipStatus === "NONE" && (
              <button
                onClick={sendFriendRequest}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
              >
                <UserPlus size={18} />
                Ajouter aux amis
              </button>
            )}

            {friendshipStatus === "PENDING_SENT" && (
              <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium">
                <UserPlus size={18} />
                Demande envoyée
              </div>
            )}

            {friendshipStatus === "PENDING_RECEIVED" && (
              <button
                onClick={acceptFriendRequest}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
              >
                <UserCheck size={18} />
                Accepter la demande
              </button>
            )}

            {friendshipStatus === "ACCEPTED" && (
              <>
                <button
                  onClick={() => router.push(`/chat?userId=${user.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-medium hover:bg-emerald-100 transition"
                >
                  <MessageCircle size={18} />
                  Message
                </button>
                <button
                  onClick={unfriend}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition"
                >
                  <UserMinus size={18} />
                  Supprimer
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
