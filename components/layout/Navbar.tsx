"use client";

import {
  Bell,
  MessageCircle,
  Radio,
  Tv,
  HeartHandshake,
  X,
  Check,
  Users
} from "lucide-react";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { notificationSound } from "@/lib/sounds";
import HamburgerMenu from "./HamburgerMenu";

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  entityId?: string | null;
  entityType?: string | null;
};

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [messagesUnread, setMessagesUnread] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<string[]>([]);

  /**
   * SOCKET
   */
  useEffect(() => {
    socket.on("presence:update", setOnlineUsers);

    socket.on("notification:new", () => {
      setUnreadNotifications((p) => p + 1);
      notificationSound?.play();
      fetchNotifications();
    });

    socket.on("message:new", () => {
      setMessagesUnread((p) => p + 1);
      notificationSound?.play();
    });

    // Register user with socket when session is available
    if (session?.user?.id && socket.connected) {
      socket.emit("register", session.user.id);
    }

    // Re-register on reconnect
    const handleReconnect = () => {
      if (session?.user?.id) {
        socket.emit("register", session.user.id);
      }
    };

    socket.on("connect", handleReconnect);

    return () => {
      socket.off("presence:update");
      socket.off("notification:new");
      socket.off("message:new");
      socket.off("connect", handleReconnect);
    };
  }, [session?.user?.id]);

  /**
   * FETCH NOTIFICATIONS
   */
  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    setLoadingNotifications(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) {
        console.error("Failed to fetch notifications:", res.status);
        return;
      }
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadNotifications(data.unreadCount || 0);
    } catch (e) {
      console.error("Error fetching notifications:", e);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
      fetchPendingRequests();
    }
  }, [session?.user?.id]);

  const fetchPendingRequests = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch("/api/friends?status=PENDING");
      if (!res.ok) {
        console.error("Failed to fetch pending requests:", res.status);
        return;
      }
      const data = await res.json();
      const incomingRequests = (data.users || []).filter((u: any) => !u.isSender);
      setPendingRequests(incomingRequests.length);
    } catch (e) {
      console.error("Error fetching pending requests:", e);
    }
  };

  /**
   * MARK AS READ
   */
  const markAsRead = async (notificationIds?: string[]) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationIds,
          markAll: !notificationIds,
        }),
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (e) {
      console.error("Error marking notifications as read:", e);
    }
  };

  /**
   * CLOSE DROPDOWN ON OUTSIDE CLICK
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  /**
   * 🔎 SEARCH (demo frontend)
   */
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const fakeData = [
      "Pasteur Samuel",
      "Jeunesse Victoire",
      "Église Nouvelle Alliance",
      "Louange Worship",
      "Bible Study Group",
    ];

    const filtered = fakeData.filter((item) =>
      item.toLowerCase().includes(search.toLowerCase())
    );

    setResults(filtered);
  }, [search]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-purple-600 px-4 py-3 flex items-center justify-between shadow-lg">

      {/* LEFT */}
      <div className="flex items-center gap-4">

        <div className="text-2xl font-extrabold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
          ChurchFace
        </div>

        {/* SEARCH */}
        <div className="relative hidden md:block w-[420px]">

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher personnes, posts..."
            className="w-full bg-white/90 px-5 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500"
          />

          {/* DROPDOWN */}
          {results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden z-50">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="px-4 py-2 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-purple-50 cursor-pointer"
                >
                  {r}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        {/* LINKS - Desktop only */}
        <div className="hidden md:flex items-center gap-1">
          <a
            href="/prayer-space"
            className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 px-3 py-2 rounded-full transition"
          >
            🙏 Prière
          </a>
          <a
            href="/live"
            className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 px-3 py-2 rounded-full transition"
          >
            📺 Live
          </a>
          <a
            href="/radio"
            className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 px-3 py-2 rounded-full transition"
          >
            🎙️ Radio
          </a>
          <a
            href="/church/create"
            className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 px-3 py-2 rounded-full transition"
          >
            ⛪ Créer une église
          </a>
        </div>

        {/* ONLINE - Desktop only */}
        <div className="hidden md:flex items-center gap-2 text-sm text-white bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          {onlineUsers.length} en ligne
        </div>

        {/* NOTIF */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchNotifications();
            }}
            className="relative w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition"
          >
            <Bell size={18} className="text-white" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* DROPDOWN */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <button
                  onClick={() => markAsRead()}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Tout marquer comme lu
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loadingNotifications ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 bg-emerald-500/10" />
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-8">Aucune notification</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition ${
                        !notif.read ? "bg-emerald-50/50" : ""
                      }`}
                      onClick={() => markAsRead([notif.id])}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {notif.sender?.image ? (
                            <img src={notif.sender.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-emerald-700 font-semibold text-sm">
                              {notif.sender?.name?.[0]?.toUpperCase() || "?"}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notif.createdAt).toLocaleString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* MSG - Desktop only */}
        <button className="hidden md:relative md:w-10 md:h-10 md:rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition">
          <MessageCircle size={18} className="text-white" />
          {messagesUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {messagesUnread}
            </span>
          )}
        </button>

        {/* FRIENDS - Desktop only */}
        <a
          href="/friends"
          className="hidden md:relative md:w-10 md:h-10 md:rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition"
        >
          <Users size={18} className="text-white" />
          {pendingRequests > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {pendingRequests}
            </span>
          )}
        </a>

        {/* AUTH - Desktop only */}
        {!session ? (
          <button
            onClick={() => router.push("/login")}
            className="hidden md:block bg-gradient-to-r from-emerald-600 to-purple-600 text-white px-5 py-2.5 rounded-full hover:shadow-lg transition"
          >
            Connexion
          </button>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <img
              src={session?.user?.image || "https://i.pravatar.cc/150"}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
            />
            <button
              onClick={() => signOut()}
              className="text-sm text-white/90 hover:text-white font-medium"
            >
              Déconnexion
            </button>
          </div>
        )}

        {/* HAMBURGER MENU - Mobile */}
        <HamburgerMenu />
      </div>
    </nav>
  );
}
