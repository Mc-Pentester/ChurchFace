"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type SentRequest = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  church: string | null;
  city: string | null;
  friendshipId: string;
  createdAt: string;
};

export default function SentRequests() {
  const [requests, setRequests] = useState<SentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/friends?status=PENDING");
      const data = await res.json();
      const sentRequests = (data.users || []).filter((u: any) => u.isSender);
      setRequests(sentRequests);
    } catch (error) {
      console.error("Fetch sent requests error:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async (friendshipId: string) => {
    if (!confirm("Voulez-vous vraiment annuler cette demande ?")) return;

    try {
      const res = await fetch("/api/friends/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId }),
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.friendshipId !== friendshipId));
      }
    } catch (error) {
      console.error("Cancel request error:", error);
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
      <h2 className="text-xl font-bold text-gray-900 mb-6">Demandes envoyées</h2>
      
      {requests.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">Aucune demande envoyée</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.friendshipId}
              className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {request.image ? (
                    <img src={request.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-emerald-700 font-bold text-xl">
                      {(request.name || request.email)[0]?.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{request.name || "Anonyme"}</p>
                  <p className="text-sm text-gray-500 truncate mb-1">{request.church || request.email}</p>
                  <p className="text-xs text-gray-400 mb-3">
                    Envoyé le {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                  
                  <button
                    onClick={() => cancelRequest(request.friendshipId)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition flex items-center gap-2"
                  >
                    <X size={16} />
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
