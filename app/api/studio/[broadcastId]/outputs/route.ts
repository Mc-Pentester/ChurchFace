/**
 * API Route pour gérer les destinations de diffusion (Broadcast Outputs)
 * ChurchFace V1 - StudioPro Extension
 */

import { NextRequest, NextResponse } from "next/server";
import { BroadcastOutputService } from "@/lib/broadcast/BroadcastOutputService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ broadcastId: string }> }
) {
  try {
    const { broadcastId } = await params;

    const outputs = await BroadcastOutputService.listOutputs(broadcastId);

    return NextResponse.json(outputs);
  } catch (error) {
    console.error("Error fetching outputs:", error);
    return NextResponse.json(
      { error: "Failed to fetch outputs" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ broadcastId: string }> }
) {
  try {
    const { broadcastId } = await params;
    const body = await request.json();

    const output = await BroadcastOutputService.createOutput({
      broadcastId,
      type: body.type,
      name: body.name,
      rtmpUrl: body.rtmpUrl,
      streamKey: body.streamKey,
      enabled: body.enabled || false,
      config: body.config,
    });

    return NextResponse.json(output, { status: 201 });
  } catch (error) {
    console.error("Error creating output:", error);
    return NextResponse.json(
      { error: "Failed to create output" },
      { status: 500 }
    );
  }
}
