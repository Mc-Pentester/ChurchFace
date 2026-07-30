import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const churchId = searchParams.get("churchId");

    if (!churchId) {
      return NextResponse.json({ error: "churchId is required" }, { status: 400 });
    }

    const [members, followers, posts, events, sermons, prayers] = await Promise.all([
      prisma.churchMember.count({ where: { churchId, isActive: true } }),
      prisma.churchFollow.count({ where: { churchId } }),
      prisma.churchPost.count({ where: { churchId } }),
      prisma.churchEvent.count({ where: { churchId } }),
      prisma.preaching.count({ where: { isPublished: true } }),
      prisma.prayerRequest.count({}),
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
