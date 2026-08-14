import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const getUserId = (session: any): string | null => {
  return session?.user?.id ?? null;
};

// GET - Récupérer les participants d'une chaîne de prière
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const prayerChainId = searchParams.get("prayerChainId");

    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || "1", 10)
    );

    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );

    const skip = (page - 1) * limit;

    if (!prayerChainId) {
      return NextResponse.json(
        { error: "prayerChainId requis" },
        { status: 400 }
      );
    }

    // Vérifier que la chaîne existe
    const chain = await prisma.prayerChain.findUnique({
      where: { id: prayerChainId },
      select: {
        id: true,
        visibility: true,
      },
    });

    if (!chain) {
      return NextResponse.json(
        { error: "Chaîne de prière introuvable" },
        { status: 404 }
      );
    }

    // Vérifier l'accès aux chaînes privées
    if (chain.visibility === "PRIVATE") {
      const isMember = await prisma.prayerParticipant.findFirst({
        where: {
          prayerChainId,
          userId,
        },
        select: {
          id: true,
        },
      });

      if (!isMember) {
        return NextResponse.json(
          { error: "Accès non autorisé" },
          { status: 403 }
        );
      }
    }

    const [participants, total] = await Promise.all([
      prisma.prayerParticipant.findMany({
        where: {
          prayerChainId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          joinedAt: "asc",
        },
        skip,
        take: limit,
      }),

      prisma.prayerParticipant.count({
        where: {
          prayerChainId,
        },
      }),
    ]);

    return NextResponse.json({
      participants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      "Erreur récupération participants:",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Rejoindre une chaîne de prière
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      prayerChainId,
      role = "PARTICIPANT",
    } = body;

    if (!prayerChainId) {
      return NextResponse.json(
        { error: "prayerChainId requis" },
        { status: 400 }
      );
    }

    const validRoles = [
      "PARTICIPANT",
      "INTERCESSOR",
      "MODERATOR",
      "ADMIN",
    ];

    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Rôle de participant invalide" },
        { status: 400 }
      );
    }

    // Vérifier que la chaîne existe
    const chain = await prisma.prayerChain.findUnique({
      where: {
        id: prayerChainId,
      },
      select: {
        id: true,
        visibility: true,
      },
    });

    if (!chain) {
      return NextResponse.json(
        { error: "Chaîne de prière introuvable" },
        { status: 404 }
      );
    }

    // Une chaîne privée nécessite une gestion d'accès
    // spécifique. Pour le moment, empêcher l'inscription
    // directe si l'utilisateur n'est pas déjà membre.
    if (chain.visibility === "PRIVATE") {
      const existingMember =
        await prisma.prayerParticipant.findFirst({
          where: {
            prayerChainId,
            userId,
          },
          select: {
            id: true,
          },
        });

      if (!existingMember) {
        return NextResponse.json(
          {
            error:
              "Cette chaîne de prière est privée.",
          },
          { status: 403 }
        );
      }
    }

    // Vérifier si l'utilisateur est déjà participant
    const existingParticipant =
      await prisma.prayerParticipant.findFirst({
        where: {
          prayerChainId,
          userId,
        },
      });

    if (existingParticipant) {
      return NextResponse.json(
        {
          error: "Vous êtes déjà participant",
          participant: existingParticipant,
        },
        { status: 409 }
      );
    }

    const participant =
      await prisma.prayerParticipant.create({
        data: {
          prayerChainId,
          userId,
          role,
          joinedAt: new Date(),
          notificationEnabled: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        participant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Erreur création participant:",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Quitter une chaîne / supprimer un participant
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getUserId(session);

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const participantId = searchParams.get("id");

    const prayerChainId =
      searchParams.get("prayerChainId");

    // Priorité à l'identifiant du participant.
    // Sinon permettre à l'utilisateur connecté
    // de quitter directement une chaîne.
    if (participantId) {
      const participant =
        await prisma.prayerParticipant.findUnique({
          where: {
            id: participantId,
          },
          select: {
            id: true,
            userId: true,
            prayerChainId: true,
          },
        });

      if (!participant) {
        return NextResponse.json(
          {
            error: "Participant introuvable",
          },
          { status: 404 }
        );
      }

      // Un utilisateur ne peut supprimer que
      // sa propre participation via cette route.
      if (participant.userId !== userId) {
        return NextResponse.json(
          {
            error: "Accès non autorisé",
          },
          { status: 403 }
        );
      }

      await prisma.prayerParticipant.delete({
        where: {
          id: participant.id,
        },
      });

      return NextResponse.json({
        success: true,
      });
    }

    if (!prayerChainId) {
      return NextResponse.json(
        {
          error:
            "id ou prayerChainId requis",
        },
        { status: 400 }
      );
    }

    const participant =
      await prisma.prayerParticipant.findFirst({
        where: {
          prayerChainId,
          userId,
        },
        select: {
          id: true,
        },
      });

    if (!participant) {
      return NextResponse.json(
        {
          error:
            "Vous ne participez pas à cette chaîne",
        },
        { status: 404 }
      );
    }

    await prisma.prayerParticipant.delete({
      where: {
        id: participant.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Erreur suppression participant:",
      error
    );

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}