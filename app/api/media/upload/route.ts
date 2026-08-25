/**
 * API Route for optimized media upload using MediaService
 * POST /api/media/upload
 * Content-Type: multipart/form-data
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MediaService } from "@/lib/media";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Fichier requis" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Type de fichier non supporté. Seuls les images et vidéos sont autorisées." },
        { status: 400 }
      );
    }

    // Upload and optimize using MediaService
    let result;
    if (file.type.startsWith("video/")) {
      result = await MediaService.uploadVideo(file);
    } else if (file.type.startsWith("image/")) {
      result = await MediaService.uploadImage(file);
    } else {
      return NextResponse.json(
        { error: "Type de fichier non supporté. Seuls les images et vidéos sont autorisées." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      url: result.originalUrl,
      variants: result.variants,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error("[MediaUpload] Error:", error instanceof Error ? error.message : "Upload failed");
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
