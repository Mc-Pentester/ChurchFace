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

  // Generate LiveKit token via API
  let livekitToken: string | undefined;
  let livekitUrl: string | undefined;

  try {
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/livekit/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName: `studio-${broadcastId}`,
        participantName: session.user.name || 'Studio Host',
        metadata: JSON.stringify({ userId: session.user.id, role: 'host' }),
      }),
      cache: 'no-store',
    });

    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      livekitToken = tokenData.token;
      livekitUrl = tokenData.url;
    }
  } catch (error) {
    console.error("Failed to generate LiveKit token:", error);
  }

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
