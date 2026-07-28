import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const source = await prisma.studioSource.findUnique({
      where: { id },
    });

    if (!source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    return NextResponse.json(source);
  } catch (error) {
    console.error("Error fetching source:", error);
    return NextResponse.json({ error: "Failed to fetch source" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { name, url, settings, order, isVisible, volume, muted } = await req.json();

    const source = await prisma.studioSource.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(url !== undefined && { url }),
        ...(settings !== undefined && { settings }),
        ...(order !== undefined && { order }),
        ...(isVisible !== undefined && { isVisible }),
        ...(volume !== undefined && { volume }),
        ...(muted !== undefined && { muted }),
      },
    });

    return NextResponse.json(source);
  } catch (error) {
    console.error("Error updating source:", error);
    return NextResponse.json({ error: "Failed to update source" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.studioSource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting source:", error);
    return NextResponse.json({ error: "Failed to delete source" }, { status: 500 });
  }
}
