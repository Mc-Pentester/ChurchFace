/**
 * API Route pour arrêter un live mobile
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

    const sessionData = await MobileLiveService.stopLive(sessionId);

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Error stopping live:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to stop live" },
      { status: 500 }
    );
  }
}
