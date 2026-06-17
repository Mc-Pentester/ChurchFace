import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const church = await prisma.church.findUnique({
      where: { slug },
      select: { id: true, radioEnabled: true },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    if (!church.radioEnabled) {
      return NextResponse.json(
        { error: "Radio is not enabled for this church" },
        { status: 403 }
      );
    }

    const radio = await prisma.churchRadio.findFirst({
      where: { 
        churchId: church.id,
        isActive: true,
      },
      include: {
        church: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!radio) {
      return NextResponse.json(
        { error: "No active radio found" },
        { status: 404 }
      );
    }

    return NextResponse.json(radio);
  } catch (error) {
    console.error("Error fetching church radio:", error);
    return NextResponse.json(
      { error: "Failed to fetch church radio" },
      { status: 500 }
    );
  }
}
