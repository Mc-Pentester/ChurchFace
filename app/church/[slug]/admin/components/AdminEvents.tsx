import { prisma } from "@/lib/prisma";

interface AdminEventsProps {
  churchId: string;
  churchSlug: string;
}

export default async function AdminEvents({ churchId, churchSlug }: AdminEventsProps) {
  const events = await prisma.churchEvent.findMany({
    where: { churchId },
    take: 10,
    orderBy: { startDate: "desc" },
    include: {
      _count: {
        select: {
          attendees: true,
        },
      },
    },
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Événements</h2>
        <a
          href={`/church/${churchSlug}/admin/events/create`}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
        >
          Créer un événement
        </a>
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun événement pour le moment</p>
        ) : (
          events.map((event: any) => (
            <div key={event.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                  {event.description && (
                    <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📅 {new Date(event.startDate).toLocaleDateString("fr-FR")}</span>
                    <span>👥 {event._count.attendees} participants</span>
                    {event.location && <span>📍 {event.location}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 text-gray-500 hover:text-emerald-600 transition">
                    ✏️
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 transition">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
