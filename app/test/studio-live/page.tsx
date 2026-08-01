"use client";

import { useState } from "react";
import StudioLiveUnified from "@/components/live/studio/StudioLiveUnified";

export default function TestStudioLivePage() {
  const [broadcastId, setBroadcastId] = useState<string | null>(null);
  const [mode, setMode] = useState<"VIDEO" | "RADIO" | "CHURCH" | "TRAINING" | "PODCAST" | "CONFERENCE">("VIDEO");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBroadcast = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Test Broadcast ${new Date().toISOString()}`,
          description: "Test broadcast for unified studio",
          streamMode: "RTMP",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create broadcast");
      }

      const data = await response.json();
      setBroadcastId(data.id);
      console.log("Broadcast created:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {!broadcastId ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
            <h1 className="text-white text-2xl font-bold mb-6">Test Studio Live</h1>
            
            <div className="mb-4">
              <label className="text-gray-300 block mb-2">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full bg-gray-700 text-white p-2 rounded"
              >
                <option value="VIDEO">Video</option>
                <option value="RADIO">Radio</option>
                <option value="CHURCH">Church</option>
                <option value="TRAINING">Training</option>
                <option value="PODCAST">Podcast</option>
                <option value="CONFERENCE">Conference</option>
              </select>
            </div>

            <button
              onClick={createBroadcast}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded font-semibold disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Broadcast"}
            </button>

            {error && (
              <div className="mt-4 bg-red-600/20 text-red-400 p-3 rounded">
                {error}
              </div>
            )}
          </div>
        </div>
      ) : (
        <StudioLiveUnified
          broadcastId={broadcastId}
          mode={mode}
        />
      )}
    </div>
  );
}
