import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const output = await prisma.studioOutput.findUnique({
      where: { id },
    });

    if (!output) {
      return NextResponse.json({ error: "Output not found" }, { status: 404 });
    }

    return NextResponse.json(output);
  } catch (error) {
    console.error("Error fetching output:", error);
    return NextResponse.json({ error: "Failed to fetch output" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { enabled, config, streamKey, streamUrl, status } = await req.json();

    const output = await prisma.studioOutput.update({
      where: { id },
      data: {
        ...(enabled !== undefined && { enabled }),
        ...(config !== undefined && { config }),
        ...(streamKey !== undefined && { streamKey }),
        ...(streamUrl !== undefined && { streamUrl }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("Error updating output:", error);
    return NextResponse.json({ error: "Failed to update output" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.studioOutput.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting output:", error);
    return NextResponse.json({ error: "Failed to delete output" }, { status: 500 });
  }
}
