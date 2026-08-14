import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const { path } = await req.json();

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    // Revalider le chemin spécifié
    revalidatePath(path);

    return NextResponse.json({ success: true, path });
  } catch (error) {
    console.error("Erreur revalidation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
