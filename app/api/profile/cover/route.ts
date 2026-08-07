import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { uploadFiles } from "@/lib/uploadthing";

export const runtime = "nodejs";

/**
 * POST /api/profile/cover
 * Upload and update profile cover photo
 */
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
    const file = body.file;

    if (!file || !file.url) {
      return NextResponse.json(
        { error: "Fichier requis" },
        { status: 400 }
      );
    }

    const imageUrl = file.url;

    // Create or get "Cover Photos" album
    let coverAlbum = await prisma.album.findFirst({
      where: {
        userId,
        type: "COVER",
      },
    });

    if (!coverAlbum) {
      coverAlbum = await prisma.album.create({
        data: {
          userId,
          name: "Photos de couverture",
          type: "COVER",
          visibility: "PRIVATE",
        },
      });
    }

    // Add cover to album as media
    await prisma.media.create({
      data: {
        userId,
        albumId: coverAlbum.id,
        type: "PHOTO",
        url: imageUrl,
        thumbnail: file.thumbnail || null,
        caption: `Cover - ${new Date().toLocaleDateString("fr-FR")}`,
        visibility: "PRIVATE",
      },
    });

    // Update user cover image
    const user = await prisma.user.update({
      where: { id: userId },
      data: { coverImage: imageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        coverImage: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("COVER UPLOAD ERROR:", error);
    return NextResponse.json(
      { error: "Erreur upload cover" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/cover
 * Remove profile cover photo
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { coverImage: null },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        coverImage: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("COVER DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Erreur suppression couverture" },
      { status: 500 }
    );
  }
}
