import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/authorization/policy";

// GET - Récupérer les horaires d'intercession d'une chaîne
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const prayerChainId = searchParams.get("prayerChainId");

    if (!prayerChainId) {
      return NextResponse.json(
        { error: "prayerChainId requis" },
        { status: 400 }
      );
    }

    const authorization = await authorize({ actorId: userId, action: "PRAYER_SCHEDULE_VIEW", resourceId: prayerChainId });
    if (authorization.status !== 200) return NextResponse.json({ error: "Accès non autorisé" }, { status: authorization.status });

    // Vérifier que l'utilisateur a accès à cette chaîne
    const chain = await prisma.prayerChain.findUnique({
      where: { id: prayerChainId },
    });

    if (!chain) {
      return NextResponse.json(
        { error: "Chaîne de prière introuvable" },
        { status: 404 }
      );
    }

    const schedules = await prisma.prayerSchedule.findMany({
      where: { 
        prayerChainId,
        isActive: true,
      },
      include: {
        prayerChain: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: [{ hour: "asc" }, { dayOfWeek: "asc" }],
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Erreur récupération horaires:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Créer un horaire d'intercession
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { prayerChainId, hour, dayOfWeek, isActive = true } = body;

    if (!prayerChainId || hour === undefined) {
      return NextResponse.json(
        { error: "prayerChainId et hour requis" },
        { status: 400 }
      );
    }

    // Valider l'heure (0-23)
    if (hour < 0 || hour > 23) {
      return NextResponse.json(
        { error: "L'heure doit être entre 0 et 23" },
        { status: 400 }
      );
    }

    // Valider le jour de la semaine (0-6 ou null)
    if (dayOfWeek !== undefined && (dayOfWeek < 0 || dayOfWeek > 6)) {
      return NextResponse.json(
        { error: "Le jour doit être entre 0 et 6" },
        { status: 400 }
      );
    }

    const authorization = await authorize({ actorId: userId, action: "PRAYER_SCHEDULE_CREATE", resourceId: prayerChainId });
    if (authorization.status !== 200) return NextResponse.json({ error: "Accès non autorisé" }, { status: authorization.status });

    // Vérifier que la chaîne existe
    const chain = await prisma.prayerChain.findUnique({
      where: { id: prayerChainId },
    });

    if (!chain) {
      return NextResponse.json(
        { error: "Chaîne de prière introuvable" },
        { status: 404 }
      );
    }

    // Créer l'horaire
    const schedule = await prisma.prayerSchedule.create({
      data: {
        prayerChainId,
        userId,
        hour,
        dayOfWeek,
        isActive,
      },
      include: {
        prayerChain: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Erreur création horaire:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id requis" },
        { status: 400 }
      );
    }

    // Verify ownership through the central authorization policy
    const schedule = await prisma.prayerSchedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Horaire introuvable" },
        { status: 404 }
      );
    }

    const authorization = await authorize({ actorId: userId, action: "PRAYER_SCHEDULE_DELETE", resourceId: id });
    if (authorization.status !== 200) return NextResponse.json({ error: "Accès non autorisé" }, { status: authorization.status });

    if (schedule.userId !== userId) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    await prisma.prayerSchedule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression horaire:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
