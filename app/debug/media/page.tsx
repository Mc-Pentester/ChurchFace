"use client";

import { useState, useEffect } from "react";
import {
  runFullDiagnostic,
  testVideoOnly,
  testAudioOnly,
  testAudioVideo,
  enumerateDevices,
  DiagnosticResult,
} from "@/lib/webrtc/MediaDiagnostic";

// TypeScript declaration for window extension
declare global {
  interface Window {
    churchFaceMediaDiagnostic?: {
      testVideoOnly: () => Promise<DiagnosticResult>;
      testAudioOnly: () => Promise<DiagnosticResult>;
      testAudioVideo: () => Promise<DiagnosticResult>;
      runFullDiagnostic: () => Promise<{
        devices: Awaited<ReturnType<typeof enumerateDevices>>;
        audioOnly: Awaited<ReturnType<typeof testAudioOnly>>;
        videoOnly: Awaited<ReturnType<typeof testVideoOnly>>;
        audioVideo: Awaited<ReturnType<typeof testAudioVideo>>;
      }>;
    };
  }
}

export default function MediaDiagnosticPage() {
  const [results, setResults] = useState<any>(null);
  const [devices, setDevices] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState<string>("");
  const [userAgent, setUserAgent] = useState<string>("");
  const [protocol, setProtocol] = useState<string>("");
  const [hostname, setHostname] = useState<string>("");

  useEffect(() => {
    setTimestamp(new Date().toISOString());
    setUserAgent(navigator.userAgent);
    setProtocol(window.location.protocol);
    setHostname(window.location.hostname);

    // Expose diagnostic functions to window in development only
    if (process.env.NODE_ENV === "development") {
      window.churchFaceMediaDiagnostic = {
        testVideoOnly,
        testAudioOnly,
        testAudioVideo,
        runFullDiagnostic,
      };
      console.log("[DEBUG] Media diagnostic exposed to window.churchFaceMediaDiagnostic");
    }

    // Load initial devices
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const deviceInfo = await enumerateDevices();
      setDevices(deviceInfo);
    } catch (error) {
      console.error("[DEBUG] Failed to enumerate devices:", error);
    }
  };

  const handleTestVideo = async () => {
    setLoading(true);
    try {
      const result = await testVideoOnly();
      setResults({ test: "video", result, timestamp: new Date().toISOString() });
      await loadDevices();
    } catch (error) {
      setResults({ test: "video", error, timestamp: new Date().toISOString() });
    }
    setLoading(false);
  };

  const handleTestAudio = async () => {
    setLoading(true);
    try {
      const result = await testAudioOnly();
      setResults({ test: "audio", result, timestamp: new Date().toISOString() });
      await loadDevices();
    } catch (error) {
      setResults({ test: "audio", error, timestamp: new Date().toISOString() });
    }
    setLoading(false);
  };

  const handleTestAudioVideo = async () => {
    setLoading(true);
    try {
      const result = await testAudioVideo();
      setResults({ test: "audiovideo", result, timestamp: new Date().toISOString() });
      await loadDevices();
    } catch (error) {
      setResults({ test: "audiovideo", error, timestamp: new Date().toISOString() });
    }
    setLoading(false);
  };

  const handleFullDiagnostic = async () => {
    setLoading(true);
    try {
      const result = await runFullDiagnostic();
      setResults({ test: "full", result, timestamp: new Date().toISOString() });
      setDevices(result.devices);
    } catch (error) {
      setResults({ test: "full", error, timestamp: new Date().toISOString() });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">ChurchFace — Diagnostic Média</h1>

        {/* Environment Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Informations Environnement</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Timestamp:</span>
              <span className="ml-2">{timestamp}</span>
            </div>
            <div>
              <span className="text-gray-400">Protocol:</span>
              <span className="ml-2">{protocol}</span>
            </div>
            <div>
              <span className="text-gray-400">Hostname:</span>
              <span className="ml-2">{hostname}</span>
            </div>
            <div>
              <span className="text-gray-400">Node Env:</span>
              <span className="ml-2">{process.env.NODE_ENV}</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-400">User Agent:</span>
            <div className="mt-1 text-xs bg-gray-700 p-2 rounded break-all">
              {userAgent}
            </div>
          </div>
        </div>

        {/* Device Info */}
        {devices && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Périphériques Média</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-2xl font-bold text-blue-400">{devices.videoInputs}</div>
                <div className="text-sm text-gray-400">Video Inputs</div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-2xl font-bold text-green-400">{devices.audioInputs}</div>
                <div className="text-sm text-gray-400">Audio Inputs</div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-2xl font-bold text-purple-400">{devices.audioOutputs}</div>
                <div className="text-sm text-gray-400">Audio Outputs</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">Total devices: {devices.devices.length}</div>
            
            {/* Device Details */}
            <div className="mt-4 space-y-2">
              {devices.devices.map((device: MediaDeviceInfo, index: number) => (
                <div key={index} className="bg-gray-700 p-3 rounded text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">{device.kind}</span>
                    <span className="text-gray-500">
                      {device.deviceId ? "✓ deviceId" : "✗ no deviceId"}
                    </span>
                  </div>
                  {device.label && (
                    <div className="text-gray-400 mt-1">{device.label}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Buttons */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleTestVideo}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Test Caméra
            </button>
            <button
              onClick={handleTestAudio}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Test Microphone
            </button>
            <button
              onClick={handleTestAudioVideo}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Test Audio + Vidéo
            </button>
            <button
              onClick={handleFullDiagnostic}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Diagnostic Complet
            </button>
          </div>
          {loading && (
            <div className="mt-4 text-center text-gray-400">
              Test en cours...
            </div>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Résultats</h2>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}

        {/* DevTools Instructions */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">DevTools</h2>
            <p className="text-sm text-gray-300 mb-4">
              Les fonctions de diagnostic sont exposées sur <code className="bg-gray-700 px-2 py-1 rounded">window.churchFaceMediaDiagnostic</code>
            </p>
            <div className="space-y-2 text-sm">
              <div className="bg-gray-800 p-2 rounded">
                <code className="text-green-400">await window.churchFaceMediaDiagnostic.testVideoOnly()</code>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <code className="text-green-400">await window.churchFaceMediaDiagnostic.testAudioOnly()</code>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <code className="text-green-400">await window.churchFaceMediaDiagnostic.testAudioVideo()</code>
              </div>
              <div className="bg-gray-800 p-2 rounded">
                <code className="text-green-400">await window.churchFaceMediaDiagnostic.runFullDiagnostic()</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
