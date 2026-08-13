"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import LiveKitRoom from "@/components/livekit/LiveKitRoom";
import { TrainingRoom } from "@/types/training";

interface TrainingLiveKitRoomProps {
  room: TrainingRoom;
  userName: string;
}

export default function TrainingLiveKitRoom({ room, userName }: TrainingLiveKitRoomProps) {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchToken();
  }, [roomId]);

  const fetchToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/training/rooms/${roomId}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la récupération du token");
      }

      const data = await res.json();
      setToken(data.token);
      setUrl(data.url);
    } catch (err) {
      console.error("Erreur fetch token:", err);
      setError("Impossible de rejoindre la formation");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Connexion à la formation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchToken}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!token || !url) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">En attente de connexion...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-900">{room.title}</h2>
        {room.description && (
          <p className="text-gray-600 mt-2">{room.description}</p>
        )}
      </div>
      
      <LiveKitRoom
        token={token}
        serverUrl={url}
        roomName={`training-${roomId}`}
        onConnected={() => console.log("Connecté à la formation")}
        onDisconnected={() => {
          console.log("Déconnecté de la formation");
          router.back();
        }}
      />
    </div>
  );
}
