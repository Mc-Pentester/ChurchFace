"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PrayerCampaign, PrayerChainWithLinks } from "@/types/prayer";
import { usePrayerCampaigns } from "@/hooks/usePrayers";
import { ArrowLeft, Calendar, Users, Flame, Church, Globe, Share2, Settings } from "lucide-react";

export default function PrayerCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<PrayerCampaign | null>(null);
  const [chains, setChains] = useState<PrayerChainWithLinks[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prayers/campaigns");
      const data = await res.json();
      const foundCampaign = data.find((c: PrayerCampaign) => c.id === campaignId);
      setCampaign(foundCampaign || null);

      // Récupérer les chaînes associées à cette campagne
      if (foundCampaign) {
        const chainsRes = await fetch(`/api/prayers/chain`);
        const chainsData = await chainsRes.json();
        const campaignChains = chainsData.chains?.filter(
          (c: PrayerChainWithLinks) => c.prayerCampaignId === campaignId
        );
        setChains(campaignChains || []);
      }
    } catch (error) {
      console.error("Erreur récupération campagne:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Campagne non trouvée</h1>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const CAMPAIGN_ICONS = {
    FAST: Flame,
    PRAYER: Users,
    VIGIL: Calendar,
    NATIONAL: Globe,
    GLOBAL: Globe,
  };

  const CAMPAIGN_LABELS = {
    FAST: "Jeûne",
    PRAYER: "Prière",
    VIGIL: "Veillée",
    NATIONAL: "National",
    GLOBAL: "Global",
  };

  const Icon = CAMPAIGN_ICONS[campaign.type];
  const label = CAMPAIGN_LABELS[campaign.type];
  const daysRemaining = Math.ceil(
    (new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">{label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  campaign.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {campaign.isActive ? "Actif" : "Terminé"}
                </span>
              </div>
            </div>
            {campaign.description && (
              <p className="text-gray-600 mt-2">{campaign.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Share2 className="w-4 h-4" />
              Partager
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Settings className="w-4 h-4" />
              Paramètres
            </button>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      {campaign.imageUrl && (
        <div className="mb-6 rounded-xl overflow-hidden">
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{chains.length}</p>
              <p className="text-sm text-gray-600">Chaînes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{daysRemaining}</p>
              <p className="text-sm text-gray-600">Jours restants</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm font-bold text-gray-900">
                {new Date(campaign.startDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">Début</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm font-bold text-gray-900">
                {new Date(campaign.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">Fin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Church Info */}
      {campaign.church && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <Church className="w-6 h-6 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Organisé par</p>
              <p className="font-semibold text-gray-900">{campaign.church.name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chains List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Chaînes de prière associées</h2>
          <p className="text-sm text-gray-600 mt-1">
            {chains.length} chaîne{chains.length !== 1 ? "s" : ""} liée{chains.length !== 1 ? "s" : ""} à cette campagne
          </p>
        </div>

        <div className="p-6">
          {chains.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Aucune chaîne associée à cette campagne</p>
          ) : (
            <div className="space-y-4">
              {chains.map((chain) => (
                <div
                  key={chain.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => router.push(`/prayers/chains/${chain.id}`)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{chain.title}</h3>
                    {chain.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{chain.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{chain._count?.links || 0} participants</span>
                    </div>
                    <span className="text-blue-600">Voir →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
