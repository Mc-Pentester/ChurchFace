import Link from "next/link";
import { 
  HomeIcon, 
  UsersIcon, 
  DocumentTextIcon, 
  CalendarIcon,
  PhotoIcon,
  RadioIcon,
  VideoCameraIcon,
  AcademicCapIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

interface AdminSidebarProps {
  church: any;
}

export default function AdminSidebar({ church }: AdminSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: HomeIcon, href: "" },
    { id: "members", label: "Membres", icon: UsersIcon, href: "members" },
    { id: "posts", label: "Publications", icon: DocumentTextIcon, href: "posts" },
    { id: "events", label: "Événements", icon: CalendarIcon, href: "events" },
    { id: "media", label: "Médias", icon: PhotoIcon, href: "media" },
    { id: "radio", label: "Radio", icon: RadioIcon, href: "radio" },
    { id: "studio", label: "Studio Radio", icon: RadioIcon, href: "studio" },
    { id: "live", label: "Live", icon: VideoCameraIcon, href: "live" },
    { id: "studio-live", label: "Studio Live", icon: VideoCameraIcon, href: "studio/live" },
    { id: "courses", label: "Formations", icon: AcademicCapIcon, href: "courses" },
    { id: "settings", label: "Paramètres", icon: CogIcon, href: "settings" },
  ];

  return (
    <div className="w-64 bg-white border-r min-h-screen p-6">
      <div className="mb-8">
        <Link href={`/church/${church.slug}`} className="text-emerald-600 hover:underline text-sm">
          ← Retour à la page publique
        </Link>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href ? item.href : "#"}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
