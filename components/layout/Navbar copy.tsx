"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { notificationSound } from "@/lib/sounds";

export default function Navbar({ onLoginClick }: any) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [messagesUnread, setMessagesUnread] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {

    socket.on("presence:update", (users) => {
      setOnlineUsers(users);
    });

    socket.on("notification:new", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadNotifications((prev) => prev + 1);
      notificationSound?.play();
    });

    socket.on("message:new", () => {
      setMessagesUnread((prev) => prev + 1);
      notificationSound?.play();
    });

    return () => {
      socket.off("presence:update");
      socket.off("notification:new");
      socket.off("message:new");
    };

  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">

      {/* LEFT */}
      <div className="flex items-center gap-4">

        <div className="text-3xl font-extrabold text-emerald-600">
          ChurchFace
        </div>

        <div className="hidden md:flex w-[420px]">
          <input
            type="text"
            placeholder="Rechercher personnes, posts..."
            className="w-full bg-gray-100 px-5 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        {/* ONLINE */}
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          {onlineUsers.length} en ligne
        </div>

        {/* NOTIF */}
        <button className="relative w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
          🔔
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* MSG */}
        <button className="relative w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
          💬
          {messagesUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {messagesUnread}
            </span>
          )}
        </button>

        {/* LOGIN */}
        {!isLoggedIn ? (
          <button
            onClick={onLoginClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full"
          >
            Connexion
          </button>
        ) : (
          <img
            src="/avatar.png"
            className="w-11 h-11 rounded-full border-2 border-emerald-500"
          />
        )}

      </div>

    </nav>
  );
}