import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const churchId = searchParams.get("churchId");

    if (!churchId) {
      return NextResponse.json({ error: "churchId is required" }, { status: 400 });
    }

    // Note: Ministries might need to be added to the schema or use existing models
    // For now, returning empty array as a placeholder
    const ministries = await prisma.$queryRaw`
      SELECT * FROM ministries 
      WHERE "churchId" = ${churchId}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({ ministries });
  } catch (error) {
    console.error("Error fetching ministries:", error);
    // Return empty array if table doesn't exist yet
    return NextResponse.json({ ministries: [] });
  }
}
