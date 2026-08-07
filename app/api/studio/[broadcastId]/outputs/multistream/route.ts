/**
 * API Route pour activer le multistreaming
 * Active toutes les destinations secondaires tout en gardant ChurchFace comme primaire
 */

import { NextRequest, NextResponse } from "next/server";
import { BroadcastOutputService } from "@/lib/broadcast/BroadcastOutputService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ broadcastId: string }> }
) {
  try {
    const { broadcastId } = await params;

    const outputs = await BroadcastOutputService.enableMultistreaming(broadcastId);

    return NextResponse.json({ outputs });
  } catch (error) {
    console.error("Error enabling multistreaming:", error);
    return NextResponse.json(
      { error: "Failed to enable multistreaming" },
      { status: 500 }
    );
  }
}
