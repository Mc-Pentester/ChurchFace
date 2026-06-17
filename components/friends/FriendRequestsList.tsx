"use client";

import { useEffect, useState } from "react";
import { Check, X, UserPlus } from "lucide-react";

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
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 bg-blue-500/10" />
        </div>
      </div>
    );
  }

  const incomingRequests = requests.filter((r) => !r.isSender);
  const outgoingRequests = requests.filter((r) => r.isSender);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Demandes d'ami</h3>
        <span className="text-sm text-gray-500">{incomingRequests.length} reçues</span>
      </div>

      {incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">Aucune demande en attente</p>
        </div>
      ) : (
        <>
          {incomingRequests.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700">Reçues</p>
              {incomingRequests.map((request) => (
                <div
                  key={request.friendshipId}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {request.image ? (
                        <img src={request.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-blue-700 font-bold text-xl">
                          {(request.name || request.email)[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{request.name || "Anonyme"}</p>
                      <p className="text-sm text-gray-500 truncate mb-3">{request.email}</p>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequest(request.friendshipId, "ACCEPTED")}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => handleRequest(request.friendshipId, "DECLINED")}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {outgoingRequests.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-gray-700 mt-6">Envoyées</p>
              {outgoingRequests.map((request) => (
                <div
                  key={request.friendshipId}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {request.image ? (
                        <img src={request.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-600 font-bold text-xl">
                          {(request.name || request.email)[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{request.name || "Anonyme"}</p>
                      <p className="text-sm text-gray-500 truncate mb-3">En attente de réponse</p>
                      
                      <button
                        onClick={() => cancelRequest(request.friendshipId)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition"
                      >
                        Annuler la demande
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
