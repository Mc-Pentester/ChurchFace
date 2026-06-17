"use client";

import { useState } from "react";
import { X, Search, User } from "lucide-react";

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
}

export default function NewConversationModal({
  isOpen,
  onClose,
  onSelectUser,
}: NewConversationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${query}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Nouvelle conversation</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="w-full pl-10 pr-4 py-3 bg-gradient-to-r from-emerald-50 to-purple-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="max-h-96 overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 bg-gradient-to-r from-emerald-500 to-purple-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <User size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm">
                {searchQuery.length < 2
                  ? "Entrez au moins 2 caractères"
                  : "Aucun utilisateur trouvé"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user.id);
                    onClose();
                  }}
                  className="w-full p-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-purple-50 transition flex items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400 flex items-center justify-center overflow-hidden">
                    {user.image ? (
                      <img src={user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {user.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
