/**
 * API Route for optimized media upload using MediaService
 * POST /api/media/upload
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

    const body = await req.json();
    const { file } = body;

    if (!file) {
      return NextResponse.json(
        { error: "Fichier requis" },
        { status: 400 }
      );
    }

    // Convert base64 to File if needed
    let fileObj: File;
    if (file.base64) {
      const response = await fetch(file.base64);
      const blob = await response.blob();
      fileObj = new File([blob], file.name || "upload", { type: file.type });
    } else {
      return NextResponse.json(
        { error: "Format de fichier non supporté" },
        { status: 400 }
      );
    }

    // Upload and optimize using MediaService
    let result;
    if (fileObj.type.startsWith("video/")) {
      result = await MediaService.uploadVideo(fileObj);
    } else if (fileObj.type.startsWith("image/")) {
      result = await MediaService.uploadImage(fileObj);
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
    console.error("Media upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
