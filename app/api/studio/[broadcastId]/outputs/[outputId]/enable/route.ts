/**
 * API Route pour activer une destination de diffusion
 * ChurchFace V1 - StudioPro Extension
 */

import { NextRequest, NextResponse } from "next/server";
import { BroadcastOutputService } from "@/lib/broadcast/BroadcastOutputService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ broadcastId: string; outputId: string }> }
) {
  try {
    const { outputId } = await params;

    const output = await BroadcastOutputService.enableOutput(outputId);

    return NextResponse.json(output);
  } catch (error) {
    console.error("Error enabling output:", error);
    return NextResponse.json(
      { error: "Failed to enable output" },
      { status: 500 }
    );
  }
}
