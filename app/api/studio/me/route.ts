import { NextResponse } from "next/server";
import { requireStudioAccess } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const host = await requireStudioAccess();
  if (!host) {
    return NextResponse.json({ allowed: false }, { status: 403 });
  }
  return NextResponse.json({ allowed: true, role: host.role, user: host });
}
