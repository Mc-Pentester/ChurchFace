import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function EventsPage() {

  const events = await prisma.churchEvent.findMany({

    where: {
      isPublic: true,
      startDate: {
        gte: new Date()
      }
    },

    include: {
      church: {
        select: {
          name: true,
          slug: true
        }
      }
    },

    orderBy: {
      startDate: "asc"
    }

  });


  return (

    <main className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          📅 Événements à venir
        </h1>


        {events.length === 0 ? (

          <div className="
            bg-white 
            rounded-xl 
            shadow-sm 
            p-8 
            text-center 
            text-gray-500
          ">
            Aucun événement à venir pour le moment.
          </div>

        ) : (

          <div className="
            grid 
            sm:grid-cols-2 
            lg:grid-cols-3 
            gap-6
          ">

            {events.map((event) => (

              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="
                  bg-white
                  rounded-2xl
                  overflow-hidden
                  shadow-sm
                  hover:shadow-xl
                  transition
                "
              >


                {event.imageUrl ? (

                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    width={500}
                    height={300}
                    className="
                      w-full
                      h-48
                      object-cover
                    "
                    unoptimized
                  />

                ) : (

                  <div className="
                    h-48
                    bg-emerald-50
                    flex
                    items-center
                    justify-center
                    text-5xl
                  ">
                    ⛪
                  </div>

                )}



                <div className="p-5">


                  <h2 className="
                    text-xl
                    font-bold
                    text-gray-800
                    mb-2
                  ">
                    {event.title}
                  </h2>



                  <Link
                    href={`/church/${event.church.slug}`}
                    className="
                      text-sm
                      text-emerald-600
                      hover:underline
                    "
                    onClick={(e)=>e.stopPropagation()}
                  >
                    ⛪ {event.church.name}
                  </Link>



                  <p className="mt-3 text-gray-600">

                    📅{" "}
                    {event.startDate.toLocaleDateString(
                      "fr-FR",
                      {
                        weekday:"long",
                        day:"numeric",
                        month:"long",
                        year:"numeric"
                      }
                    )}

                  </p>



                  <p className="text-gray-600">

                    🕒{" "}
                    {event.startDate.toLocaleTimeString(
                      "fr-FR",
                      {
                        hour:"2-digit",
                        minute:"2-digit"
                      }
                    )}

                  </p>



                  {event.location && (

                    <p className="mt-2 text-gray-600">
                      📍 {event.location}
                    </p>

                  )}



                  <div className="
                    mt-4
                    text-sm
                    text-emerald-700
                    font-semibold
                  ">
                    Voir l'événement →
                  </div>


                </div>


              </Link>

            ))}

          </div>

        )}

      </div>

    </main>

  );
}