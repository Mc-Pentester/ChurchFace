"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "../components/AdminSidebar";

interface ChurchSettingsProps {
  church: any;
}

export default function ChurchSettings({ church }: ChurchSettingsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: church.name || "",
    slug: church.slug || "",
    description: church.description || "",
    slogan: church.slogan || "",
    website: church.website || "",
    email: church.email || "",
    phone: church.phone || "",
    address: church.address || "",
    city: church.city || "",
    country: church.country || "",
    logo: church.logo || "",
    coverImage: church.coverImage || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/church/${church.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update church");
      }

      setSuccess("Profil mis à jour avec succès");
      setTimeout(() => {
        router.push(`/church/${church.slug}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar church={church} />
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Paramètres - {church.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Modifiez les informations de votre église
            </p>
          </div>

          <div className="max-w-3xl">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo de profil (Logo)
                </label>
                <div className="flex items-center gap-4">
                  {formData.logo && (
                    <img
                      src={formData.logo}
                      alt="Logo"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      name="logo"
                      value={formData.logo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="URL de l'image du logo"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // For now, just use a placeholder URL
                            // In production, you'd upload to a service like Cloudinary or UploadThing
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData((prev) => ({ ...prev, logo: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                      <span className="text-xs text-gray-500">ou uploader une image</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo de couverture
                </label>
                <div className="flex flex-col gap-4">
                  {formData.coverImage && (
                    <img
                      src={formData.coverImage}
                      alt="Cover"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  <div className="space-y-2">
                    <input
                      type="url"
                      name="coverImage"
                      value={formData.coverImage}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="URL de l'image de couverture"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData((prev) => ({ ...prev, coverImage: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                      <span className="text-xs text-gray-500">ou uploader une image</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'église *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50"
                />
              </div>

              {/* Slogan */}
              <div>
                <label htmlFor="slogan" className="block text-sm font-medium text-gray-700 mb-2">
                  Slogan
                </label>
                <input
                  type="text"
                  id="slogan"
                  name="slogan"
                  value={formData.slogan}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* City and Country */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Pays
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Mise à jour en cours..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
