/**
 * API Route pour vérifier les permissions Mobile Live
 * ChurchFace V1 - Live Mobile Instantané
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { MobileLivePermissionService } from "@/lib/mobilelive/MobileLivePermissionService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const context = searchParams.get("context") as "PERSONAL" | "CHURCH" | null;
    const ownerId = searchParams.get("ownerId") || undefined;
    const ownerType = searchParams.get("ownerType") as "USER" | "CHURCH" | null;

    if (!context) {
      return NextResponse.json({ error: "Missing context parameter" }, { status: 400 });
    }

    const permissions = await MobileLivePermissionService.canStartLive({
      userId: session.user.id,
      context,
      ownerId,
      ownerType: ownerType || undefined,
    });

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Error checking permissions:", error);
    return NextResponse.json(
      { error: "Failed to check permissions" },
      { status: 500 }
    );
  }
}
