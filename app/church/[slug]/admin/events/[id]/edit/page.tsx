import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import UpdateEventForm from "./UpdateEventForm";

interface PageProps {
  params: {
    slug: string;
    id: string;
  };
}

export default async function EditEventPage({ params }: PageProps) {

  const { slug, id } = params;


  const church = await prisma.church.findUnique({
    where: {
      slug,
    },
  });


  if (!church) {
    notFound();
  }


  const event = await prisma.churchEvent.findFirst({
    where: {
      id,
      churchId: church.id,
    },
  });


  if (!event) {
    notFound();
  }


  return (
    <main className="p-6 max-w-3xl">

      <div className="mb-6">

        <Link
          href={`/church/${slug}/admin/events`}
          className="text-emerald-600 hover:underline"
        >
          ← Retour aux événements
        </Link>

      </div>


      <h1 className="text-3xl font-bold mb-6">
        Modifier l'événement
      </h1>


      <UpdateEventForm
        churchId={church.id}
        slug={slug}
        event={{
          id:event.id,
          title:event.title,
          description:event.description ?? "",
          location:event.location ?? "",
          imageUrl:event.imageUrl ?? "",
          startDate:event.startDate.toISOString(),
          endDate:event.endDate?.toISOString() ?? "",
          isPublic:event.isPublic,
        }}
      />


    </main>
  );
}