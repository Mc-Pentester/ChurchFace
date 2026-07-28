import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sceneId = searchParams.get("sceneId");

  try {
    const where: any = {};
    if (sceneId) where.sceneId = sceneId;

    const sources = await prisma.studioSource.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json(sources);
  } catch (error) {
    console.error("Error fetching sources:", error);
    return NextResponse.json({ error: "Failed to fetch sources" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, name, url, settings, order, sceneId } = await req.json();

    if (!type || !name || !sceneId) {
      return NextResponse.json(
        { error: "Type, name, and sceneId are required" },
        { status: 400 }
      );
    }

    const source = await prisma.studioSource.create({
      data: {
        type,
        name,
        url,
        settings,
        order: order || 0,
        sceneId,
      },
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    console.error("Error creating source:", error);
    return NextResponse.json({ error: "Failed to create source" }, { status: 500 });
  }
}
