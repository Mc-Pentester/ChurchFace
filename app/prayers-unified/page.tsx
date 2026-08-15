"use client";

import { useState, useEffect, useMemo } from 'react';
import UnifiedPrayerCard from '@/components/prayer/UnifiedPrayerCard';
import { UnifiedPrayer, UnifiedPrayerFilters, PrayerType } from '@/types/prayer';
import { Search } from 'lucide-react';

export default function UnifiedPrayersPage() {
  const [prayers, setPrayers] = useState<UnifiedPrayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PrayerType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPrayers = async (typeFilter: PrayerType | "ALL") => {
    try {
      setLoading(true);
      const url = typeFilter === "ALL" 
        ? "/api/prayers-unified"
        : `/api/prayers-unified?type=${typeFilter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setPrayers(data.prayers || []);
    } catch (error) {
      console.error("Erreur récupération prières:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayers(filter);
  }, [filter]);

  // Filtrer les prières basé sur la recherche
  const filteredPrayers = useMemo(() => {
    if (!searchQuery.trim()) return prayers;
    
    const query = searchQuery.toLowerCase();
    return prayers.filter(prayer => 
      prayer.title.toLowerCase().includes(query) ||
      (prayer.content && prayer.content.toLowerCase().includes(query)) ||
      (prayer.description && prayer.description.toLowerCase().includes(query)) ||
      (prayer.category && prayer.category.toLowerCase().includes(query))
    );
  }, [prayers, searchQuery]);

  const handlePray = async (id: string) => {
    try {
      const response = await fetch('/api/prayers/pray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prayerId: id })
      });
      
      if (response.ok) {
        // Vérifier si la réponse a du contenu avant de parser
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          alert('✅ Prière enregistrée avec succès');
        } else {
          alert('✅ Prière enregistrée avec succès');
        }
        // Recharger les données
        fetchPrayers(filter);
      } else {
        // Essayer de parser l'erreur si possible
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          alert(`❌ Erreur: ${error.error || 'Impossible de prier'}`);
        } else {
          alert(`❌ Erreur: Impossible de prier (Status: ${response.status})`);
        }
      }
    } catch (error) {
      console.error("Erreur prière:", error);
      alert('❌ Erreur de connexion');
    }
  };

  const handleJoin = async (id: string) => {
    try {
      // Récupérer les détails de la prière pour déterminer le type
      const prayer = prayers.find(p => p.id === id);
      if (!prayer) {
        alert('❌ Prière non trouvée');
        return;
      }

      let url, body;
      
      if (prayer.type === 'COLLABORATIVE_CHAIN') {
        // Utiliser l'API existante pour les chaînes
        url = '/api/prayers/chain';
        body = JSON.stringify({ action: 'join', chainId: id });
      } else if (prayer.type === 'LIVE_ROOM') {
        // Pour les salles live, utiliser le bouton Voir à la place
        // car les pages existantes ne supportent pas PrayerLiveRoom
        window.location.href = `/prayers/rooms/${id}`;
        return;
      } else {
        alert('⚠️ Impossible de rejoindre ce type de prière');
        return;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          await response.json(); // Consommer le JSON
        }
        alert('✅ Rejoint avec succès');
        fetchPrayers(filter);
      } else {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          alert(`❌ Erreur: ${error.error || 'Impossible de rejoindre'}`);
        } else {
          alert(`❌ Erreur: Impossible de rejoindre (Status: ${response.status})`);
        }
      }
    } catch (error) {
      console.error("Erreur rejoindre:", error);
      alert('❌ Erreur de connexion');
    }
  };

  const handleView = (id: string) => {
    // Rediriger vers la page appropriée selon le type
    const prayer = prayers.find(p => p.id === id);
    if (!prayer) return;
    
    switch (prayer.type) {
      case 'INDIVIDUAL':
        // Pour les prières individuelles, rediriger vers prayer-space
        window.location.href = '/prayer-space';
        break;
      case 'COLLABORATIVE_CHAIN':
        // Les pages existantes utilisent PrayerChain, pas Prayer
        // On redirige vers la page qui utilise l'ancien modèle
        window.location.href = `/prayers/chains/${id}`;
        break;
      case 'COLLABORATIVE_CAMPAIGN':
        // Les pages existantes utilisent PrayerCampaign, pas Prayer
        // On redirige vers la page qui utilise l'ancien modèle
        window.location.href = `/prayers/campaigns/${id}`;
        break;
      case 'LIVE_ROOM':
        // Pour les salles live, utiliser la page /prayers/rooms/[id]
        window.location.href = `/prayers/rooms/${id}`;
        break;
    }
  };

  const handleSettings = (id: string) => {
    const prayer = prayers.find(p => p.id === id);
    if (!prayer) return;
    
    switch (prayer.type) {
      case 'COLLABORATIVE_CHAIN':
        window.location.href = `/prayers/chains/${id}/settings`;
        break;
      case 'COLLABORATIVE_CAMPAIGN':
        window.location.href = `/prayers/campaigns/${id}/settings`;
        break;
      default:
        alert('⚙️ Paramètres non disponibles pour ce type');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Réseau d'Intercession Collaborative
          </h1>
          <p className="text-gray-600">
            Démonstration du nouveau système unifié de prière
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher des prières..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-lg ${
              filter === "ALL"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter("INDIVIDUAL")}
            className={`px-4 py-2 rounded-lg ${
              filter === "INDIVIDUAL"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Demandes individuelles
          </button>
          <button
            onClick={() => setFilter("COLLABORATIVE_CHAIN")}
            className={`px-4 py-2 rounded-lg ${
              filter === "COLLABORATIVE_CHAIN"
                ? "bg-purple-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Chaînes collaboratives
          </button>
          <button
            onClick={() => setFilter("COLLABORATIVE_CAMPAIGN")}
            className={`px-4 py-2 rounded-lg ${
              filter === "COLLABORATIVE_CAMPAIGN"
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Campagnes collaboratives
          </button>
          <button
            onClick={() => setFilter("LIVE_ROOM")}
            className={`px-4 py-2 rounded-lg ${
              filter === "LIVE_ROOM"
                ? "bg-green-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Salles live
          </button>
        </div>

        {/* Statistiques */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-500">
              {filteredPrayers.filter(p => p.type === "INDIVIDUAL").length}
            </div>
            <div className="text-sm text-gray-600">Demandes individuelles</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-500">
              {filteredPrayers.filter(p => p.type === "COLLABORATIVE_CHAIN").length}
            </div>
            <div className="text-sm text-gray-600">Chaînes collaboratives</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-500">
              {filteredPrayers.filter(p => p.type === "COLLABORATIVE_CAMPAIGN").length}
            </div>
            <div className="text-sm text-gray-600">Campagnes collaboratives</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-500">
              {filteredPrayers.filter(p => p.type === "LIVE_ROOM").length}
            </div>
            <div className="text-sm text-gray-600">Salles live</div>
          </div>
        </div>

        {/* Liste des prières */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Chargement...</div>
          </div>
        ) : filteredPrayers.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <div className="text-gray-500">
              {searchQuery ? "Aucune prière ne correspond à votre recherche" : "Aucune prière trouvée pour ce filtre"}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrayers.map((prayer) => (
              <UnifiedPrayerCard
                key={prayer.id}
                prayer={prayer}
                onPray={handlePray}
                onJoin={handleJoin}
                onView={handleView}
                onSettings={handleSettings}
              />
            ))}
          </div>
        )}

        {/* Informations sur la migration */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            🔄 Migration en cours
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Phase 1: Modèle unifié créé</li>
            <li>✅ Phase 2: Données migrées</li>
            <li>✅ Phase 3: API unifiée opérationnelle</li>
            <li>✅ Phase 4: Composants frontend créés</li>
            <li>⏳ Phase 5: Nettoyage en attente de validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
