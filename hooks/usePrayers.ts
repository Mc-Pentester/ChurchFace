"use client";

import { useState, useCallback } from "react";
import type { PrayerRequestWithUser } from "@/types/prayer";

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
