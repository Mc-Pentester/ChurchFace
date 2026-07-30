"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  churchId: string;
  slug: string;
  event: {
    id: string;
    title: string;
    description: string;
    location: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
    isPublic: boolean;
  };
}

export default function UpdateEventForm({
  churchId,
  slug,
  event
}: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    location: event.location,
    imageUrl: event.imageUrl,
    startDate: event.startDate,
    endDate: event.endDate,
    isPublic: event.isPublic,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/church/event/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      router.push(`/church/${slug}/admin/events`);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Erreur lors de la mise à jour de l'événement");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de début
          </label>
          <input
            type="datetime-local"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de fin
          </label>
          <input
            type="datetime-local"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lieu
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL de l'image
        </label>
        <input
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          checked={formData.isPublic}
          onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
        />
        <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
          Événement public
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.push(`/church/${slug}/admin/events`)}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}