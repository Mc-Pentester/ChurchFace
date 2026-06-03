"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

export default function HomeButton() {
  const pathname = usePathname();

  // Masqué sur la page d'accueil
  if (pathname === "/") return null;

  return (
    <Link
      href="/"
      className="fixed top-16 left-3 z-40 bg-white/90 backdrop-blur-sm border shadow-sm hover:shadow-md text-gray-700 hover:text-emerald-600 p-2.5 rounded-full transition lg:top-20 lg:left-5"
      title="Accueil"
    >
      <Home size={22} strokeWidth={2.2} />
    </Link>
  );
}
