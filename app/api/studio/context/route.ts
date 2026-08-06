import { NextRequest, NextResponse } from "next/server";
import { BroadcastContextService } from "@/lib/broadcast/BroadcastContextService";
import { ResolveContextParams } from "@/types/broadcast";

export const runtime = "nodejs";

/**
 * POST - Résoudre le contexte de diffusion
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params: ResolveContextParams = {
      broadcastId: body.broadcastId,
      churchSlug: body.churchSlug,
      userId: body.userId,
      userRole: body.userRole,
      userName: body.userName,
    };

    const context = await BroadcastContextService.resolveContext(params);

    return NextResponse.json(context);
  } catch (error) {
    console.error("Error resolving broadcast context:", error);
    return NextResponse.json(
      { error: "Failed to resolve broadcast context" },
      { status: 500 }
    );
  }
}
