import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const scene = await prisma.studioScene.findUnique({
      where: { id },
      include: {
        sources: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!scene) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    return NextResponse.json(scene);
  } catch (error) {
    console.error("Error fetching scene:", error);
    return NextResponse.json({ error: "Failed to fetch scene" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { name, description, order, isActive } = await req.json();

    const scene = await prisma.studioScene.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        sources: true,
      },
    });

    return NextResponse.json(scene);
  } catch (error) {
    console.error("Error updating scene:", error);
    return NextResponse.json({ error: "Failed to update scene" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.studioScene.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting scene:", error);
    return NextResponse.json({ error: "Failed to delete scene" }, { status: 500 });
  }
}
