"use client";

import { useEffect, useState } from "react";
import { UserPlus, Check, X, UserMinus, MessageCircle } from "lucide-react";
import Link from "next/link";

type FriendshipStatus = "NONE" | "PENDING" | "RECEIVED" | "ACCEPTED" | "DECLINED" | "BLOCKED";

interface ProfileFriendActionsProps {
  userId: string;
}

export default function ProfileFriendActions({ userId }: ProfileFriendActionsProps) {
  const [status, setStatus] = useState<FriendshipStatus>("NONE");
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriendshipStatus();
  }, [userId]);

  const fetchFriendshipStatus = async () => {
    try {
      const res = await fetch(`/api/friends?status=PENDING`);
      const data = await res.json();
      const friendships = data.users || [];
      
      const friendship = friendships.find((f: any) => f.id === userId);
      if (friendship) {
        setFriendshipId(friendship.friendshipId);
        if (friendship.isSender) {
          setStatus("PENDING");
        } else {
          setStatus("RECEIVED");
        }
      } else {
        // Check if already friends
        const friendsRes = await fetch("/api/friends/list");
        const friendsData = await friendsRes.json();
        const isFriend = (friendsData.users || []).some((f: any) => f.id === userId);
        setStatus(isFriend ? "ACCEPTED" : "NONE");
      }
    } catch (error) {
      console.error("Fetch friendship status error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFriendshipId(data.id);
        setStatus("PENDING");
      }
    } catch (error) {
      console.error("Send request error:", error);
    }
  };

  const acceptRequest = async () => {
    if (!friendshipId) return;
    try {
      const res = await fetch("/api/friends/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId }),
      });
      if (res.ok) {
        setStatus("ACCEPTED");
      }
    } catch (error) {
      console.error("Accept request error:", error);
    }
  };

  const rejectRequest = async () => {
    if (!friendshipId) return;
    try {
      const res = await fetch("/api/friends/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId }),
      });
      if (res.ok) {
        setStatus("NONE");
        setFriendshipId(null);
      }
    } catch (error) {
      console.error("Reject request error:", error);
    }
  };

  const cancelRequest = async () => {
    if (!friendshipId) return;
    try {
      const res = await fetch("/api/friends/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId }),
      });
      if (res.ok) {
        setStatus("NONE");
        setFriendshipId(null);
      }
    } catch (error) {
      console.error("Cancel request error:", error);
    }
  };

  const unfriend = async () => {
    if (!confirm("Voulez-vous vraiment supprimer cet ami ?")) return;
    
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStatus("NONE");
        setFriendshipId(null);
      }
    } catch (error) {
      console.error("Unfriend error:", error);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-10 rounded-lg w-32" />;
  }

  if (status === "NONE") {
    return (
      <button
        onClick={sendFriendRequest}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition flex items-center gap-2"
      >
        <UserPlus size={18} />
        Ajouter ami
      </button>
    );
  }

  if (status === "PENDING") {
    return (
      <button
        onClick={cancelRequest}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-lg transition flex items-center gap-2"
      >
        <X size={18} />
        Annuler
      </button>
    );
  }

  if (status === "RECEIVED") {
    return (
      <div className="flex gap-2">
        <button
          onClick={acceptRequest}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center gap-2"
        >
          <Check size={18} />
          Accepter
        </button>
        <button
          onClick={rejectRequest}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition flex items-center gap-2"
        >
          <X size={18} />
          Refuser
        </button>
      </div>
    );
  }

  if (status === "ACCEPTED") {
    return (
      <div className="flex gap-2">
        <Link
          href={`/chat?userId=${userId}`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center gap-2"
        >
          <MessageCircle size={18} />
          Message
        </Link>
        <button
          onClick={unfriend}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition flex items-center gap-2"
        >
          <UserMinus size={18} />
          Supprimer
        </button>
      </div>
    );
  }

  return null;
}
