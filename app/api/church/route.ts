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

    // Verify user exists in database
    const userId = session.user.id;
    console.log("Creating church for user ID:", userId);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error("User not found in database:", userId);
      return NextResponse.json(
        { error: "User not found in database. Please re-login." },
        { status: 401 }
      );
    }

    console.log("User found in database:", user.id);

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

    // Create church, church member, and church admin in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create church
      const church = await tx.church.create({
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

      console.log("Church created:", church.id);

      // Create church member with OWNER role
      const churchMember = await tx.churchMember.create({
        data: {
          churchId: church.id,
          userId: userId,
          role: "OWNER",
          isActive: true,
        },
      });

      console.log("ChurchMember created:", churchMember.id);

      // Create church admin with OWNER role
      const churchAdmin = await tx.churchAdmin.create({
        data: {
          churchId: church.id,
          userId: userId,
          role: "OWNER",
          appointedAt: new Date(),
        },
      });

      console.log("ChurchAdmin created:", churchAdmin.id);

      return { church, churchMember, churchAdmin };
    });

    return NextResponse.json({ success: true, church: result.church });
  } catch (error) {
    console.error("Error creating church:", error);
    return NextResponse.json(
      { error: "Failed to create church" },
      { status: 500 }
    );
  }
}
