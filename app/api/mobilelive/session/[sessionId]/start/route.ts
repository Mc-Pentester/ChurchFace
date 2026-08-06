/**
 * API Route pour démarrer un live mobile
 * ChurchFace V1 - Live Mobile Instantané
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { MobileLiveService } from "@/lib/mobilelive/MobileLiveService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    const sessionData = await MobileLiveService.startLive(sessionId);

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Error starting live:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start live" },
      { status: 500 }
    );
  }
}
