"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import type { FriendRequest } from "@/types/friends";

export default function FriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/friends?status=PENDING");
      const data = await res.json();
      const incomingRequests = (data.users || []).filter((u: any) => !u.isSender);
      
      // Add mutual friends count for each request
      const requestsWithMutual = await Promise.all(
        incomingRequests.map(async (req: any) => {
          try {
            const mutualRes = await fetch(`/api/friends/mutual/${req.id}`);
            const mutualData = await mutualRes.json();
            return {
              ...req,
              mutualFriends: mutualData.mutualFriends?.length || 0,
            };
          } catch {
            return { ...req, mutualFriends: 0 };
          }
        })
      );
      
      setRequests(requestsWithMutual);
    } catch (error) {
      console.error("Fetch requests error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (friendshipId: string, action: "accept" | "reject") => {
    try {
      const endpoint = action === "accept" ? "/api/friends/accept" : "/api/friends/reject";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendshipId }),
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.friendshipId !== friendshipId));
      }
    } catch (error) {
      console.error("Handle request error:", error);
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
      <h2 className="text-xl font-bold text-gray-900 mb-6">Demandes reçues</h2>
      
      {requests.length === 0 ? (
        <p className="text-gray-500 text-sm py-8 text-center">Aucune demande en attente</p>
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
                  <p className="text-sm text-gray-500 truncate mb-1">{request.email}</p>
                  {(request.mutualFriends ?? 0) > 0 && (
                    <p className="text-xs text-gray-400 mb-3">{request.mutualFriends} amis communs</p>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequest(request.friendshipId, "accept")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      Accepter
                    </button>
                    <button
                      onClick={() => handleRequest(request.friendshipId, "reject")}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      Refuser
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
