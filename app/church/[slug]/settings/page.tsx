import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ChurchSettingsForm from "./components/ChurchSettingsForm";

export const runtime = "nodejs";

async function getChurch(slug: string) {
  const church = await prisma.church.findUnique({
    where: { slug },
    include: {
      admins: true,
    },
  });

  if (!church) {
    return null;
  }

  return church;
}

export default async function ChurchSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const church = await getChurch(slug);

  if (!church) {
    notFound();
  }

  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = church.admins.some(admin => admin.userId === session.user.id);
  if (!isAdmin) {
    redirect(`/church/${slug}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres de l'église</h1>
          <p className="text-gray-600">Modifiez les informations de votre église</p>
        </div>

        <ChurchSettingsForm church={church} />
      </div>
    </div>
  );
}
