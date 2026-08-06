import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EgressService, EgressConfig } from "@/lib/livekit/EgressService";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { roomName, outputType, filename, s3 } = body;

    if (!roomName) {
      return NextResponse.json(
        { error: "roomName is required" },
        { status: 400 }
      );
    }

    const egressService = EgressService.getInstance();

    const config: EgressConfig = {
      roomId: roomName,
      outputType: outputType || "FILE",
      filename,
      s3,
    };

    const recording = await egressService.startRecording(config);

    return NextResponse.json({
      egressId: recording.id,
      status: recording.status,
      startedAt: recording.startedAt,
    });
  } catch (error) {
    console.error("Error starting egress recording:", error);
    return NextResponse.json(
      { error: "Failed to start egress recording" },
      { status: 500 }
    );
  }
}
