/**
 * API Route pour créer une session Mobile Live
 * ChurchFace V1 - Live Mobile Instantané
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { MobileLiveService } from "@/lib/mobilelive/MobileLiveService";
import { MobileLiveContext, MobileLiveConfig } from "@/lib/mobilelive/MobileLiveTypes";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { context, ownerId, ownerType, config } = body as {
      context: MobileLiveContext;
      ownerId: string;
      ownerType: "USER" | "CHURCH";
      config: MobileLiveConfig;
    };

    const mobileLiveConfig: MobileLiveConfig = {
      title: config.title || "Live",
      description: config.description,
      category: config.category,
      visibility: config.visibility || "PUBLIC",
      enableRecording: config.enableRecording || false,
      enableChat: config.enableChat !== false,
      enableReactions: config.enableReactions !== false,
    };

    const sessionData = await MobileLiveService.createSession({
      userId: session.user.id,
      context,
      ownerId,
      ownerType,
      config: mobileLiveConfig,
    });

    return NextResponse.json(sessionData, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create session" },
      { status: 500 }
    );
  }
}
