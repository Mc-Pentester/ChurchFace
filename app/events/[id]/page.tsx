import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";


interface EventPageProps {
  params: {
    id: string;
  };
}


export default async function EventDetailPage({
  params,
}: EventPageProps) {


  const event = await prisma.churchEvent.findUnique({

    where: {
      id: params.id,
    },

    include: {

      church: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },

      attendees: {
        select: {
          id: true,
        },
      },

    },

  });


  if (!event || !event.isPublic) {
    notFound();
  }



  return (

    <main className="min-h-screen bg-gray-50 p-6">


      <div className="max-w-4xl mx-auto">


        <Link
          href="/events"
          className="
            text-emerald-600
            hover:underline
            mb-6
            inline-block
          "
        >
          ← Retour aux événements
        </Link>



        <article
          className="
            bg-white
            rounded-2xl
            shadow-sm
            overflow-hidden
          "
        >


          {event.imageUrl ? (

            <Image

              src={event.imageUrl}

              alt={event.title}

              width={1000}

              height={500}

              className="
                w-full
                h-[400px]
                object-cover
              "

              unoptimized

            />

          ) : (

            <div
              className="
                h-[300px]
                bg-emerald-50
                flex
                items-center
                justify-center
                text-7xl
              "
            >
              ⛪
            </div>

          )}




          <div className="p-8">



            <h1
              className="
                text-4xl
                font-bold
                text-gray-800
                mb-4
              "
            >
              {event.title}
            </h1>




            <Link
              href={`/church/${event.church.slug}`}
              className="
                text-emerald-600
                font-semibold
                hover:underline
              "
            >
              ⛪ Organisé par {event.church.name}
            </Link>




            <div
              className="
                mt-6
                space-y-3
                text-gray-700
              "
            >

              <p>
                📅{" "}
                {event.startDate.toLocaleDateString(
                  "fr-FR",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </p>


              <p>
                🕒{" "}
                {event.startDate.toLocaleTimeString(
                  "fr-FR",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>



              {event.endDate && (

                <p>
                  🏁 Fin :{" "}
                  {event.endDate.toLocaleTimeString(
                    "fr-FR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>

              )}




              {event.location && (

                <p>
                  📍 {event.location}
                </p>

              )}



              <p>
                👥 {event.attendees.length || event.attendeeCount} participants
              </p>


            </div>





            {event.description && (

              <div className="mt-8">


                <h2
                  className="
                    text-xl
                    font-bold
                    mb-3
                  "
                >
                  À propos
                </h2>


                <p
                  className="
                    text-gray-700
                    whitespace-pre-line
                  "
                >
                  {event.description}
                </p>


              </div>

            )}






            <div className="mt-8">


              <button
                className="
                  bg-emerald-600
                  text-white
                  px-6
                  py-3
                  rounded-xl
                  font-semibold
                  hover:bg-emerald-700
                  transition
                "
              >
                🙋 Je participe
              </button>


            </div>



          </div>


        </article>



      </div>


    </main>

  );
}