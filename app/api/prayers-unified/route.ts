import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "INDIVIDUAL" | "COLLABORATIVE_CHAIN" | "COLLABORATIVE_CAMPAIGN" | "LIVE_ROOM"
    const category = searchParams.get("category");
    const filter = searchParams.get("filter") || "recent"; // recent, popular, urgent, answered
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const churchId = searchParams.get("churchId");
    const isActive = searchParams.get("isActive");
    const skip = (page - 1) * limit;

    let orderBy: any = { createdAt: "desc" };
    const where: any = {};

    // Filtrer par type
    if (type && type !== "ALL") {
      where.type = type;
    }

    // Filtres individuels (type = "INDIVIDUAL")
    if (category && category !== "ALL") {
      where.category = category;
    }

    if (churchId) {
      where.churchId = churchId;
    }

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    switch (filter) {
      case "urgent":
        where.isUrgent = true;
        where.isAnswered = false;
        break;
      case "answered":
        where.isAnswered = true;
        break;
      case "popular":
        orderBy = { createdAt: "desc" }; // À adapter avec compteur de réactions
        break;
    }

    const [prayers, total] = await Promise.all([
      prisma.prayer.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          prayerCreator: { select: { id: true, name: true, image: true } },
          prayerChurch: { select: { id: true, name: true, slug: true } },
          childPrayers: {
            where: { type: "COLLABORATIVE_CHAIN" },
            select: { id: true, title: true }
          }
        },
      }),
      prisma.prayer.count({ where }),
    ]);

    return NextResponse.json({ prayers, total, page, limit });
  } catch (error) {
    console.error("Erreur récupération prières unifiées:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      type, // "INDIVIDUAL" | "COLLABORATIVE_CHAIN" | "COLLABORATIVE_CAMPAIGN" | "LIVE_ROOM"
      title, 
      description, 
      content, 
      category, 
      isUrgent, 
      churchId,
      imageUrl,
      visibility,
      roomType,
      isPublic,
      maxParticipants,
      scheduledStart,
      scheduledEnd,
      campaignType,
      startDate,
      endDate,
      parentPrayerId
    } = body;

    if (!title?.trim() || !type) {
      return NextResponse.json({ error: "Missing required fields: title, type" }, { status: 400 });
    }

    // Validation selon le type
    if (type === "INDIVIDUAL" && !content?.trim()) {
      return NextResponse.json({ error: "Content required for individual prayers" }, { status: 400 });
    }

    if (type === "COLLABORATIVE_CAMPAIGN" && (!campaignType || !startDate || !endDate)) {
      return NextResponse.json({ error: "Missing required fields for campaign: campaignType, startDate, endDate" }, { status: 400 });
    }

    if (type === "LIVE_ROOM" && !roomType) {
      return NextResponse.json({ error: "Missing required field for live room: roomType" }, { status: 400 });
    }

    const prayer = await prisma.prayer.create({
      data: {
        type,
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl || null,
        visibility: visibility || "PUBLIC",
        churchId: churchId || null,
        groupId: null,
        ministryId: null,
        eventId: null,
        createdBy: session.user.id,
        
        // Champs individuels
        content: type === "INDIVIDUAL" ? content?.trim() : null,
        category: type === "INDIVIDUAL" ? category : null,
        isUrgent: type === "INDIVIDUAL" ? !!isUrgent : false,
        isAnswered: false,
        
        // Champs collaboratifs
        isActive: true,
        roomType: type === "LIVE_ROOM" ? roomType : null,
        isPublic: isPublic ?? true,
        maxParticipants: maxParticipants || null,
        scheduledStart: scheduledStart ? new Date(scheduledStart) : null,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : null,
        endedAt: null,
        
        // Champs campagne
        campaignType: type === "COLLABORATIVE_CAMPAIGN" ? campaignType : null,
        startDate: type === "COLLABORATIVE_CAMPAIGN" ? new Date(startDate) : null,
        endDate: type === "COLLABORATIVE_CAMPAIGN" ? new Date(endDate) : null,
        
        // Relations hiérarchiques
        parentPrayerId: parentPrayerId || null,
      },
      include: {
        prayerCreator: { select: { id: true, name: true, image: true } },
        prayerChurch: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ prayer }, { status: 201 });
  } catch (error) {
    console.error("Erreur création prière unifiée:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
