"use client";

import { useState } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";

interface PrayerAdvancedSearchProps {
  onSearch: (filters: {
    query: string;
    category?: string;
    churchId?: string;
    groupId?: string;
    ministryId?: string;
    isUrgent?: boolean;
    isAnswered?: boolean;
    dateFrom?: string;
    dateTo?: string;
  }) => void;
  churches?: { id: string; name: string }[];
  groups?: { id: string; name: string }[];
  ministries?: { id: string; name: string }[];
}

const CATEGORIES = [
  { value: "SANTE", label: "Santé" },
  { value: "FAMILLE", label: "Famille" },
  { value: "TRAVAIL", label: "Travail" },
  { value: "ETUDES", label: "Études" },
  { value: "MINISTERE", label: "Ministère" },
  { value: "FINANCES", label: "Finances" },
  { value: "MARIAGE", label: "Mariage" },
  { value: "EVANGELISATION", label: "Évangélisation" },
];

export function PrayerAdvancedSearch({
  onSearch,
  churches = [],
  groups = [],
  ministries = [],
}: PrayerAdvancedSearchProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("");
  const [churchId, setChurchId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [ministryId, setMinistryId] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleSearch = () => {
    onSearch({
      query,
      category: category || undefined,
      churchId: churchId || undefined,
      groupId: groupId || undefined,
      ministryId: ministryId || undefined,
      isUrgent: isUrgent || undefined,
      isAnswered: isAnswered || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  };

  const handleClear = () => {
    setQuery("");
    setCategory("");
    setChurchId("");
    setGroupId("");
    setMinistryId("");
    setIsUrgent(false);
    setIsAnswered(false);
    setDateFrom("");
    setDateTo("");
    onSearch({ query: "" });
  };

  const hasActiveFilters =
    category || churchId || groupId || ministryId || isUrgent || isAnswered || dateFrom || dateTo;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Rechercher des prières..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showFilters || hasActiveFilters
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtres
          {hasActiveFilters && <span className="w-2 h-2 bg-red-500 rounded-full" />}
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Rechercher
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes les catégories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Church */}
            {churches.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Église
                </label>
                <select
                  value={churchId}
                  onChange={(e) => setChurchId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Toutes les églises</option>
                  {churches.map((church) => (
                    <option key={church.id} value={church.id}>
                      {church.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Group */}
            {groups.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Groupe
                </label>
                <select
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tous les groupes</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Ministry */}
            {ministries.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ministère
                </label>
                <select
                  value={ministryId}
                  onChange={(e) => setMinistryId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tous les ministères</option>
                  {ministries.map((ministry) => (
                    <option key={ministry.id} value={ministry.id}>
                      {ministry.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Toggle Filters */}
          <div className="mt-4 flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Urgent uniquement</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isAnswered}
                onChange={(e) => setIsAnswered(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Exaucées uniquement</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
