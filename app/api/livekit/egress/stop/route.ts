import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EgressService } from "@/lib/livekit/EgressService";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { egressId } = body;

    if (!egressId) {
      return NextResponse.json(
        { error: "egressId is required" },
        { status: 400 }
      );
    }

    const egressService = EgressService.getInstance();

    const recording = await egressService.stopRecording(egressId);

    return NextResponse.json({
      egressId: recording.id,
      status: recording.status,
      endedAt: recording.endedAt,
      duration: recording.duration,
    });
  } catch (error) {
    console.error("Error stopping egress recording:", error);
    return NextResponse.json(
      { error: "Failed to stop egress recording" },
      { status: 500 }
    );
  }
}
