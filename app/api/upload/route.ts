import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Legacy local upload disabled — use UploadThing instead.
 */
export async function POST() {
  return NextResponse.json(
    { error: "Endpoint désactivé. Utilisez UploadThing." },
    { status: 410 }
  );
}
