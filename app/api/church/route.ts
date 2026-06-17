import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, slug, description, slogan, logo, coverImage, website, email, phone, address, city, country } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: "name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const existingChurch = await prisma.church.findUnique({
      where: { slug },
    });

    if (existingChurch) {
      return NextResponse.json(
        { error: "This slug is already taken" },
        { status: 409 }
      );
    }

    // Create church
    const church = await prisma.church.create({
      data: {
        name,
        slug,
        description,
        slogan,
        logo,
        coverImage,
        website,
        email,
        phone,
        address,
        city,
        country,
      },
    });

    // Add user as admin
    await prisma.churchAdmin.create({
      data: {
        churchId: church.id,
        userId: session.user.id,
        role: "PASTOR",
      },
    });

    return NextResponse.json({ success: true, church });
  } catch (error) {
    console.error("Error creating church:", error);
    return NextResponse.json(
      { error: "Failed to create church" },
      { status: 500 }
    );
  }
}
