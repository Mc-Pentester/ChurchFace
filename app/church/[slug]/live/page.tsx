import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import { Video, Play, Pause, Users } from "lucide-react";
import LiveVideoPlayer from "./components/LiveVideoPlayer";

export const runtime = "nodejs";

async function getChurchLive(slug: string) {
  const church = await prisma.church.findUnique({
    where: { slug },
  });

  if (!church) {
    console.log("getChurchLive: Church not found for slug", slug);
    return null;
  }

  console.log("getChurchLive: Church found", church.id, church.name);

  // Récupérer les broadcasts de cette église
  const broadcasts = await prisma.liveBroadcast.findMany({
    where: {
      ownerType: "CHURCH",
      ownerId: church.id,
      status: "LIVE",
    },
    orderBy: { startedAt: "desc" },
    take: 1,
    include: {
      outputs: true,
      author: true,
    },
  });

  console.log("getChurchLive: Broadcasts found", broadcasts.length, broadcasts[0]?.id, broadcasts[0]?.status, broadcasts[0]?.livekitRoom);

  return { church, broadcast: broadcasts[0] || null };
}

export default async function ChurchLivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getChurchLive(slug);

  if (!data) {
    notFound();
  }

  const { church, broadcast } = data;
  const isLive = broadcast?.status === "LIVE";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live de {church.name}</h1>
          <p className="text-gray-600">Regardez nos diffusions en direct</p>
        </div>

        {broadcast ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Video Player */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${isLive ? "bg-white animate-pulse" : "bg-gray-400"}`} />
                  <span className="font-semibold">{isLive ? "EN DIRECT" : "HORS LIGNE"}</span>
                </div>
                {isLive && (
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span className="text-sm">{broadcast.viewerCount || 0} spectateurs</span>
                  </div>
                )}
              </div>

              <LiveVideoPlayer broadcast={broadcast} isLive={isLive} />
            </div>

            {/* Live Info */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">{broadcast.title || "Diffusion en direct"}</h2>
              {broadcast.description && (
                <p className="text-gray-600 mt-1">{broadcast.description}</p>
              )}
              
              {broadcast.startedAt && (
                <div className="mt-4 text-sm text-gray-500">
                  <span>Commencé à : {new Date(broadcast.startedAt).toLocaleString()}</span>
                </div>
              )}

              <div className="mt-4">
                <a
                  href={`/church/${slug}/admin/live/${broadcast.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                >
                  <Video size={16} />
                  Accéder au Studio Live
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Video size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune diffusion en direct</h2>
            <p className="text-gray-600">Il n'y a actuellement aucune diffusion en direct pour cette église.</p>
          </div>
        )}
      </div>
    </div>
  );
}
