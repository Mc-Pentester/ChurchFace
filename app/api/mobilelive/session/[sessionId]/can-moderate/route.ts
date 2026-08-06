/**
 * API Route pour vérifier si un utilisateur peut modérer un live
 * ChurchFace V1 - Live Mobile Instantané
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { MobileLivePermissionService } from "@/lib/mobilelive/MobileLivePermissionService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    const canModerate = await MobileLivePermissionService.canModerateLive({
      userId: session.user.id,
      broadcastId: sessionId,
    });

    return NextResponse.json({ canModerate });
  } catch (error) {
    console.error("Error checking moderation permission:", error);
    return NextResponse.json(
      { error: "Failed to check moderation permission" },
      { status: 500 }
    );
  }
}
