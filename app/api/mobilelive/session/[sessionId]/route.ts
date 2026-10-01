/**
 * API Route pour obtenir/mettre à jour une session Mobile Live
 * ChurchFace V1 - Live Mobile Instantané
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"
import { MobileLiveService } from "@/lib/mobilelive/MobileLiveService";
import { authorize } from "@/lib/authorization/policy";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    const authorization = await authorize({ actorId: session.user.id, action: "MOBILELIVE_VIEW", resourceId: sessionId });
    if (authorization.status !== 200) return NextResponse.json({ error: authorization.status === 401 ? "Unauthorized" : "Forbidden" }, { status: authorization.status });

    const sessionData = await MobileLiveService.getSession(sessionId);

    if (!sessionData) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Error getting session:", error);
    return NextResponse.json(
      { error: "Failed to get session" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;
    const body = await request.json();

    const authorization = await authorize({ actorId: session.user.id, action: "MOBILELIVE_STATS_UPDATE", resourceId: sessionId });
    if (authorization.status !== 200) return NextResponse.json({ error: authorization.status === 401 ? "Unauthorized" : "Forbidden" }, { status: authorization.status });

    // Mettre à jour les statistiques
    if (body.viewerCount !== undefined) {
      await MobileLiveService.updateStats({
        sessionId,
        viewerCount: body.viewerCount,
        bitrate: body.bitrate,
        fps: body.fps,
        actorId: session.user.id,
      });
    }

    const sessionData = await MobileLiveService.getSession(sessionId);

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
