"use client";

import {
  HeartPulse,
  Users,
  Briefcase,
  BookOpen,
  Church,
  Banknote,
  Heart,
  Megaphone,
  Clock,
  TrendingUp,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { PRAYER_CATEGORIES } from "@/types/prayer";

const ICONS: Record<string, React.ElementType> = {
  SANTE: HeartPulse,
  FAMILLE: Users,
  TRAVAIL: Briefcase,
  ETUDES: BookOpen,
  MINISTERE: Church,
  FINANCES: Banknote,
  MARIAGE: Heart,
  EVANGELISATION: Megaphone,
};

interface Props {
  activeCategory: string | null;
  activeFilter: string;
  onCategoryChange: (cat: string | null) => void;
  onFilterChange: (filter: string) => void;
}

const FILTERS = [
  { key: "recent", label: "Récentes", icon: Clock },
  { key: "popular", label: "Populaires", icon: TrendingUp },
  { key: "urgent", label: "Urgentes", icon: Flame },
  { key: "answered", label: "Exaucées", icon: CheckCircle2 },
];

export default function PrayerSidebarLeft({
  activeCategory,
  activeFilter,
  onCategoryChange,
  onFilterChange,
}: Props) {
  return (
    <aside className="space-y-6">
      {/* Categories */}
      <div className="bg-white rounded-2xl border p-4">
        <h3 className="font-bold text-gray-800 text-sm mb-3">Catégories</h3>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
              activeCategory === null
                ? "bg-emerald-50 text-emerald-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="text-base">🙏</span> Toutes
          </button>
          {PRAYER_CATEGORIES.map((cat) => {
            const Icon = ICONS[cat.key];
            return (
              <button
                key={cat.key}
                onClick={() => onCategoryChange(cat.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                  activeCategory === cat.key
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {Icon && <Icon size={16} />} {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border p-4">
        <h3 className="font-bold text-gray-800 text-sm mb-3">Filtres</h3>
        <div className="space-y-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                activeFilter === f.key
                  ? "bg-amber-50 text-amber-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <f.icon size={16} /> {f.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
