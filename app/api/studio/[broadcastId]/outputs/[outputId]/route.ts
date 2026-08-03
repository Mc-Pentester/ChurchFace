/**
 * API Route pour gérer une destination de diffusion individuelle
 * ChurchFace V1 - StudioPro Extension
 */

import { NextRequest, NextResponse } from "next/server";
import { BroadcastOutputService } from "@/lib/broadcast/BroadcastOutputService";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ broadcastId: string; outputId: string }> }
) {
  try {
    const { broadcastId, outputId } = await params;
    const body = await request.json();

    const output = await BroadcastOutputService.updateOutput({
      id: outputId,
      name: body.name,
      rtmpUrl: body.rtmpUrl,
      streamKey: body.streamKey,
      enabled: body.enabled,
      config: body.config,
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("Error updating output:", error);
    return NextResponse.json(
      { error: "Failed to update output" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ broadcastId: string; outputId: string }> }
) {
  try {
    const { outputId } = await params;

    await BroadcastOutputService.deleteOutput(outputId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting output:", error);
    return NextResponse.json(
      { error: "Failed to delete output" },
      { status: 500 }
    );
  }
}
