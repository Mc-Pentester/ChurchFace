"use client";

import { useEffect, useState } from "react";
import { Check, X, User } from "lucide-react";

type FriendRequest = {
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

export default function FriendRequestsList() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/friends?status=PENDING");
      const data = await res.json();
      setRequests(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (friendshipId: string, action: "ACCEPTED" | "DECLINED") => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.friendshipId !== friendshipId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const cancelRequest = async (friendshipId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendshipId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.friendshipId !== friendshipId));
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

  const incomingRequests = requests.filter((r) => !r.isSender);
  const outgoingRequests = requests.filter((r) => r.isSender);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
      <h3 className="font-semibold text-gray-800">Demandes d'ami</h3>

      {incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-4">Aucune demande en attente</p>
      ) : (
        <>
          {incomingRequests.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reçues</p>
              {incomingRequests.map((request) => (
                <div
                  key={request.friendshipId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                    {request.image ? (
                      <img src={request.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-emerald-700 font-semibold text-sm">
                        {(request.name || request.email)[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{request.name || "Anonyme"}</p>
                    <p className="text-xs text-gray-500 truncate">{request.email}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequest(request.friendshipId, "ACCEPTED")}
                      className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                      title="Accepter"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleRequest(request.friendshipId, "DECLINED")}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                      title="Refuser"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {outgoingRequests.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-4">Envoyées</p>
              {outgoingRequests.map((request) => (
                <div
                  key={request.friendshipId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {request.image ? (
                      <img src={request.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-600 font-semibold text-sm">
                        {(request.name || request.email)[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{request.name || "Anonyme"}</p>
                    <p className="text-xs text-gray-500 truncate">En attente</p>
                  </div>

                  <button
                    onClick={() => cancelRequest(request.friendshipId)}
                    className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition"
                    title="Annuler"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
