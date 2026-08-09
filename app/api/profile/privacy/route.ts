
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/profile/privacy
 *
 * Récupère les paramètres de confidentialité de l'utilisateur connecté.
 *
 * Si aucun paramètre n'existe encore, les paramètres par défaut sont créés.
 *
 * IMPORTANT :
 * ProfilePrivacy.userId possède une FK vers User.id.
 * On vérifie donc toujours que l'utilisateur existe avant de créer
 * ProfilePrivacy afin d'éviter une erreur Prisma P2003.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------------------
    // Vérifier que l'utilisateur existe réellement
    // ---------------------------------------------------------------------

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      console.error(
        `[PROFILE_PRIVACY] Utilisateur introuvable : ${userId}`
      );

      return NextResponse.json(
        {
          error: "Utilisateur introuvable",
          code: "USER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // ---------------------------------------------------------------------
    // Récupérer les paramètres existants
    // ---------------------------------------------------------------------

    let privacy = await prisma.profilePrivacy.findUnique({
      where: { userId },
    });

    // ---------------------------------------------------------------------
    // Créer les paramètres par défaut si nécessaire
    // ---------------------------------------------------------------------

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
 *
 * Met à jour les paramètres de confidentialité de l'utilisateur connecté.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------------------
    // Vérifier que l'utilisateur existe réellement
    // ---------------------------------------------------------------------

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      console.error(
        `[PROFILE_PRIVACY] Utilisateur introuvable : ${userId}`
      );

      return NextResponse.json(
        {
          error: "Utilisateur introuvable",
          code: "USER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // ---------------------------------------------------------------------
    // Lire le body
    // ---------------------------------------------------------------------

    const body = await req.json();

    const {
      profileLocked,
      postVisibility,
      friendVisibility,
      followPermission,
    } = body;

    // ---------------------------------------------------------------------
    // Validation
    // ---------------------------------------------------------------------

    const validVisibilities = [
      "PUBLIC",
      "FRIENDS",
      "PRIVATE",
    ] as const;

    const validFollowPermissions = [
      "EVERYONE",
      "FRIENDS",
    ] as const;

    if (
      postVisibility !== undefined &&
      !validVisibilities.includes(postVisibility)
    ) {
      return NextResponse.json(
        { error: "Valeur postVisibility invalide" },
        { status: 400 }
      );
    }

    if (
      friendVisibility !== undefined &&
      !validVisibilities.includes(friendVisibility)
    ) {
      return NextResponse.json(
        { error: "Valeur friendVisibility invalide" },
        { status: 400 }
      );
    }

    if (
      followPermission !== undefined &&
      !validFollowPermissions.includes(followPermission)
    ) {
      return NextResponse.json(
        { error: "Valeur followPermission invalide" },
        { status: 400 }
      );
    }

    if (
      profileLocked !== undefined &&
      typeof profileLocked !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Valeur profileLocked invalide" },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------------------
    // Construire uniquement les champs réellement fournis
    // ---------------------------------------------------------------------

    const data: {
      profileLocked?: boolean;
      postVisibility?: string;
      friendVisibility?: string;
      followPermission?: string;
    } = {};

    if (typeof profileLocked === "boolean") {
      data.profileLocked = profileLocked;
    }

    if (postVisibility !== undefined) {
      data.postVisibility = postVisibility;
    }

    if (friendVisibility !== undefined) {
      data.friendVisibility = friendVisibility;
    }

    if (followPermission !== undefined) {
      data.followPermission = followPermission;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée à mettre à jour" },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------------------
    // Mise à jour ou création
    //
    // L'utilisateur existe déjà, donc la FK ProfilePrivacy.userId
    // ne peut pas provoquer P2003 pour un userId inexistant.
    // ---------------------------------------------------------------------

    const privacy = await prisma.profilePrivacy.upsert({
      where: { userId },
      create: {
        userId,
        profileLocked: false,
        postVisibility: "PUBLIC",
        friendVisibility: "PUBLIC",
        followPermission: "EVERYONE",
        ...data,
      },
      update: data,
    });

    return NextResponse.json({ privacy });
  } catch (error: unknown) {
    console.error("PRIVACY UPDATE ERROR:", error);

    return NextResponse.json(
      { error: "Erreur mise à jour confidentialité" },
      { status: 500 }
    );
  }
}
