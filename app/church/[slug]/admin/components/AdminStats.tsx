import { prisma } from "@/lib/prisma";

interface AdminStatsProps {
  churchId: string;
}

export default async function AdminStats({ churchId }: AdminStatsProps) {
  const stats = await Promise.all([
    prisma.churchMember.count({ where: { churchId, isActive: true } }),
    prisma.churchFollow.count({ where: { churchId } }),
    prisma.churchPost.count({ where: { churchId } }),
    prisma.churchEvent.count({ where: { churchId } }),
  ]);

  const [members, followers, posts, events] = stats;

  const statCards = [
    { label: "Membres", value: members, color: "bg-emerald-500" },
    { label: "Abonnés", value: followers, color: "bg-blue-500" },
    { label: "Publications", value: posts, color: "bg-purple-500" },
    { label: "Événements", value: events, color: "bg-orange-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 ${stat.color} rounded-lg`} />
          </div>
        </div>
      ))}
    </div>
  );
}
