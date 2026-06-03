"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  /**
   * 🔐 PROTECTION ADMIN
   */
  useEffect(() => {
    if (status === "loading") return;

    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/me");
        if (!res.ok) {
          router.push("/");
          return;
        }

        const data = await res.json();
        if (!data?.isAdmin) router.push("/");
      } catch {
        router.push("/");
      }
    };

    checkAdmin();
  }, [session, status, router]);

  /**
   * 📥 LOAD DATA
   */
  const load = async () => {
    setLoading(true);

    try {
      const [p, u] = await Promise.all([
        fetch("/api/admin/posts").then(r => r.json()),
        fetch("/api/admin/users").then(r => r.json()),
      ]);

      setPosts(p);
      setUsers(u);
    } catch (err) {
      console.error("Admin load error:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  /**
   * 🗑 DELETE POST
   */
  const deletePost = async (id: string) => {
    const confirm = window.confirm("Supprimer ce post ?");
    if (!confirm) return;

    setActionLoading(true);

    try {
      await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      await load();
    } catch (err) {
      console.error("Delete post error:", err);
    }

    setActionLoading(false);
  };

  /**
   * 🧹 RESET FEED
   */
  const resetFeed = async () => {
    const confirm = window.confirm("Supprimer TOUT le feed ?");
    if (!confirm) return;

    setActionLoading(true);

    try {
      await fetch("/api/admin/reset", {
        method: "DELETE",
      });

      await load();
    } catch (err) {
      console.error("Reset error:", err);
    }

    setActionLoading(false);
  };

  /**
   * ⏳ LOADING / ACCESS CONTROL
   */
  if (status === "loading" || loading) {
    return (
      <div className="p-6 text-gray-500">
        Chargement admin...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">👑 Admin Panel</h1>
        <p className="text-gray-500 text-sm">
          Gestion complète de ChurchFace
        </p>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3">
        <button
          onClick={resetFeed}
          disabled={actionLoading}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition disabled:opacity-50"
        >
          🧹 Reset Feed
        </button>

        <button
          onClick={load}
          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* USERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="font-bold mb-3">👤 Users</h2>

        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
            >
              <div>
                <p className="font-medium">{u.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* POSTS */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="font-bold mb-3">📝 Posts</h2>

        <div className="space-y-3">
          {posts.map((p) => (
            <div
              key={p.id}
              className="p-4 border border-gray-100 rounded-xl"
            >
              <p className="text-gray-800">{p.content}</p>

              {p.imageUrl && (
                <div className="mt-2">
                  {p.imageUrl.includes(".mp4") ? (
                    <video
                      src={p.imageUrl}
                      controls
                      className="rounded-lg w-full"
                    />
                  ) : (
                    <img
                      src={p.imageUrl}
                      alt="Post media"
                      className="rounded-lg w-full object-cover"
                    />
                  )}
                </div>
              )}

              <button
                onClick={() => deletePost(p.id)}
                disabled={actionLoading}
                className="mt-3 text-sm text-red-600 hover:text-red-800 transition"
              >
                🗑 supprimer
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}