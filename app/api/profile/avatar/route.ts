import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { uploadFiles } from "@/lib/uploadthing";

export const runtime = "nodejs";

/**
 * POST /api/profile/avatar
 * Upload and update profile avatar
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

    // Create or get "Profile Photos" album
    let profileAlbum = await prisma.album.findFirst({
      where: {
        userId,
        type: "PROFILE",
      },
    });

    if (!profileAlbum) {
      profileAlbum = await prisma.album.create({
        data: {
          userId,
          name: "Photos de profil",
          type: "PROFILE",
          visibility: "PRIVATE",
        },
      });
    }

    // Add avatar to album as media
    await prisma.media.create({
      data: {
        userId,
        albumId: profileAlbum.id,
        type: "PHOTO",
        url: imageUrl,
        thumbnail: file.thumbnail || null,
        caption: `Avatar - ${new Date().toLocaleDateString("fr-FR")}`,
        visibility: "PRIVATE",
      },
    });

    // Update user avatar
    const user = await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("AVATAR UPLOAD ERROR:", error);
    return NextResponse.json(
      { error: "Erreur upload avatar" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/avatar
 * Remove profile avatar (revert to default)
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
      data: { image: null },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("AVATAR DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Erreur suppression avatar" },
      { status: 500 }
    );
  }
}
