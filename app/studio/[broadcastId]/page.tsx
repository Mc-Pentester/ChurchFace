import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudioLive from "@/components/live/studio/StudioLive";

interface PageProps {
  params: {
    broadcastId: string;
  };
}

export default async function StudioPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { broadcastId } = await params;

  // Fetch broadcast with studio config
  const broadcast = await prisma.liveBroadcast.findUnique({
    where: { id: broadcastId },
    include: {
      scenes: {
        include: {
          sources: true,
        },
        orderBy: { order: "asc" },
      },
      outputs: true,
    },
  });

  if (!broadcast) {
    redirect("/live");
  }

  // Check if user owns this broadcast
  if (broadcast.authorId !== session.user.id) {
    redirect("/live");
  }

  // Generate LiveKit token (in production, this would call the API)
  const livekitToken = process.env.LIVEKIT_API_KEY ? "mock-token" : undefined;
  const livekitUrl = process.env.LIVEKIT_URL;
  const roomName = `studio-${broadcastId}`;

  return (
    <StudioLive
      broadcastId={broadcastId}
      livekitToken={livekitToken}
      livekitUrl={livekitUrl}
      roomName={roomName}
    />
  );
}
