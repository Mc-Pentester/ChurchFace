"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Save, X } from "lucide-react";

interface Church {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  slogan: string | null;
  logo: string | null;
  coverImage: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  schedule: any;
}

interface Props {
  church: Church;
}

export default function ChurchSettingsForm({ church }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: church.name,
    description: church.description || "",
    slogan: church.slogan || "",
    email: church.email || "",
    phone: church.phone || "",
    address: church.address || "",
    city: church.city || "",
    country: church.country || "",
    website: church.website || "",
  });

  const [schedule, setSchedule] = useState<any[]>(church.schedule || []);
  const [newSchedule, setNewSchedule] = useState({ day: "", startTime: "", endTime: "", activity: "" });

  const [logoPreview, setLogoPreview] = useState<string | null>(church.logo);
  const [coverPreview, setCoverPreview] = useState<string | null>(church.coverImage);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({ ...prev, [name]: value }));
  };

  const addSchedule = () => {
    if (newSchedule.day && newSchedule.startTime && newSchedule.endTime) {
      setSchedule(prev => [...prev, { ...newSchedule, id: Date.now().toString() }]);
      setNewSchedule({ day: "", startTime: "", endTime: "", activity: "" });
    }
  };

  const removeSchedule = (id: string) => {
    setSchedule(prev => prev.filter(s => s.id !== id));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("slogan", formData.slogan);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("website", formData.website);
      formDataToSend.append("schedule", JSON.stringify(schedule));

      if (logoFile) {
        formDataToSend.append("logo", logoFile);
      } else if (logoPreview === null) {
        formDataToSend.append("removeLogo", "true");
      }

      if (coverFile) {
        formDataToSend.append("coverImage", coverFile);
      } else if (coverPreview === null) {
        formDataToSend.append("removeCover", "true");
      }

      const response = await fetch(`/api/church/${church.slug}`, {
        method: "PATCH",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to update church");
      }

      setMessage({ type: "success", text: "Église mise à jour avec succès" });
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-r from-violet-600 to-purple-600">
        {coverPreview ? (
          <img
            src={coverPreview}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <label className="cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-white flex items-center gap-2 transition">
            <Camera size={20} />
            <span>{coverPreview ? "Changer la couverture" : "Ajouter une couverture"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </label>
        </div>
        {coverPreview && (
          <button
            onClick={(e) => {
              e.preventDefault();
              removeCover();
            }}
            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Logo */}
      <div className="relative -mt-16 mb-4 px-8">
        <div className="w-32 h-32 rounded-full bg-white shadow-lg overflow-hidden border-4 border-white">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Camera size={40} className="text-gray-400" />
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4">
          <label className="cursor-pointer bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 transition">
            <Camera size={16} />
            <span>Logo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>
        </div>
        {logoPreview && (
          <button
            onClick={removeLogo}
            className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="px-8 pb-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'église
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slogan
            </label>
            <input
              type="text"
              name="slogan"
              value={formData.slogan}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site web
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Horaires de fonctionnement */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Horaires de fonctionnement</h3>
            
            {/* Liste des horaires existants */}
            {schedule.length > 0 && (
              <div className="space-y-2 mb-4">
                {schedule.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium">{item.day}</span>
                      <span className="text-gray-600 mx-2">|</span>
                      <span className="text-gray-700">{item.startTime} - {item.endTime}</span>
                      {item.activity && (
                        <>
                          <span className="text-gray-600 mx-2">|</span>
                          <span className="text-gray-700">{item.activity}</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => removeSchedule(item.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulaire d'ajout d'horaire */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jour</label>
                  <select
                    name="day"
                    value={newSchedule.day}
                    onChange={handleScheduleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Lundi">Lundi</option>
                    <option value="Mardi">Mardi</option>
                    <option value="Mercredi">Mercredi</option>
                    <option value="Jeudi">Jeudi</option>
                    <option value="Vendredi">Vendredi</option>
                    <option value="Samedi">Samedi</option>
                    <option value="Dimanche">Dimanche</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                  <input
                    type="time"
                    name="startTime"
                    value={newSchedule.startTime}
                    onChange={handleScheduleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                  <input
                    type="time"
                    name="endTime"
                    value={newSchedule.endTime}
                    onChange={handleScheduleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activité (optionnel)</label>
                  <input
                    type="text"
                    name="activity"
                    value={newSchedule.activity}
                    onChange={handleScheduleChange}
                    placeholder="Ex: Culte, Réunion..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addSchedule}
                className="mt-3 w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition"
              >
                Ajouter un horaire
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg flex items-center gap-2 transition disabled:opacity-50"
            >
              <Save size={20} />
              <span>{loading ? "Enregistrement..." : "Enregistrer"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
