"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Flame } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import PrayerCard from "@/components/prayer/PrayerCard";
import PrayerForm from "@/components/prayer/PrayerForm";
import PrayerSidebarLeft from "@/components/prayer/PrayerSidebarLeft";
import PrayerSidebarRight from "@/components/prayer/PrayerSidebarRight";
import PrayerDetailModal from "@/components/prayer/PrayerDetailModal";
import type { PrayerRequestWithUser, PrayerChainWithLinks, PrayerLiveRoomWithCount } from "@/types/prayer";

type Tab = "feed" | "urgent" | "answered" | "chains";

export default function PrayerSpacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [prayers, setPrayers] = useState<PrayerRequestWithUser[]>([]);
  const [urgentPrayers, setUrgentPrayers] = useState<PrayerRequestWithUser[]>([]);
  const [chains, setChains] = useState<PrayerChainWithLinks[]>([]);
  const [rooms, setRooms] = useState<PrayerLiveRoomWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("recent");
  const [showForm, setShowForm] = useState(false);
  const [detailPrayer, setDetailPrayer] = useState<PrayerRequestWithUser | null>(null);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());
  const [mobileTab, setMobileTab] = useState<Tab>("feed");

  const fetchPrayers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    params.set("filter", activeFilter);
    const res = await fetch(`/api/prayers?${params.toString()}`);
    const data = await res.json();
    setPrayers(data.prayers || []);

    // Fetch urgent separately for top banner
    const urgentRes = await fetch(`/api/prayers?filter=urgent&limit=3`);
    const urgentData = await urgentRes.json();
    setUrgentPrayers(urgentData.prayers || []);
    setLoading(false);
  }, [activeCategory, activeFilter]);

  const fetchSidebars = useCallback(async () => {
    const [chainRes, roomRes] = await Promise.all([
      fetch("/api/prayers/chain"),
      fetch("/api/prayers/live"),
    ]);
    const chainData = await chainRes.json();
    const roomData = await roomRes.json();
    setChains(chainData.chains || []);
    setRooms(roomData.rooms || []);
  }, []);

  useEffect(() => {
    fetchPrayers();
    fetchSidebars();
  }, [fetchPrayers, fetchSidebars]);

  const handlePray = async (id: string) => {
    const res = await fetch("/api/prayers/pray", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayerRequestId: id, type: "PRAY" }),
    });
    const data = await res.json();
    if (data.prayed) {
      setPrayedIds((prev) => new Set(prev).add(id));
    } else {
      setPrayedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
    fetchPrayers();
  };

  const handleCreate = async (data: { title: string; content: string; category: string; isUrgent: boolean }) => {
    await fetch("/api/prayers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    fetchPrayers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette demande ?")) return;
    await fetch(`/api/prayers/${id}`, { method: "DELETE" });
    fetchPrayers();
  };

  const handleRespond = async (id: string, content: string, type: string) => {
    await fetch("/api/prayers/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayerRequestId: id, content, type }),
    });
    if (detailPrayer?.id === id) {
      const res = await fetch(`/api/prayers/${id}`);
      const data = await res.json();
      setDetailPrayer(data.prayer);
    }
    fetchPrayers();
  };

  const handleVerse = async (id: string, reference: string, text?: string) => {
    await fetch("/api/prayers/verse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayerRequestId: id, reference, text }),
    });
    if (detailPrayer?.id === id) {
      const res = await fetch(`/api/prayers/${id}`);
      const data = await res.json();
      setDetailPrayer(data.prayer);
    }
    fetchPrayers();
  };

  const handleTestimony = async (id: string, content: string) => {
    await fetch("/api/prayers/testimony", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayerRequestId: id, content }),
    });
    if (detailPrayer?.id === id) {
      const res = await fetch(`/api/prayers/${id}`);
      const data = await res.json();
      setDetailPrayer(data.prayer);
    }
    fetchPrayers();
  };

  const openDetail = async (prayer: PrayerRequestWithUser) => {
    const res = await fetch(`/api/prayers/${prayer.id}`);
    const data = await res.json();
    setDetailPrayer(data.prayer);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      {/* Navbar */}
      <Navbar onLoginClick={() => router.push("/login")} />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">Espace de Prière</h1>
            <p className="text-xs text-gray-400">Unis dans la foi, forts dans la prière</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-purple-600 text-white text-sm font-medium hover:shadow-lg transition"
          >
            <Plus size={16} /> Nouvelle demande
          </button>
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="lg:hidden flex border-b bg-white">
        {([
          { key: "feed", label: "Flux" },
          { key: "urgent", label: "Urgentes" },
          { key: "answered", label: "Exaucées" },
          { key: "chains", label: "Chaînes" },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setMobileTab(t.key)}
            className={`flex-1 py-3 text-sm font-medium transition border-b-2 ${
              mobileTab === t.key
                ? "border-emerald-500 text-emerald-700"
                : "border-transparent text-gray-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar - hidden on mobile */}
        <div className="hidden lg:block lg:col-span-3">
          <PrayerSidebarLeft
            activeCategory={activeCategory}
            activeFilter={activeFilter}
            onCategoryChange={setActiveCategory}
            onFilterChange={setActiveFilter}
          />
        </div>

        {/* Center feed */}
        <div className="lg:col-span-6 space-y-4">
          {/* Urgent banner */}
          {urgentPrayers.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={18} className="text-red-500" />
                <h2 className="font-bold text-red-700 text-sm">Demandes urgentes</h2>
              </div>
              <div className="space-y-3">
                {urgentPrayers.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => openDetail(p)}
                    className="cursor-pointer p-3 rounded-xl bg-white hover:shadow-sm transition"
                  >
                    <p className="font-medium text-sm text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile-only sidebars */}
          {mobileTab === "chains" && (
            <div className="lg:hidden">
              <div className="bg-white rounded-2xl border p-4 mb-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3">Chaînes de prière</h3>
                {chains.length === 0 ? (
                  <p className="text-xs text-gray-400">Aucune chaîne active.</p>
                ) : (
                  chains.map((chain) => (
                    <div key={chain.id} className="p-3 rounded-xl bg-gray-50 mb-2">
                      <p className="font-medium text-sm text-gray-800">{chain.title}</p>
                      <p className="text-xs text-gray-500">{chain._count?.links || 0} prient</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Feed */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
          ) : prayers.length === 0 ? (
            <div className="bg-white rounded-2xl border p-8 text-center">
              <p className="text-gray-400 text-sm">Aucune demande de prière pour le moment.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-emerald-600 text-sm font-medium hover:underline"
              >
                Soyez le premier à partager une demande
              </button>
            </div>
          ) : (
            prayers.map((prayer) => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                onPray={handlePray}
                onOpenDetail={openDetail}
                onDelete={handleDelete}
                hasPrayed={prayedIds.has(prayer.id)}
              />
            ))
          )}
        </div>

        {/* Right sidebar - hidden on mobile */}
        <div className="hidden lg:block lg:col-span-3">
          <PrayerSidebarRight chains={chains} rooms={rooms} />
        </div>
      </main>

      {/* Modals */}
      {showForm && (
        <PrayerForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}
      {detailPrayer && (
        <PrayerDetailModal
          prayer={detailPrayer}
          onClose={() => setDetailPrayer(null)}
          onPray={handlePray}
          onRespond={handleRespond}
          onVerse={handleVerse}
          onTestimony={handleTestimony}
          hasPrayed={prayedIds.has(detailPrayer.id)}
        />
      )}
    </div>
  );
}
