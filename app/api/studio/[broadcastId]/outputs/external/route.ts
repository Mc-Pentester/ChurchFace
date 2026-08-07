/**
 * API Route pour ajouter des destinations externes depuis les comptes utilisateurs
 * ChurchFace V1 - StudioPro Extension
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BroadcastOutputService } from "@/lib/broadcast/BroadcastOutputService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ broadcastId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { broadcastId } = await params;
    const body = await request.json();
    const { destinationId } = body;

    if (!destinationId) {
      return NextResponse.json(
        { error: "Destination ID is required" },
        { status: 400 }
      );
    }

    // Récupérer la destination depuis le compte utilisateur
    const destination = await prisma.broadcastDestination.findFirst({
      where: {
        id: destinationId,
        account: {
          ownerType: "USER",
          userId: session.user.id,
        },
      },
      include: {
        account: true,
      },
    });

    if (!destination) {
      return NextResponse.json(
        { error: "Destination not found or not owned by user" },
        { status: 404 }
      );
    }

    // Vérifier si une sortie existe déjà pour cette destination
    const existingOutput = await prisma.studioOutput.findFirst({
      where: {
        broadcastId,
        config: {
          path: ["destinationId"],
          equals: destinationId,
        },
      },
    });

    if (existingOutput) {
      return NextResponse.json(
        { error: "Output already exists for this destination" },
        { status: 409 }
      );
    }

    // Créer la sortie de diffusion
    const config = destination.configuration as Record<string, any>;
    const output = await BroadcastOutputService.createOutput({
      broadcastId,
      type: destination.platform as any,
      name: destination.name,
      rtmpUrl: config?.rtmpUrl,
      streamKey: config?.streamKey,
      enabled: destination.enabled,
      config: {
        ...config,
        destinationId,
        platform: destination.platform,
        accountId: destination.account.id,
      },
    });

    return NextResponse.json(output, { status: 201 });
  } catch (error) {
    console.error("Error adding external destination:", error);
    return NextResponse.json(
      { error: "Failed to add external destination" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ broadcastId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { broadcastId } = await params;

    // Récupérer les comptes de l'utilisateur
    const accounts = await prisma.broadcastAccount.findMany({
      where: {
        ownerType: "USER",
        userId: session.user.id,
        status: "ACTIVE",
      },
      include: {
        destinations: {
          where: {
            enabled: true,
          },
        },
      },
    });

    // Récupérer les sorties déjà ajoutées à ce broadcast
    const existingOutputs = await prisma.studioOutput.findMany({
      where: { broadcastId },
      select: {
        config: true,
      },
    });

    const existingDestinationIds = new Set(
      existingOutputs
        .map((o) => (o.config as Record<string, any>)?.destinationId)
        .filter(Boolean)
    );

    // Filtrer les destinations non utilisées
    const availableDestinations = accounts.flatMap((account) =>
      account.destinations
        .filter((dest) => !existingDestinationIds.has(dest.id))
        .map((dest) => ({
          id: dest.id,
          name: dest.name,
          platform: dest.platform,
          enabled: dest.enabled,
          isDefault: dest.isDefault,
          configuration: dest.configuration,
          accountId: account.id,
          accountName: account.accountName,
        }))
    );

    return NextResponse.json({ destinations: availableDestinations });
  } catch (error) {
    console.error("Error fetching available destinations:", error);
    return NextResponse.json(
      { error: "Failed to fetch available destinations" },
      { status: 500 }
    );
  }
}
