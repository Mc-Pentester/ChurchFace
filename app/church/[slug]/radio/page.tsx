import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import { Radio, Play, Pause, Volume2 } from "lucide-react";

export const runtime = "nodejs";

async function getChurchRadio(slug: string) {
  const church = await prisma.church.findUnique({
    where: { slug },
    include: {
      radios: true,
      playlists: {
        include: {
          items: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!church) {
    return null;
  }

  return church;
}

export default async function ChurchRadioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const church = await getChurchRadio(slug);

  if (!church) {
    notFound();
  }

  const churchRadio = church.radios?.[0];
  const isLive = churchRadio?.isActive || false;
  const playlists = church.playlists || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Radio de {church.name}</h1>
          <p className="text-gray-600">Écoutez la radio en direct</p>
        </div>

        {churchRadio ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Radio Player */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${isLive ? "bg-red-500 animate-pulse" : "bg-gray-400"}`} />
                  <span className="font-semibold">{isLive ? "EN DIRECT" : "HORS LIGNE"}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition">
                  {isLive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{churchRadio.name || church.name}</h2>
                  <p className="text-sm opacity-80">Diffusion en direct</p>
                </div>
                <button className="p-2 hover:bg-white/20 rounded-full transition">
                  <Volume2 size={20} />
                </button>
              </div>
            </div>

            {/* Playlists */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Playlists</h3>
              {playlists && playlists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playlists.map((playlist: any) => (
                    <div key={playlist.id} className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer">
                      <h4 className="font-semibold text-gray-900">{playlist.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{playlist.description}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <span>{playlist.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucune playlist disponible</p>
              )}

              <div className="mt-6">
                <a
                  href={`/church/${slug}/studio`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                >
                  <Radio size={16} />
                  Accéder au Studio Radio
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Radio size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Radio non configurée</h2>
            <p className="text-gray-600">Cette église n'a pas encore configuré sa radio.</p>
          </div>
        )}
      </div>
    </div>
  );
}
