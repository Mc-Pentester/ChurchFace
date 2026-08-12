"use client";

import { useState, useCallback } from "react";
import type { 
  PrayerRequestWithUser, 
  PrayerParticipant, 
  PrayerSchedule, 
  PrayerRoom, 
  PrayerCampaign, 
  PrayerEngagement 
} from "@/types/prayer";

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

// Hook pour la gestion des participants aux chaînes de prière
export function usePrayerParticipants() {
  const [participants, setParticipants] = useState<PrayerParticipant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchParticipants = useCallback(async (prayerChainId: string) => {
    setLoading(true);
    const res = await fetch(`/api/prayers/participants?prayerChainId=${prayerChainId}`);
    const data = await res.json();
    setParticipants(data);
    setLoading(false);
    return data;
  }, []);

  const joinChain = useCallback(async (prayerChainId: string, role = "PARTICIPANT") => {
    const res = await fetch("/api/prayers/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayerChainId, role }),
    });
    return res.json();
  }, []);

  const leaveChain = useCallback(async (participantId: string) => {
    const res = await fetch(`/api/prayers/participants/${participantId}`, {
      method: "DELETE",
    });
    return res.json();
  }, []);

  return {
    participants,
    loading,
    fetchParticipants,
    joinChain,
    leaveChain,
  };
}

// Hook pour la gestion du calendrier d'intercession
export function usePrayerSchedule() {
  const [schedules, setSchedules] = useState<PrayerSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = useCallback(async (prayerChainId: string) => {
    setLoading(true);
    const res = await fetch(`/api/prayers/schedule?prayerChainId=${prayerChainId}`);
    const data = await res.json();
    setSchedules(data);
    setLoading(false);
    return data;
  }, []);

  const createSchedule = useCallback(async (data: {
    prayerChainId: string;
    hour: number;
    dayOfWeek?: number;
  }) => {
    const res = await fetch("/api/prayers/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }, []);

  const deleteSchedule = useCallback(async (scheduleId: string) => {
    const res = await fetch(`/api/prayers/schedule/${scheduleId}`, {
      method: "DELETE",
    });
    return res.json();
  }, []);

  return {
    schedules,
    loading,
    fetchSchedules,
    createSchedule,
    deleteSchedule,
  };
}

// Hook pour la gestion des salles de prière
export function usePrayerRooms() {
  const [rooms, setRooms] = useState<PrayerRoom[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRooms = useCallback(async (params?: {
    prayerChainId?: string;
    isActive?: boolean;
  }) => {
    setLoading(true);
    const searchParams = new URLSearchParams();
    if (params?.prayerChainId) searchParams.set("prayerChainId", params.prayerChainId);
    if (params?.isActive !== undefined) searchParams.set("isActive", String(params.isActive));

    const res = await fetch(`/api/prayers/rooms?${searchParams.toString()}`);
    const data = await res.json();
    setRooms(data);
    setLoading(false);
    return data;
  }, []);

  const createRoom = useCallback(async (data: {
    title: string;
    description?: string;
    roomType?: "TEXT" | "AUDIO" | "VIDEO";
    isPublic?: boolean;
    prayerChainId?: string;
    maxParticipants?: number;
    scheduledStart?: string;
    scheduledEnd?: string;
  }) => {
    const res = await fetch("/api/prayers/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }, []);

  const joinRoom = useCallback(async (roomId: string) => {
    const res = await fetch("/api/prayers/rooms/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId }),
    });
    return res.json();
  }, []);

  const leaveRoom = useCallback(async (roomId: string) => {
    const res = await fetch("/api/prayers/rooms/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId }),
    });
    return res.json();
  }, []);

  return {
    rooms,
    loading,
    fetchRooms,
    createRoom,
    joinRoom,
    leaveRoom,
  };
}

// Hook pour la gestion des campagnes de prière
export function usePrayerCampaigns() {
  const [campaigns, setCampaigns] = useState<PrayerCampaign[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = useCallback(async (params?: {
    churchId?: string;
    isActive?: boolean;
    type?: string;
  }) => {
    setLoading(true);
    const searchParams = new URLSearchParams();
    if (params?.churchId) searchParams.set("churchId", params.churchId);
    if (params?.isActive !== undefined) searchParams.set("isActive", String(params.isActive));
    if (params?.type) searchParams.set("type", params.type);

    const res = await fetch(`/api/prayers/campaigns?${searchParams.toString()}`);
    const data = await res.json();
    setCampaigns(data);
    setLoading(false);
    return data;
  }, []);

  const createCampaign = useCallback(async (data: {
    title: string;
    description?: string;
    imageUrl?: string;
    type: "FAST" | "PRAYER" | "VIGIL" | "NATIONAL" | "GLOBAL";
    startDate: string;
    endDate: string;
    churchId?: string;
  }) => {
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
    createCampaign,
  };
}

// Hook pour la gestion des engagements de prière
export function usePrayerEngagements() {
  const [engagements, setEngagements] = useState<PrayerEngagement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEngagements = useCallback(async (prayerRequestId: string, type?: string) => {
    setLoading(true);
    const searchParams = new URLSearchParams();
    searchParams.set("prayerRequestId", prayerRequestId);
    if (type) searchParams.set("type", type);

    const res = await fetch(`/api/prayers/engagements?${searchParams.toString()}`);
    const data = await res.json();
    setEngagements(data);
    setLoading(false);
    return data;
  }, []);

  const addEngagement = useCallback(async (data: {
    prayerRequestId: string;
    type: "PRAYED" | "CONTINUING" | "SHARED_VERSE" | "ENCOURAGED";
  }) => {
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
