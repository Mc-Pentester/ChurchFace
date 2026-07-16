import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";


interface AdminEventPageProps {
  params: {
    slug: string;
    id: string;
  };
}


export default async function AdminEventPage({
  params,
}: AdminEventPageProps) {


  const church = await prisma.church.findUnique({

    where: {
      slug: params.slug,
    },

    select: {
      id: true,
      name: true,
      slug: true,
    },

  });



  if (!church) {
    notFound();
  }



  const event = await prisma.churchEvent.findFirst({

    where: {
      id: params.id,
      churchId: church.id,
    },


    include: {

      attendees: {

        include: {

          user: {

            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },

          },

        },

      },

    },

  });



  if (!event) {
    notFound();
  }




  return (

    <main className="p-6 bg-gray-50 min-h-screen">


      <div className="max-w-5xl mx-auto">



        <div className="mb-6 flex justify-between items-center">


          <div>

            <Link
              href={`/church/${church.slug}/admin/events`}
              className="
                text-emerald-600
                hover:underline
              "
            >
              ← Retour aux événements
            </Link>


            <h1
              className="
                text-3xl
                font-bold
                mt-3
                text-gray-800
              "
            >
              Gestion de l'événement
            </h1>


          </div>



          <div className="flex gap-3">


            <Link

              href={`/church/${church.slug}/admin/events/${event.id}/edit`}

              className="
                bg-emerald-600
                text-white
                px-4
                py-2
                rounded-lg
              "
            >
              Modifier
            </Link>


          </div>


        </div>





        <section
          className="
            bg-white
            rounded-2xl
            shadow
            overflow-hidden
          "
        >



          {event.imageUrl && (

            <Image

              src={event.imageUrl}

              alt={event.title}

              width={900}

              height={400}

              className="
                w-full
                h-80
                object-cover
              "

              unoptimized

            />

          )}





          <div className="p-6">



            <h2
              className="
                text-3xl
                font-bold
                mb-4
              "
            >
              {event.title}
            </h2>




            <div className="space-y-3 text-gray-700">


              <p>
                📅{" "}
                {event.startDate.toLocaleDateString(
                  "fr-FR",
                  {
                    weekday:"long",
                    day:"numeric",
                    month:"long",
                    year:"numeric",
                  }
                )}
              </p>



              <p>
                🕒{" "}
                {event.startDate.toLocaleTimeString(
                  "fr-FR",
                  {
                    hour:"2-digit",
                    minute:"2-digit",
                  }
                )}
              </p>




              {event.location && (

                <p>
                  📍 {event.location}
                </p>

              )}



              <p>
                🌍 Visibilité :
                {" "}
                {event.isPublic
                  ? "Public"
                  : "Privé"
                }
              </p>



              <p>
                👥 Participants :
                {" "}
                {event.attendees.length}
              </p>


            </div>





            {event.description && (

              <div className="mt-6">

                <h3 className="font-bold text-xl mb-2">
                  Description
                </h3>


                <p className="whitespace-pre-line text-gray-700">
                  {event.description}
                </p>


              </div>

            )}



          </div>



        </section>







        <section
          className="
            mt-8
            bg-white
            rounded-2xl
            shadow
            p-6
          "
        >


          <h2
            className="
              text-2xl
              font-bold
              mb-5
            "
          >
            Participants ({event.attendees.length})
          </h2>




          {event.attendees.length === 0 ? (

            <p className="text-gray-500">
              Aucun participant pour le moment.
            </p>


          ) : (


            <div className="space-y-4">


              {event.attendees.map((attendee)=>(


                <div

                  key={attendee.id}

                  className="
                    flex
                    items-center
                    gap-4
                    border-b
                    pb-3
                  "

                >


                  {attendee.user.image ? (

                    <Image

                      src={attendee.user.image}

                      alt={attendee.user.name ?? "Utilisateur"}

                      width={45}

                      height={45}

                      className="rounded-full"

                      unoptimized

                    />

                  ) : (

                    <div
                      className="
                        w-11
                        h-11
                        rounded-full
                        bg-gray-200
                        flex
                        items-center
                        justify-center
                      "
                    >
                      👤
                    </div>

                  )}



                  <div>

                    <p className="font-semibold">
                      {attendee.user.name}
                    </p>


                    <p className="text-sm text-gray-500">
                      {attendee.user.email}
                    </p>


                  </div>


                </div>


              ))}


            </div>


          )}



        </section>




      </div>


    </main>

  );
}