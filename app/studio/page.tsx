"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Video, Radio, Clock, Users } from "lucide-react";
import { BroadcastContextService } from "@/lib/broadcast/BroadcastContextService";

export default function StudioPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      loadBroadcasts();
    }
  }, [session]);

  const loadBroadcasts = async () => {
    try {
      const res = await fetch("/api/studio/broadcast");
      if (res.ok) {
        const data = await res.json();
        setBroadcasts(data.broadcasts || []);
      }
    } catch (error) {
      console.error("Error loading broadcasts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBroadcast = async () => {
    try {
      const res = await fetch("/api/studio/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Nouvelle diffusion",
          ownerType: "USER",
          ownerId: session?.user?.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/studio/${data.broadcast.id}`);
      }
    } catch (error) {
      console.error("Error creating broadcast:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Studio ChurchFace</h1>
            <p className="text-gray-400">Gérez vos diffusions live</p>
          </div>
          <button
            onClick={handleCreateBroadcast}
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} />
            <span>Nouvelle diffusion</span>
          </button>
        </div>

        {/* Broadcasts Grid */}
        {broadcasts.length === 0 ? (
          <div className="bg-[#16161f] rounded-lg p-12 text-center">
            <Video size={48} className="mx-auto mb-4 text-gray-500" />
            <h2 className="text-xl font-semibold mb-2">Aucune diffusion</h2>
            <p className="text-gray-400 mb-6">Créez votre première diffusion pour commencer</p>
            <button
              onClick={handleCreateBroadcast}
              className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition"
            >
              <Plus size={20} />
              <span>Créer une diffusion</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {broadcasts.map((broadcast) => (
              <div
                key={broadcast.id}
                onClick={() => router.push(`/studio/${broadcast.id}`)}
                className="bg-[#16161f] rounded-lg p-6 cursor-pointer hover:bg-[#1f1f2e] transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-600/20 p-2 rounded-lg">
                      <Video size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{broadcast.title}</h3>
                      <p className="text-sm text-gray-400">{broadcast.ownerType}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    broadcast.status === "LIVE" 
                      ? "bg-red-600/20 text-red-400" 
                      : "bg-gray-600/20 text-gray-400"
                  }`}>
                    {broadcast.status}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{broadcast.viewerCount || 0}</span>
                  </div>
                  {broadcast.startedAt && (
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{new Date(broadcast.startedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
