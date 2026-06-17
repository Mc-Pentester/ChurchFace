"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

export default function EditProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/");
      return;
    }

    setName(session.user.name || "");
    setImage(session.user.image || "");

    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          setName(data.user.name || "");
          setBio(data.user.bio || "");
          setImage(data.user.image || "");
        }
      })
      .catch(console.error);
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, image }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || "Erreur");
        return;
      }

      await update({ name });
      setMessage("Profil mis à jour !");
    } catch (err) {
      console.error(err);
      setMessage("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="p-6 text-gray-500">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      <Navbar onLoginClick={() => {}} />
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-purple-600 bg-clip-text text-transparent">Modifier mon profil</h1>

        {message && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border p-3 rounded-xl"
            placeholder="Ton nom"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-white border p-3 rounded-xl resize-none"
            rows={3}
            placeholder="Parle-nous de toi..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo de profil (URL)
          </label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full bg-white border p-3 rounded-xl"
            placeholder="https://..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
          >
            Annuler
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
