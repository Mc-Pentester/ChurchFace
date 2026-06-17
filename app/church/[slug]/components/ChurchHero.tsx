import Image from "next/image";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

interface ChurchHeroProps {
  church: any;
}

export default function ChurchHero({ church }: ChurchHeroProps) {
  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-64 sm:h-80 bg-gradient-to-r from-emerald-600 to-emerald-800 relative">
        {church.coverImage && (
          <Image
            src={church.coverImage}
            alt={`${church.name} cover`}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
          {/* Logo */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-white shadow-xl border-4 border-white">
            {church.logo ? (
              <Image
                src={church.logo}
                alt={`${church.name} logo`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-600 text-4xl font-bold">
                {church.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {church.name}
              </h1>
              {church.isVerified && (
                <CheckBadgeIcon className="w-6 h-6 text-emerald-600" title="Église vérifiée" />
              )}
            </div>
            
            {church.slogan && (
              <p className="text-gray-600 text-sm sm:text-base mb-2">
                {church.slogan}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {church.city && church.country && (
                <span>
                  {church.city}, {church.country}
                </span>
              )}
              <span>•</span>
              <span>{church._count.members} membres</span>
              <span>•</span>
              <span>{church._count.followers} abonnés</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium">
              Suivre
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
              Message
            </button>
            {church.donationEnabled && (
              <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
                Faire un don
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
