import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/profile/privacy
 * Get current user privacy settings
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    let privacy = await prisma.profilePrivacy.findUnique({
      where: { userId },
    });

    // Create default privacy settings if not exists
    if (!privacy) {
      privacy = await prisma.profilePrivacy.create({
        data: {
          userId,
          profileLocked: false,
          postVisibility: "PUBLIC",
          friendVisibility: "PUBLIC",
          followPermission: "EVERYONE",
        },
      });
    }

    return NextResponse.json({ privacy });
  } catch (error) {
    console.error("PRIVACY GET ERROR:", error);
    return NextResponse.json(
      { error: "Erreur chargement paramètres confidentialité" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile/privacy
 * Update privacy settings
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      profileLocked,
      postVisibility,
      friendVisibility,
      followPermission,
    } = body;

    // Validate values
    const validVisibilities = ["PUBLIC", "FRIENDS", "PRIVATE"];
    const validFollowPermissions = ["EVERYONE", "FRIENDS"];

    if (postVisibility && !validVisibilities.includes(postVisibility)) {
      return NextResponse.json(
        { error: "Valeur postVisibility invalide" },
        { status: 400 }
      );
    }

    if (friendVisibility && !validVisibilities.includes(friendVisibility)) {
      return NextResponse.json(
        { error: "Valeur friendVisibility invalide" },
        { status: 400 }
      );
    }

    if (followPermission && !validFollowPermissions.includes(followPermission)) {
      return NextResponse.json(
        { error: "Valeur followPermission invalide" },
        { status: 400 }
      );
    }

    const data: any = {};
    if (typeof profileLocked === "boolean") data.profileLocked = profileLocked;
    if (postVisibility) data.postVisibility = postVisibility;
    if (friendVisibility) data.friendVisibility = friendVisibility;
    if (followPermission) data.followPermission = followPermission;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée à mettre à jour" },
        { status: 400 }
      );
    }

    const privacy = await prisma.profilePrivacy.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    return NextResponse.json({ privacy });
  } catch (error) {
    console.error("PRIVACY UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Erreur mise à jour confidentialité" },
      { status: 500 }
    );
  }
}
