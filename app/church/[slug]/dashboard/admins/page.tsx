import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

async function getChurch(slug: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const church = await prisma.church.findUnique({
    where: { slug },
    include: {
      admins: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          appointedAt: "asc",
        },
      },
    },
  });

  if (!church) {
    return null;
  }

  // Check if user is admin
  const isAdmin = church.admins.some((admin) => admin.userId === session.user.id);
  if (!isAdmin) {
    redirect(`/church/${slug}`);
  }

  return church;
}

const roleLabels: Record<string, string> = {
  CHURCH_OWNER: "Propriétaire",
  CHURCH_ADMIN: "Administrateur",
  CHURCH_MODERATOR: "Modérateur",
  PASTOR: "Pasteur",
  ASSOCIATE_PASTOR: "Pasteur associé",
  RADIO_MANAGER: "Gestionnaire Radio",
  LIVE_MANAGER: "Gestionnaire Live",
  COURSE_MANAGER: "Gestionnaire Formations",
};

const roleColors: Record<string, string> = {
  CHURCH_OWNER: "bg-purple-100 text-purple-700",
  CHURCH_ADMIN: "bg-blue-100 text-blue-700",
  CHURCH_MODERATOR: "bg-green-100 text-green-700",
  PASTOR: "bg-yellow-100 text-yellow-700",
  ASSOCIATE_PASTOR: "bg-orange-100 text-orange-700",
  RADIO_MANAGER: "bg-pink-100 text-pink-700",
  LIVE_MANAGER: "bg-red-100 text-red-700",
  COURSE_MANAGER: "bg-indigo-100 text-indigo-700",
};

export default async function ChurchAdminsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const church = await getChurch(slug);

  if (!church) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des responsables</h1>
              <p className="text-gray-600">{church.name}</p>
            </div>
            <a
              href={`/church/${slug}/dashboard`}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Retour au dashboard
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Admin Button */}
        <div className="mb-6">
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium">
            + Ajouter un responsable
          </button>
        </div>

        {/* Admins List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">Responsables ({church.admins.length})</h2>
          </div>

          {church.admins.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucun responsable pour le moment
            </div>
          ) : (
            <div className="divide-y">
              {church.admins.map((admin) => (
                <div key={admin.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                      {admin.user.name?.charAt(0) || admin.user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{admin.user.name || admin.user.email}</p>
                      <p className="text-sm text-gray-500">{admin.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[admin.role] || "bg-gray-100 text-gray-700"}`}>
                      {roleLabels[admin.role] || admin.role}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      ⋯
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role Descriptions */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Description des rôles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-1">Propriétaire</h3>
              <p className="text-sm text-purple-700">Accès complet à tous les paramètres et gestion</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-1">Administrateur</h3>
              <p className="text-sm text-blue-700">Gestion des publications, événements et membres</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-1">Modérateur</h3>
              <p className="text-sm text-green-700">Modération des commentaires et publications</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-1">Pasteur</h3>
              <p className="text-sm text-yellow-700">Gestion des enseignements et prédications</p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <h3 className="font-medium text-pink-900 mb-1">Gestionnaire Radio</h3>
              <p className="text-sm text-pink-700">Gestion de la radio et des playlists</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-medium text-red-900 mb-1">Gestionnaire Live</h3>
              <p className="text-sm text-red-700">Gestion des diffusions en direct</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-medium text-indigo-900 mb-1">Gestionnaire Formations</h3>
              <p className="text-sm text-indigo-700">Gestion des cours et formations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
