"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Radio, BookOpen, Search, User, Heart } from "lucide-react";

export default function MobileNavigation() {
  const pathname = usePathname();

  const navItems = [
    { id: "home", label: "Accueil", icon: Home, href: "/" },
    { id: "preachings", label: "Prédications", icon: BookOpen, href: "/preachings" },
    { id: "live", label: "Live", icon: Radio, href: "/live" },
    { id: "search", label: "Rechercher", icon: Search, href: "/preachings" },
    { id: "profile", label: "Profil", icon: User, href: "/profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                active
                  ? "text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={20} className={active ? "fill-current" : ""} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
