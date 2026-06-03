"use client";

import Link from "next/link";

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Profil", href: "/profile" },
  { label: "Messages", href: "/messages" },
  { label: "Lives", href: "/live" },
  { label: "Radio", href: "/radio" },
  { label: "Admin", href: "/api/admin" },
  { label: "Paramètres", href: "/profile/edit" },
];

const chatItem = { label: "💬 Chat en direct", href: "/chat" };

export default function LeftSidebar() {
  return (
    <div className="p-4 space-y-3">

      <div className="text-lg font-bold text-gray-800">
        Navigation
      </div>

      <nav className="space-y-2 text-gray-700">

        {navItems.map((item) => (
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