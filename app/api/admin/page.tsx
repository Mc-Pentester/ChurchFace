"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Shield, Users, FileText, MessageSquare, Radio, Headphones,
  Trash2, RefreshCw, Crown, UserX, Activity, Eye, Heart,
  AlertTriangle, CheckCircle, ListMusic, Plus, X, GripVertical,
} from "lucide-react";

type Tab =
  | "overview"
  | "users"
  | "posts"
  | "comments"
  | "streams"
  | "playlists";

export default function AdminPage() {
  const { status } = useSession();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [tab, setTab] = useState<Tab>("overview");

  const [stats, setStats] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [streams, setStreams] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /* Playlist form state */
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<any>(null);
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [playlistDesc, setPlaylistDesc] = useState("");
  const [playlistItems, setPlaylistItems] = useState<{ title: string; url: string; type: string; duration?: number }[]>([]);

  const hasLoaded = useRef(false);

  /* ───────────────────────────────
   * 🔐 ADMIN CHECK
   * ─────────────────────────────── */
  useEffect(() => {
    if (status === "loading") return;

    const check = async () => {
      try {
        const res = await fetch("/api/admin/me", { cache: "no-store" });

        if (!res.ok) {
          router.replace("/");
          return;
        }

        const data = await res.json();

        if (!data?.isAdmin) {
          router.replace("/");
          return;
        }

        setIsAdmin(true);
      } catch (err) {
        console.error("Admin check error:", err);
        router.replace("/");
      } finally {
        setCheckingAdmin(false);
      }
    };

    check();
  }, [status, router]);

  /* ───────────────────────────────
   * 📥 SAFE LOAD (anti memory leak)
   * ─────────────────────────────── */
  useEffect(() => {
    if (!isAdmin || hasLoaded.current) return;

    hasLoaded.current = true;

    const controller = new AbortController();

    const load = async () => {
      setLoading(true);

      try {
        const requests = [
          fetch("/api/admin/stats", { signal: controller.signal }).then(r => r.json()),
          fetch("/api/admin/posts", { signal: controller.signal }).then(r => r.json()),
          fetch("/api/admin/users", { signal: controller.signal }).then(r => r.json()),
          fetch("/api/admin/comments", { signal: controller.signal }).then(r => r.json()),
          fetch("/api/admin/streams", { signal: controller.signal }).then(r => r.json()),
          fetch("/api/admin/playlists", { signal: controller.signal }).then(r => r.json()),
        ];

        const [s, p, u, c, st, pl] = await Promise.all(requests);

        setStats(s);
        setPosts(p);
        setUsers(u.users ?? u);
        setComments(c.comments ?? c);
        setStreams(st.streams ?? st);
        setPlaylists(pl.playlists ?? pl);
      } catch (err) {
        if (err instanceof DOMException) return;
        console.error("Admin load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [isAdmin]);

  /* ───────────────────────────────
   * ⚡ ACTION RUNNER (core system)
   * ─────────────────────────────── */
  const runAction = async (
    key: string,
    fn: () => Promise<void>,
    successCb?: () => void
  ) => {
    if (actionLoading) return;

    setActionLoading(key);

    try {
      await fn();
      successCb?.();
    } catch (err) {
      console.error(`[${key}] error:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  /* ───────────────────────────────
   * 🧨 ACTIONS
   * ─────────────────────────────── */

  const deletePost = async (id: string) => {
    if (!confirm("Supprimer ce post ?")) return;

    await runAction(`post-${id}`, async () => {
      await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }, () => {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    });
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Supprimer ce commentaire ?")) return;

    await runAction(`comment-${id}`, async () => {
      await fetch("/api/admin/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }, () => {
      setComments((prev) => prev.filter((c) => c.id !== id));
    });
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;

    await runAction(`user-${id}`, async () => {
      await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }, () => {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    });
  };

  const toggleRole = async (id: string, role: string) => {
    const newRole = role === "ADMIN" ? "USER" : "ADMIN";

    await runAction(`role-${id}`, async () => {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: newRole }),
      });
    }, () => {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    });
  };

  const resetFeed = async () => {
    if (!confirm("Supprimer TOUT le feed ?")) return;

    await runAction("reset", async () => {
      await fetch("/api/admin/reset", { method: "DELETE" });
    }, () => {
      setPosts([]);
      setComments([]);
    });
  };

  const deleteStream = async (id: string) => {
    if (!confirm("Supprimer ce stream ?")) return;

    await runAction(`stream-${id}`, async () => {
      await fetch("/api/admin/streams", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }, () => {
      setStreams((prev) => prev.filter((s) => s.id !== id));
    });
  };

  /* ─── PLAYLIST ACTIONS ─── */
  const openPlaylistForm = (pl?: any) => {
    if (pl) {
      setEditingPlaylist(pl);
      setPlaylistTitle(pl.title);
      setPlaylistDesc(pl.description || "");
      setPlaylistItems(pl.items?.map((it: any) => ({ title: it.title, url: it.url, type: it.type, duration: it.duration })) || []);
    } else {
      setEditingPlaylist(null);
      setPlaylistTitle("");
      setPlaylistDesc("");
      setPlaylistItems([]);
    }
    setShowPlaylistForm(true);
  };

  const savePlaylist = async () => {
    if (!playlistTitle.trim()) return alert("Titre obligatoire");
    await runAction("playlist-save", async () => {
      const method = editingPlaylist ? "PATCH" : "POST";
      const body: any = { title: playlistTitle, description: playlistDesc, items: playlistItems };
      if (editingPlaylist) body.id = editingPlaylist.id;
      const res = await fetch("/api/admin/playlists", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.playlist) {
        if (editingPlaylist) {
          setPlaylists((prev) => prev.map((p) => (p.id === data.playlist.id ? data.playlist : p)));
        } else {
          setPlaylists((prev) => [data.playlist, ...prev]);
        }
        setShowPlaylistForm(false);
      }
    });
  };

  const deletePlaylist = async (id: string) => {
    if (!confirm("Supprimer cette playlist ?")) return;
    await runAction(`playlist-${id}`, async () => {
      await fetch("/api/admin/playlists", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
    });
  };

  const addPlaylistItem = () => setPlaylistItems((prev) => [...prev, { title: "", url: "", type: "AUDIO" }]);
  const removePlaylistItem = (idx: number) => setPlaylistItems((prev) => prev.filter((_, i) => i !== idx));
  const updatePlaylistItem = (idx: number, field: string, value: any) =>
    setPlaylistItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));

  /* ─────────────────────────────── */
  /* UI GUARD */
  /* ─────────────────────────────── */

  if (status === "loading" || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Vérification des permissions...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  /* ─────────────────────────────── */
  /* ⚠️ UI RESTE INCHANGÉE */
  /* (tu peux garder ton JSX actuel tel quel) */
  /* ─────────────────────────────── */

  const tabs: { key: Tab | "studio"; label: string; icon: any; href?: string }[] = [
    { key: "overview", label: "Vue d'ensemble", icon: Activity },
    { key: "users", label: "Utilisateurs", icon: Users },
    { key: "posts", label: "Posts", icon: FileText },
    { key: "comments", label: "Commentaires", icon: MessageSquare },
    { key: "streams", label: "Lives", icon: Radio },
    { key: "studio", label: "Radio Studio", icon: Headphones, href: "/admin/studio" },
    { key: "playlists", label: "Playlists", icon: ListMusic },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-emerald-600" size={28} />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Panel Admin</h1>
              <p className="text-xs text-gray-400">ChurchFace Administration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={resetFeed}
              disabled={!!actionLoading}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium transition"
            >
              <AlertTriangle size={16} /> Reset Feed
            </button>
            <button
              onClick={() => window.location.reload()}
              disabled={!!actionLoading}
              className="flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* SIDEBAR TABS */}
        <aside className="hidden lg:block w-56 shrink-0">
          <nav className="space-y-1 sticky top-24">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = !t.href && tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    if (t.href) router.push(t.href);
                    else setTab(t.key as Tab);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${active ? "bg-emerald-50 text-emerald-700" : t.href ? "text-violet-700 hover:bg-violet-50" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <Icon size={18} /> {t.label}
                  {t.href && <span className="ml-auto text-[10px] text-violet-400">→</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* MOBILE TABS */}
        <div className="lg:hidden w-full overflow-x-auto pb-2">
          <div className="flex gap-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = !t.href && tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    if (t.href) router.push(t.href);
                    else setTab(t.key as Tab);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${active ? "bg-emerald-50 text-emerald-700" : t.href ? "bg-violet-50 text-violet-700 border border-violet-200" : "bg-white text-gray-600 border"}`}
                >
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* ─── OVERVIEW ─── */}
          {tab === "overview" && (
            <div className="space-y-6">
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={Users} label="Utilisateurs" value={stats.totalUsers ?? 0} sub="inscrits" color="blue" />
                  <StatCard icon={FileText} label="Posts" value={stats.totalPosts ?? 0} sub="publications" color="emerald" />
                  <StatCard icon={MessageSquare} label="Commentaires" value={stats.totalComments ?? 0} sub="interactions" color="amber" />
                  <StatCard icon={Radio} label="Lives" value={stats.totalStreams ?? 0} sub="streams" color="rose" />
                  <StatCard icon={Headphones} label="Radios" value={stats.totalRadios ?? 0} sub="émissions" color="purple" />
                  <StatCard icon={Heart} label="Likes" value={stats.totalLikes ?? 0} sub="appréciations" color="red" />
                  <StatCard icon={Eye} label="Vues stories" value={stats.totalStoryViews ?? 0} sub="visions" color="cyan" />
                  <StatCard icon={Activity} label="Actifs (24h)" value={stats.activeToday ?? 0} sub="aujourd'hui" color="teal" />
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">Derniers posts</h3>
                  <div className="space-y-3">
                    {posts.slice(0, 5).map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <img src={p.author?.image || "https://i.pravatar.cc/150"} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{p.author?.name || "Anonyme"}</p>
                          <p className="text-xs text-gray-500 truncate">{p.content?.slice(0, 50)}...</p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">Derniers inscrits</h3>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((u) => (
                      <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <img src={u.image || "https://i.pravatar.cc/150"} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{u.name || u.email}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${u.role === "ADMIN" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-500"}`}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── USERS ─── */}
          {tab === "users" && (
            <div className="bg-white rounded-2xl border overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Utilisateurs ({users.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Utilisateur</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Rôle</th>
                      <th className="px-4 py-3 text-left">Inscrit</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <img src={u.image || "https://i.pravatar.cc/150"} alt="" className="w-7 h-7 rounded-full object-cover" />
                            <span className="font-medium text-gray-700">{u.name || "Anonyme"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleRole(u.id, u.role)}
                            disabled={actionLoading === `role-${u.id}`}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase transition ${u.role === "ADMIN" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                          >
                            {u.role === "ADMIN" ? <Crown size={10} /> : <UserX size={10} />}
                            {u.role}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => deleteUser(u.id)}
                            disabled={actionLoading === `user-${u.id}`}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── POSTS ─── */}
          {tab === "posts" && (
            <div className="bg-white rounded-2xl border overflow-hidden">
              <div className="px-5 py-4 border-b"><h3 className="font-semibold text-gray-800">Posts ({posts.length})</h3></div>
              <div className="divide-y max-h-[70vh] overflow-y-auto">
                {posts.map((p) => (
                  <div key={p.id} className="p-5 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <img src={p.author?.image || "https://i.pravatar.cc/150"} alt="" className="w-6 h-6 rounded-full object-cover" />
                          <span className="text-sm font-medium text-gray-700">{p.author?.name || "Anonyme"}</span>
                          <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-800 text-sm line-clamp-3">{p.content}</p>
                        {p.imageUrl && (
                          <div className="mt-2">
                            {p.imageUrl.includes(".mp4") || p.videoUrl ? (
                              <video src={p.imageUrl || p.videoUrl} controls className="rounded-lg max-h-40 object-cover" />
                            ) : (
                              <img src={p.imageUrl} alt="" className="rounded-lg max-h-40 object-cover" />
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deletePost(p.id)}
                        disabled={actionLoading === `post-${p.id}`}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition shrink-0"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── COMMENTS ─── */}
          {tab === "comments" && (
            <div className="bg-white rounded-2xl border overflow-hidden">
              <div className="px-5 py-4 border-b"><h3 className="font-semibold text-gray-800">Commentaires ({comments.length})</h3></div>
              <div className="divide-y max-h-[70vh] overflow-y-auto">
                {comments.map((c) => (
                  <div key={c.id} className="p-5 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <img src={c.user?.image || "https://i.pravatar.cc/150"} alt="" className="w-6 h-6 rounded-full object-cover" />
                          <span className="text-sm font-medium text-gray-700">{c.user?.name || "Anonyme"}</span>
                          <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-800 text-sm">{c.content}</p>
                        <p className="text-xs text-gray-400 mt-1">Sur le post : {c.post?.content?.slice(0, 60) || "Post"}...</p>
                      </div>
                      <button
                        onClick={() => deleteComment(c.id)}
                        disabled={actionLoading === `comment-${c.id}`}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition shrink-0"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── STREAMS ─── */}
          {tab === "streams" && (
            <div className="bg-white rounded-2xl border overflow-hidden">
              <div className="px-5 py-4 border-b"><h3 className="font-semibold text-gray-800">Lives ({streams.length})</h3></div>
              <div className="divide-y max-h-[70vh] overflow-y-auto">
                {streams.map((s) => (
                  <div key={s.id} className="p-5 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${s.isLive ? "bg-red-500 animate-pulse" : "bg-gray-300"}`} />
                          <span className="font-medium text-gray-800">{s.title}</span>
                          {s.isLive && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">LIVE</span>}
                        </div>
                        <div className="text-sm text-gray-500">{s.user?.name || "Anonyme"} — {s.viewerCount ?? 0} spectateurs</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(s.startedAt).toLocaleDateString()} {s.endedAt ? `→ ${new Date(s.endedAt).toLocaleDateString()}` : ""}</div>
                      </div>
                      <button
                        onClick={() => deleteStream(s.id)}
                        disabled={actionLoading === `stream-${s.id}`}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition shrink-0"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── PLAYLISTS ─── */}
          {tab === "playlists" && (
            <div className="space-y-6">
              {/* Header + Add */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-lg">Playlists ({playlists.length})</h3>
                <button
                  onClick={() => openPlaylistForm()}
                  className="flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-xl text-sm font-medium transition"
                >
                  <Plus size={16} /> Nouvelle playlist
                </button>
              </div>

              {/* Playlist Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playlists.map((pl) => (
                  <div key={pl.id} className="bg-white rounded-2xl border p-5 hover:shadow-sm transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <ListMusic size={18} className="text-emerald-600 shrink-0" />
                          <h4 className="font-semibold text-gray-800 truncate">{pl.title}</h4>
                        </div>
                        {pl.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{pl.description}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>{pl._count?.items ?? pl.items?.length ?? 0} pistes</span>
                          <span>{pl._count?.radios ?? 0} radios</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openPlaylistForm(pl)}
                          className="text-gray-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-50 transition"
                          title="Modifier"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button
                          onClick={() => deletePlaylist(pl.id)}
                          disabled={actionLoading === `playlist-${pl.id}`}
                          className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {/* Mini track list */}
                    {pl.items?.length > 0 && (
                      <div className="mt-3 pt-3 border-t space-y-1">
                        {pl.items.slice(0, 3).map((it: any, idx: number) => (
                          <div key={it.id || idx} className="flex items-center gap-2 text-xs text-gray-600">
                            <span className="text-gray-300 w-4 text-right">{idx + 1}</span>
                            <span className="truncate flex-1">{it.title}</span>
                            <span className="text-gray-400 shrink-0">{it.type}</span>
                          </div>
                        ))}
                        {pl.items.length > 3 && (
                          <div className="text-xs text-gray-400 pl-6">+{pl.items.length - 3} autres pistes...</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─── PLAYLIST FORM MODAL ─── */}
      {showPlaylistForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-semibold text-gray-800">{editingPlaylist ? "Modifier la playlist" : "Nouvelle playlist"}</h3>
              <button onClick={() => setShowPlaylistForm(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={playlistTitle}
                  onChange={(e) => setPlaylistTitle(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nom de la playlist"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={playlistDesc}
                  onChange={(e) => setPlaylistDesc(e.target.value)}
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Description optionnelle"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Pistes</label>
                  <button
                    onClick={addPlaylistItem}
                    className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-lg font-medium transition"
                  >
                    <Plus size={12} /> Ajouter une piste
                  </button>
                </div>
                <div className="space-y-2">
                  {playlistItems.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
                      <GripVertical size={14} className="text-gray-300 shrink-0" />
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={it.title}
                          onChange={(e) => updatePlaylistItem(idx, "title", e.target.value)}
                          className="border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="Titre"
                        />
                        <input
                          type="text"
                          value={it.url}
                          onChange={(e) => updatePlaylistItem(idx, "url", e.target.value)}
                          className="border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="URL du fichier"
                        />
                        <select
                          value={it.type}
                          onChange={(e) => updatePlaylistItem(idx, "type", e.target.value)}
                          className="border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="AUDIO">Audio</option>
                          <option value="VIDEO">Vidéo</option>
                        </select>
                      </div>
                      <button onClick={() => removePlaylistItem(idx)} className="text-gray-400 hover:text-red-500 p-1 rounded transition shrink-0"><X size={14} /></button>
                    </div>
                  ))}
                  {playlistItems.length === 0 && (
                    <div className="text-xs text-gray-400 text-center py-4 border border-dashed rounded-xl">Aucune piste. Cliquez sur "Ajouter une piste".</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowPlaylistForm(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition">Annuler</button>
                <button
                  onClick={savePlaylist}
                  disabled={actionLoading === "playlist-save"}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  {editingPlaylist ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── STAT CARD ─── */
function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: number; sub: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    purple: "bg-purple-50 text-purple-600",
    cyan: "bg-cyan-50 text-cyan-600",
    red: "bg-red-50 text-red-600",
    teal: "bg-teal-50 text-teal-600",
  };
  return (
    <div className="bg-white rounded-2xl border p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colorMap[color] || colorMap.blue}`}>
        <Icon size={18} />
      </div>
      <div className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  );
}