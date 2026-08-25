"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

interface PrayerChain {
  id: string;
  title: string;
  visibility: string;
}

interface PrayerRoom {
  id: string;
  title: string;
  roomType: string;
  isActive: boolean;
}

export default function PrayerCampaignSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<any>(null);
  const [chains, setChains] = useState<PrayerChain[]>([]);
  const [rooms, setRooms] = useState<PrayerRoom[]>([]);
  const [selectedChainIds, setSelectedChainIds] = useState<Set<string>>(new Set());
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCampaign();
    fetchChains();
    fetchRooms();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/prayers/campaigns/${campaignId}`);
      const data = await res.json();
      setCampaign(data.campaign);
      
      // Load currently associated chains
      const chainsRes = await fetch(`/api/prayers/campaigns/${campaignId}/chains`);
      const chainsData = await chainsRes.json();
      setSelectedChainIds(new Set(chainsData.chains?.map((c: any) => c.id) || []));
      
      // Load currently associated rooms
      const roomsRes = await fetch(`/api/prayers/campaigns/${campaignId}/rooms`);
      const roomsData = await roomsRes.json();
      setSelectedRoomIds(new Set(roomsData.rooms?.map((r: any) => r.id) || []));
    } catch (error) {
      console.error("Erreur récupération campagne:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChains = async () => {
    try {
      const res = await fetch("/api/prayers/chain");
      const data = await res.json();
      setChains(data.chains || []);
    } catch (error) {
      console.error("Erreur récupération chaînes:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/prayers/rooms");
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error("Erreur récupération salles:", error);
    }
  };

  const handleToggleChain = (chainId: string) => {
    const newSelected = new Set(selectedChainIds);
    if (newSelected.has(chainId)) {
      newSelected.delete(chainId);
    } else {
      newSelected.add(chainId);
    }
    setSelectedChainIds(newSelected);
  };

  const handleToggleRoom = (roomId: string) => {
    const newSelected = new Set(selectedRoomIds);
    if (newSelected.has(roomId)) {
      newSelected.delete(roomId);
    } else {
      newSelected.add(roomId);
    }
    setSelectedRoomIds(newSelected);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save chains
      await fetch(`/api/prayers/campaigns/${campaignId}/chains`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chainIds: Array.from(selectedChainIds) }),
      });
      
      // Save rooms
      await fetch(`/api/prayers/campaigns/${campaignId}/rooms`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomIds: Array.from(selectedRoomIds) }),
      });
      
      router.push(`/prayers/campaigns/${campaignId}`);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Paramètres: {campaign?.title}
        </h1>
        <p className="text-gray-600 mt-1">
          Associez des chaînes et des salles de prière à cette campagne
        </p>
      </div>

      {/* Chains List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Chaînes de prière</h2>
          <p className="text-sm text-gray-600 mt-1">
            Sélectionnez les chaînes à associer à cette campagne
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {chains.length === 0 ? (
            <div className="p-4 text-center text-gray-600">
              Aucune chaîne disponible
            </div>
          ) : (
            chains.map((chain) => (
              <div
                key={chain.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{chain.title}</h3>
                  <p className="text-sm text-gray-600">{chain.visibility}</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedChainIds.has(chain.id)}
                    onChange={() => handleToggleChain(chain.id)}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rooms List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Salles de prière</h2>
          <p className="text-sm text-gray-600 mt-1">
            Sélectionnez les salles à associer directement à cette campagne
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {rooms.length === 0 ? (
            <div className="p-4 text-center text-gray-600">
              Aucune salle disponible
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{room.title}</h3>
                  <p className="text-sm text-gray-600">{room.roomType}</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoomIds.has(room.id)}
                    onChange={() => handleToggleRoom(room.id)}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                </label>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
