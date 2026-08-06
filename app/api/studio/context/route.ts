import { NextRequest, NextResponse } from "next/server";
import { BroadcastContextService } from "@/lib/broadcast/BroadcastContextService";
import { StudioPermissionService } from "@/lib/studio/StudioPermissionService";
import { ResolveContextParams } from "@/types/broadcast";

export const runtime = "nodejs";

/**
 * POST - Résoudre le contexte de diffusion avec vérification des permissions
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

    // Vérifier les permissions d'accès au Studio
    const accessCheck = await StudioPermissionService.canAccessStudio({
      userId: body.userId,
      userRole: body.userRole,
      churchSlug: body.churchSlug,
      broadcastId: body.broadcastId,
    });

    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: "Access denied", reason: accessCheck.reason },
        { status: 403 }
      );
    }

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
