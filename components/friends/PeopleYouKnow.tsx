"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

interface PersonYouKnow {
  id: string;
  name: string;
  email: string;
  image: string | null;
  church: string | null;
  mutualFriends?: number;
}

export default function PeopleYouKnow() {
  const [people, setPeople] = useState<PersonYouKnow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPeopleYouKnow();
  }, []);

  const fetchPeopleYouKnow = async () => {
    try {
      const response = await fetch("/api/friends/suggestions");
      if (response.ok) {
        const data = await response.json();
        setPeople(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error fetching people you know:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={18} className="text-blue-500" />
          Personnes que vous connaissez
        </h3>
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Users size={18} className="text-blue-500" />
        Personnes que vous connaissez
      </h3>

      {people.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucune suggestion disponible</p>
      ) : (
        <div className="space-y-3">
          {people.slice(0, 5).map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              {person.image ? (
                <img
                  src={person.image}
                  alt={person.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-sm">
                    {(person.name || person.email)[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{person.name || "Anonyme"}</p>
                <p className="text-xs text-gray-500 truncate">
                  {person.mutualFriends ? `${person.mutualFriends} amis communs` : person.church || person.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
