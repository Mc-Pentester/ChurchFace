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
    { id: "dashboard", label: "Tableau de bord", icon: HomeIcon, href: `/church/${church.slug}/admin` },
    { id: "members", label: "Membres", icon: UsersIcon, href: `/church/${church.slug}/admin/members` },
    { id: "posts", label: "Publications", icon: DocumentTextIcon, href: `/church/${church.slug}/admin/posts` },
    { id: "events", label: "Événements", icon: CalendarIcon, href: `/church/${church.slug}/admin/events` },
    { id: "media", label: "Médias", icon: PhotoIcon, href: `/church/${church.slug}/admin/media` },
    { id: "radio", label: "Radio", icon: RadioIcon, href: `/church/${church.slug}/admin/radio` },
    { id: "studio", label: "Studio Radio", icon: RadioIcon, href: `/church/${church.slug}/admin/studio` },
    { id: "live", label: "Live", icon: VideoCameraIcon, href: `/church/${church.slug}/admin/live` },
    { id: "studio-live", label: "Studio Live", icon: VideoCameraIcon, href: `/church/${church.slug}/admin/studio/live` },
    { id: "courses", label: "Formations", icon: AcademicCapIcon, href: `/church/${church.slug}/admin/courses` },
    { id: "settings", label: "Paramètres", icon: CogIcon, href: `/church/${church.slug}/admin/settings` },
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
              href={item.href}
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
