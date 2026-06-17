import { MapPinIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon, ClockIcon } from "@heroicons/react/24/outline";

interface ChurchSidebarProps {
  church: any;
}

export default function ChurchSidebar({ church }: ChurchSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Informations</h3>
        
        <div className="space-y-3">
          {church.address && (
            <div className="flex items-start gap-3">
              <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
              <span className="text-sm text-gray-600">{church.address}</span>
            </div>
          )}
          
          {church.phone && (
            <div className="flex items-center gap-3">
              <PhoneIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{church.phone}</span>
            </div>
          )}
          
          {church.email && (
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">{church.email}</span>
            </div>
          )}
          
          {church.website && (
            <div className="flex items-center gap-3">
              <GlobeAltIcon className="w-5 h-5 text-gray-400" />
              <a 
                href={church.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-emerald-600 hover:underline"
              >
                {church.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Horaires */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-gray-400" />
          Horaires
        </h3>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Culte dominical</span>
            <span className="font-medium">09:00</span>
          </div>
          <div className="flex justify-between">
            <span>Étude biblique</span>
            <span className="font-medium">18:00</span>
          </div>
          <div className="flex justify-between">
            <span>Réunion de prière</span>
            <span className="font-medium">19:00</span>
          </div>
          <div className="flex justify-between">
            <span>Jeunesse</span>
            <span className="font-medium">Samedi 16:00</span>
          </div>
        </div>
      </div>

      {/* Responsables */}
      {church.admins && church.admins.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Responsables</h3>
          
          <div className="space-y-3">
            {church.admins.map((admin: any) => (
              <div key={admin.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-medium">
                  {admin.user.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{admin.user.name}</p>
                  <p className="text-xs text-gray-500">{admin.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Radio Widget */}
      {church.radioEnabled && (
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="font-semibold">Radio en direct</span>
          </div>
          <p className="text-sm text-emerald-100 mb-4">
            Écoutez notre radio en direct
          </p>
          <button className="w-full py-2 bg-white text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition">
            Écouter
          </button>
        </div>
      )}
    </div>
  );
}
