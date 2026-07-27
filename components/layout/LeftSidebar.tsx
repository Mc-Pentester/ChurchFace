"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Profil", href: "/profile" },
  { label: "Amis", href: "/friends" },
  { label: "Messages", href: "/messages" },
  { label: "Lives", href: "/live" },
  { label: "Radio", href: "/radio" },
  { label: "Admin", href: "/admin", adminOnly: true },
  { label: "Paramètres", href: "/profile/edit" },
];

const chatItem = { label: "💬 Chat en direct", href: "/chat" };

export default function LeftSidebar() {
  const { data: session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.user?.id) {
        setCheckingAdmin(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json();
        setIsAdmin(data.isAdmin || false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, [session?.user?.id]);

  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly) {
      return isAdmin;
    }
    return true;
  });

  return (
    <div className="p-4 space-y-3">

      <div className="text-lg font-bold text-gray-800">
        Navigation
      </div>

      <nav className="space-y-2 text-gray-700">

        {visibleNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block hover:bg-gray-200 p-2 rounded-lg cursor-pointer transition"
          >
            {item.label}
          </Link>
        ))}

        <button
          onClick={() => window.dispatchEvent(new CustomEvent("toggle-chat-popup"))}
          className="block w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-center p-2 rounded-lg cursor-pointer transition font-medium"
        >
          {chatItem.label}
        </button>

      </nav>

    </div>
  );
}