"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  MessageSquare,
  Radio as RadioIcon,
  Headphones,
  MessageCircle,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/profile", label: "Profil", icon: User },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/live", label: "Lives", icon: RadioIcon },
  { href: "/radio", label: "Radio", icon: Headphones },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition min-w-[3rem] ${
                isActive
                  ? "text-emerald-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title={item.label}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
