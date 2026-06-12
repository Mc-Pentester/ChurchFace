"use client";

import {
  Bell,
  MessageCircle,
  Radio,
  Tv,
  HeartHandshake
} from "lucide-react";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { socket } from "@/lib/socket";
import { notificationSound } from "@/lib/sounds";

export default function Navbar({ onLoginClick }: any) {
  const { data: session } = useSession();

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [messagesUnread, setMessagesUnread] = useState(0);

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
    });

    socket.on("message:new", () => {
      setMessagesUnread((p) => p + 1);
      notificationSound?.play();
    });

    return () => {
      socket.off("presence:update");
      socket.off("notification:new");
      socket.off("message:new");
    };
  }, []);

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
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">

      {/* LEFT */}
      <div className="flex items-center gap-4">

        <div className="text-2xl font-extrabold text-emerald-600">
          ChurchFace
        </div>

        {/* SEARCH */}
        <div className="relative hidden md:block w-[420px]">

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher personnes, posts..."
            className="w-full bg-gray-100 px-5 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {/* DROPDOWN */}
          {results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden z-50">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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

        {/* LINKS */}
        <div className="hidden md:flex items-center gap-1">
          <a
            href="/prayer-space"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-full hover:bg-emerald-50 transition"
          >
            🙏 Prière
          </a>
          <a
            href="/live"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-full hover:bg-emerald-50 transition"
          >
            📺 Live
          </a>
          <a
            href="/radio"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-full hover:bg-emerald-50 transition"
          >
            🎙️ Radio
          </a>
        </div>

        {/* ONLINE */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          {onlineUsers.length} en ligne
        </div>

        {/* NOTIF */}
        <button className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <Bell size={18} />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* MSG */}
        <button className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <MessageCircle size={18} />
          {messagesUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {messagesUnread}
            </span>
          )}
        </button>

        {/* AUTH */}
        {!session ? (
          <button
            onClick={onLoginClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full"
          >
            Connexion
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <img
              src={session?.user?.image || "https://i.pravatar.cc/150"}
              alt="avatar"
              className="w-10 h-10 rounded-full object-cover"
            />
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-600 hover:text-red-500"
            >
              logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
