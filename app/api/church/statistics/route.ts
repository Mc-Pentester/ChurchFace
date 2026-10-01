import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { authorize } from "@/lib/authorization/policy";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const churchId = searchParams.get("churchId");

    if (!churchId) {
      return NextResponse.json({ error: "churchId is required" }, { status: 400 });
    }

    const authorization = await authorize({ actorId: session.user.id, action: "PRAYER_VIEW", churchId });
    if (!authorization.allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [members, followers, posts, events, sermons, prayers] = await Promise.all([
      prisma.churchMember.count({ where: { churchId, isActive: true } }),
      prisma.churchFollow.count({ where: { churchId } }),
      prisma.churchPost.count({ where: { churchId } }),
      prisma.churchEvent.count({ where: { churchId } }),
      prisma.preaching.count({ where: { isPublished: true, churchId } }),
      prisma.prayerRequest.count({ where: { churchId } }),
    ]);

    return NextResponse.json({
      members,
      followers,
      posts,
      events,
      sermons,
      prayers,
      eventParticipationRate: 75, // Placeholder - would need actual calculation
      postEngagementRate: 60, // Placeholder - would need actual calculation
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
