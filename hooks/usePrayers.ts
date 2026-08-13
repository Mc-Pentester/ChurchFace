"use client";

import { useState, useCallback } from "react";
import type { PrayerRequestWithUser, PrayerParticipant, PrayerSchedule, PrayerRoom, PrayerCampaign, PrayerEngagement } from "@/types/prayer";

export function usePrayers() {
  const [prayers, setPrayers] = useState<PrayerRequestWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());

  const fetchPrayers = useCallback(async (params?: { 
    category?: string | null; 
    filter?: string; 
    page?: number; 
    limit?: number;
    churchId?: string;
  }) => {
    setLoading(true);
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.filter) searchParams.set("filter", params.filter);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.churchId) searchParams.set("churchId", params.churchId);

    const apiUrl = params?.churchId 
      ? `/api/church/prayers?${searchParams.toString()}`
      : `/api/prayers?${searchParams.toString()}`;

    const res = await fetch(apiUrl);
    const data = await res.json();
    setPrayers(data.prayers || []);
    setLoading(false);
    return data;
  }, []);

  const createPrayer = useCallback(async (data: { 
    title: string; 
    content: string; 
    category: string; 
    isUrgent: boolean;
    churchId?: string;
  }) => {
    const apiUrl = data.churchId 
      ? `/api/church/prayers?churchId=${data.churchId}`
      : "/api/prayers";

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }, []);

  const togglePray = useCallback(async (prayerRequestId: string) => {
    const res = await fetch("/api/prayers/pray", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayerRequestId, type: "PRAY" }),
    });
    const data = await res.json();
    setPrayedIds((prev) => {
      const next = new Set(prev);
      if (data.prayed) next.add(prayerRequestId);
      else next.delete(prayerRequestId);
      return next;
    });
    return data;
  }, []);

  const respond = useCallback(async (prayerRequestId: string, content: string, type = "COMMENT") => {
    const res = await fetch("/api/prayers/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayerRequestId, content, type }),
    });
    return res.json();
  }, []);

  const sendVerse = useCallback(async (prayerRequestId: string, reference: string, text?: string) => {
    const res = await fetch("/api/prayers/verse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayerRequestId, reference, text }),
    });
    return res.json();
  }, []);

  const addTestimony = useCallback(async (prayerRequestId: string, content: string) => {
    const res = await fetch("/api/prayers/testimony", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayerRequestId, content }),
    });
    return res.json();
  }, []);

  const deletePrayer = useCallback(async (id: string) => {
    const res = await fetch(`/api/prayers/${id}`, { method: "DELETE" });
    return res.json();
  }, []);

  return {
    prayers,
    loading,
    prayedIds,
    fetchPrayers,
    createPrayer,
    togglePray,
    respond,
    sendVerse,
    addTestimony,
    deletePrayer,
  };
}

export function usePrayerParticipants(prayerChainId?: string) {
  const [participants, setParticipants] = useState<PrayerParticipant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchParticipants = useCallback(async (chainId?: string) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (chainId || prayerChainId) searchParams.set("prayerChainId", chainId || prayerChainId!);
      
      const res = await fetch(`/api/prayers/participants?${searchParams.toString()}`);
      const data = await res.json();
      setParticipants(data.participants || []);
      return data.participants || [];
    } catch (error) {
      console.error("Erreur récupération participants:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [prayerChainId]);

  const addParticipant = useCallback(async (data: { prayerChainId: string; role?: string }) => {
    const res = await fetch("/api/prayers/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }, []);

  const removeParticipant = useCallback(async (id: string) => {
    const res = await fetch(`/api/prayers/participants?id=${id}`, { method: "DELETE" });
    return res.json();
  }, []);

  const joinChain = useCallback(async (chainId: string) => {
    return addParticipant({ prayerChainId: chainId });
  }, [addParticipant]);

  return {
    participants,
    loading,
    fetchParticipants,
    addParticipant,
    removeParticipant,
    joinChain,
  };
}

export function usePrayerSchedule(prayerChainId?: string) {
  const [schedules, setSchedules] = useState<PrayerSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = useCallback(async (chainId?: string) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (chainId || prayerChainId) searchParams.set("prayerChainId", chainId || prayerChainId!);
      
      const res = await fetch(`/api/prayers/schedule?${searchParams.toString()}`);
      const data = await res.json();
      setSchedules(data.schedules || []);
      return data.schedules || [];
    } catch (error) {
      console.error("Erreur récupération horaires:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [prayerChainId]);

  const addSchedule = useCallback(async (data: Omit<PrayerSchedule, "id" | "createdAt">) => {
    const res = await fetch("/api/prayers/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    const res = await fetch(`/api/prayers/schedule?id=${id}`, { method: "DELETE" });
    return res.json();
  }, []);

  return {
    schedules,
    loading,
    fetchSchedules,
    addSchedule,
    deleteSchedule,
  };
}

export function usePrayerRooms(filters?: { prayerChainId?: string; isActive?: boolean; roomType?: string }) {
  const [rooms, setRooms] = useState<PrayerRoom[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRooms = useCallback(async (customFilters?: typeof filters) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      const currentFilters = customFilters || filters;
      if (currentFilters?.prayerChainId) searchParams.set("prayerChainId", currentFilters.prayerChainId);
      if (currentFilters?.isActive !== undefined) searchParams.set("isActive", String(currentFilters.isActive));
      if (currentFilters?.roomType) searchParams.set("roomType", currentFilters.roomType);
      
      const res = await fetch(`/api/prayers/rooms?${searchParams.toString()}`);
      const data = await res.json();
      setRooms(data.rooms || []);
      return data.rooms || [];
    } catch (error) {
      console.error("Erreur récupération salles:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const addRoom = useCallback(async (data: Omit<PrayerRoom, "id" | "createdAt" | "endedAt">) => {
    const res = await fetch("/api/prayers/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }, []);

  return {
    rooms,
    loading,
    fetchRooms,
    addRoom,
  };
}

export function usePrayerCampaigns(filters?: { churchId?: string; isActive?: boolean; type?: string }) {
  const [campaigns, setCampaigns] = useState<PrayerCampaign[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = useCallback(async (customFilters?: typeof filters) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      const currentFilters = customFilters || filters;
      if (currentFilters?.churchId) searchParams.set("churchId", currentFilters.churchId);
      if (currentFilters?.isActive !== undefined) searchParams.set("isActive", String(currentFilters.isActive));
      if (currentFilters?.type) searchParams.set("type", currentFilters.type);
      
      const res = await fetch(`/api/prayers/campaigns?${searchParams.toString()}`);
      const data = await res.json();
      setCampaigns(data || []);
      return data || [];
    } catch (error) {
      console.error("Erreur récupération campagnes:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const addCampaign = useCallback(async (data: Omit<PrayerCampaign, "id" | "createdAt">) => {
    const res = await fetch("/api/prayers/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }, []);

  return {
    campaigns,
    loading,
    fetchCampaigns,
    addCampaign,
  };
}

export function usePrayerEngagements(prayerRequestId?: string) {
  const [engagements, setEngagements] = useState<PrayerEngagement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEngagements = useCallback(async (requestId?: string) => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (requestId || prayerRequestId) searchParams.set("prayerRequestId", requestId || prayerRequestId!);
      
      const res = await fetch(`/api/prayers/engagements?${searchParams.toString()}`);
      const data = await res.json();
      setEngagements(data.engagements || []);
      return data.engagements || [];
    } catch (error) {
      console.error("Erreur récupération engagements:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [prayerRequestId]);

  const addEngagement = useCallback(async (data: { prayerRequestId: string; type: string }) => {
    const res = await fetch("/api/prayers/engagements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }, []);

  return {
    engagements,
    loading,
    fetchEngagements,
    addEngagement,
  };
}
