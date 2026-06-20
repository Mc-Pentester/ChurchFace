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
        where: {
          userId: session.user.id,
        },
      },
      _count: {
        select: {
          members: true,
          followers: true,
          events: true,
          posts: true,
          lives: true,
          courses: true,
        },
      },
    },
  });

  if (!church) {
    return null;
  }

  // Check if user is admin
  if (church.admins.length === 0) {
    redirect(`/church/${slug}`);
  }

  return church;
}

export default async function ChurchDashboard({ params }: { params: Promise<{ slug: string }> }) {
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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Église</h1>
              <p className="text-gray-600">{church.name}</p>
            </div>
            <a
              href={`/church/${slug}`}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Voir la page publique
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                👥
              </div>
              <span className="text-gray-600 text-sm">Membres</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{church._count.members}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                📝
              </div>
              <span className="text-gray-600 text-sm">Publications</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{church._count.posts}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                📅
              </div>
              <span className="text-gray-600 text-sm">Événements</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{church._count.events}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                📺
              </div>
              <span className="text-gray-600 text-sm">Lives</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{church._count.lives}</p>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Membres */}
          <a href={`/church/${slug}/dashboard/members`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-100 text-emerald-600 p-4 rounded-xl">
                👥
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Membres</h3>
                <p className="text-sm text-gray-500">Gérer les membres de l'église</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{church._count.members} membres</p>
          </a>

          {/* Publications */}
          <a href={`/church/${slug}/dashboard/posts`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 text-blue-600 p-4 rounded-xl">
                📝
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Publications</h3>
                <p className="text-sm text-gray-500">Créer et gérer les publications</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{church._count.posts} publications</p>
          </a>

          {/* Événements */}
          <a href={`/church/${slug}/dashboard/events`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 text-purple-600 p-4 rounded-xl">
                📅
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Événements</h3>
                <p className="text-sm text-gray-500">Créer et gérer les événements</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{church._count.events} événements</p>
          </a>

          {/* Lives */}
          <a href={`/church/${slug}/dashboard/lives`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 text-red-600 p-4 rounded-xl">
                📺
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Lives</h3>
                <p className="text-sm text-gray-500">Gérer les diffusions en direct</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{church._count.lives} lives</p>
          </a>

          {/* Radio */}
          <a href={`/church/${slug}/dashboard/radio`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 text-purple-600 p-4 rounded-xl">
                🎙
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Radio</h3>
                <p className="text-sm text-gray-500">Gérer la radio de l'église</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Configurer la radio</p>
          </a>

          {/* Formations */}
          <a href={`/church/${slug}/dashboard/courses`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 text-green-600 p-4 rounded-xl">
                📚
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Formations</h3>
                <p className="text-sm text-gray-500">Créer et gérer les formations</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{church._count.courses} formations</p>
          </a>

          {/* Statistiques */}
          <a href={`/church/${slug}/dashboard/stats`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-yellow-100 text-yellow-600 p-4 rounded-xl">
                📊
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Statistiques</h3>
                <p className="text-sm text-gray-500">Voir les statistiques détaillées</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Analytiques et rapports</p>
          </a>

          {/* Paramètres */}
          <a href={`/church/${slug}/dashboard/settings`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gray-100 text-gray-600 p-4 rounded-xl">
                ⚙
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Paramètres</h3>
                <p className="text-sm text-gray-500">Configurer l'église</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Informations et préférences</p>
          </a>

          {/* Gestion des responsables */}
          <a href={`/church/${slug}/dashboard/admins`} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-orange-100 text-orange-600 p-4 rounded-xl">
                🔑
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Responsables</h3>
                <p className="text-sm text-gray-500">Gérer les administrateurs</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Rôles et permissions</p>
          </a>
        </div>
      </div>
    </div>
  );
}
