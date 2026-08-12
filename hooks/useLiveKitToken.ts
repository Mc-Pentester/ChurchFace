"use client";

import { useState } from "react";

export function useLiveKitToken() {
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = async (roomName: string, participantName: string, isPublisher = true) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, participantName, isPublisher }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch token");
      }

      const data = await response.json();
      setToken(data.token);
      setUrl(data.url);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    token,
    url,
    loading,
    error,
    fetchToken,
  };
}
