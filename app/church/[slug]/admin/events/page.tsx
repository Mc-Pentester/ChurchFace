import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function AdminEventsPage({ params }: PageProps) {
  const { slug } = await params;


  const church = await prisma.church.findUnique({
    where: {
      slug,
    },
    include: {
      events: {
        orderBy: {
          startDate: "desc",
        },
      },
    },
  });


  if (!church) {
    notFound();
  }


  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Événements
          </h1>

          <p className="text-gray-500 mt-1">
            Gestion des événements de {church.name}
          </p>
        </div>


        <Link
          href={`/church/${church.slug}/admin/events/create`}
          className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700"
        >
          + Créer un événement
        </Link>

      </div>



      {/* Liste */}
      <div className="grid gap-5">


        {church.events.length === 0 && (

          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            Aucun événement créé.
          </div>

        )}



        {church.events.map((event) => (

          <div
            key={event.id}
            className="bg-white rounded-xl shadow p-5 flex justify-between items-center"
          >


            <div>

              <h2 className="text-xl font-semibold">
                {event.title}
              </h2>


              <p className="text-gray-500 text-sm mt-1">
                {event.startDate.toLocaleDateString("fr-FR")}
              </p>


              {event.location && (

                <p className="text-sm text-gray-500">
                  📍 {event.location}
                </p>

              )}


              <div className="mt-2">

                {event.isPublic ? (

                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    🌍 Public
                  </span>

                ) : (

                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    🔒 Privé
                  </span>

                )}

              </div>


            </div>



            <div className="flex gap-3">


              <Link
                href={`/church/${church.slug}/admin/events/${event.id}/edit`}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Modifier
              </Link>


              <Link
                href={`/events/${event.id}`}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg"
              >
                Voir
              </Link>


            </div>


          </div>

        ))}


      </div>


    </div>
  );
}