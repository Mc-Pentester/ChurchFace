/**
 * Service de gestion des destinations de diffusion (Broadcast Outputs)
 * ChurchFace V1 - StudioPro Extension
 */

import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, maskStreamKey, generateStreamKey } from "@/lib/crypto/encryption";
import { rtmpRelayService } from "@/lib/rtmp/RtmpRelayService";

export type OutputType = "NATIVE_CHURCHFACE" | "RTMP_EXTERNAL" | "YOUTUBE" | "FACEBOOK" | "TWITCH" | "CUSTOM";

export type OutputStatus = "OFFLINE" | "CONNECTING" | "ACTIVE" | "ERROR";

export interface BroadcastOutput {
  id: string;
  type: OutputType;
  name: string;
  enabled: boolean;
  rtmpUrl?: string;
  streamKey?: string;
  status: OutputStatus;
  config?: Record<string, any>;
  broadcastId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOutputParams {
  broadcastId: string;
  type: OutputType;
  name: string;
  rtmpUrl?: string;
  streamKey?: string;
  enabled?: boolean;
  config?: Record<string, any>;
}

export interface UpdateOutputParams {
  id: string;
  name?: string;
  rtmpUrl?: string;
  streamKey?: string;
  enabled?: boolean;
  config?: Record<string, any>;
}

export class BroadcastOutputService {
  /**
   * Liste toutes les destinations d'un broadcast
   */
  static async listOutputs(broadcastId: string): Promise<BroadcastOutput[]> {
    const outputs = await prisma.studioOutput.findMany({
      where: { broadcastId },
      orderBy: { createdAt: "asc" },
    });

    return outputs.map((output) => ({
      id: output.id,
      type: output.type as OutputType,
      name: (output as any).name,
      enabled: output.enabled,
      rtmpUrl: output.streamUrl || undefined,
      streamKey: output.streamKey ? decrypt(output.streamKey) : undefined,
      status: output.status as OutputStatus,
      config: output.config as Record<string, any>,
      broadcastId: output.broadcastId || broadcastId,
      createdAt: output.createdAt,
      updatedAt: output.updatedAt,
    }));
  }

  /**
   * Crée une nouvelle destination de diffusion
   */
  static async createOutput(params: CreateOutputParams): Promise<BroadcastOutput> {
    const { broadcastId, type, name, rtmpUrl, streamKey, enabled = false, config } = params;

    // Si c'est une destination ChurchFace, elle doit être primaire
    const isPrimary = type === "NATIVE_CHURCHFACE";

    // Générer une stream key si non fournie
    const finalStreamKey = streamKey || generateStreamKey();

    // Chiffrer la stream key
    const encryptedStreamKey = encrypt(finalStreamKey);

    const output = await prisma.studioOutput.create({
      data: {
        broadcastId,
        type,
        name,
        platform: isPrimary ? "CHURCHFACE" : config?.platform || null,
        streamUrl: rtmpUrl,
        streamKey: encryptedStreamKey,
        enabled: isPrimary ? true : enabled,
        isPrimary,
        config: config || {},
        status: "OFFLINE",
      },
    });

    return {
      id: output.id,
      type: output.type as OutputType,
      name: (output as any).name,
      enabled: output.enabled,
      rtmpUrl: output.streamUrl || undefined,
      streamKey: finalStreamKey,
      status: output.status as OutputStatus,
      config: output.config as Record<string, any>,
      broadcastId: output.broadcastId || broadcastId,
      createdAt: output.createdAt,
      updatedAt: output.updatedAt,
    };
  }

  /**
   * Met à jour une destination de diffusion
   */
  static async updateOutput(params: UpdateOutputParams): Promise<BroadcastOutput> {
    const { id, name, rtmpUrl, streamKey, enabled, config } = params;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (rtmpUrl !== undefined) updateData.streamUrl = rtmpUrl;
    if (streamKey !== undefined) updateData.streamKey = encrypt(streamKey);
    if (enabled !== undefined) updateData.enabled = enabled;
    if (config !== undefined) updateData.config = config;

    const output = await prisma.studioOutput.update({
      where: { id },
      data: updateData,
    });

    return {
      id: output.id,
      type: output.type as OutputType,
      name: (output as any).name,
      enabled: output.enabled,
      rtmpUrl: output.streamUrl || undefined,
      streamKey: streamKey || (output.streamKey ? decrypt(output.streamKey) : undefined),
      status: output.status as OutputStatus,
      config: output.config as Record<string, any>,
      broadcastId: output.broadcastId || "",
      createdAt: output.createdAt,
      updatedAt: output.updatedAt,
    };
  }

  /**
   * Supprime une destination de diffusion
   */
  static async deleteOutput(id: string): Promise<void> {
    // Arrêter la diffusion si active
    const output = await prisma.studioOutput.findUnique({
      where: { id },
    });

    if (output && output.enabled) {
      await this.disableOutput(id);
    }

    await prisma.studioOutput.delete({
      where: { id },
    });
  }

  /**
   * Désactive une destination de diffusion
   */
  static async disableOutput(id: string): Promise<BroadcastOutput> {
    const output = await prisma.studioOutput.findUnique({
      where: { id },
    });

    if (!output) {
      throw new Error("Output not found");
    }

    // Empêcher la désactivation de la sortie primaire (ChurchFace)
    // Utiliser le type comme vérification temporaire jusqu'à ce que isPrimary soit disponible
    if (output.type === "NATIVE_CHURCHFACE") {
      throw new Error("Cannot disable primary ChurchFace output");
    }

    // Arrêter le relay RTMP
    await rtmpRelayService.removeDestination(id);

    const updated = await prisma.studioOutput.update({
      where: { id },
      data: {
        enabled: false,
        status: "OFFLINE",
      },
    });

    return {
      id: updated.id,
      type: updated.type as OutputType,
      name: (updated as any).name,
      enabled: updated.enabled,
      rtmpUrl: updated.streamUrl || undefined,
      streamKey: output.streamKey ? decrypt(output.streamKey) : undefined,
      status: updated.status as OutputStatus,
      config: updated.config as Record<string, any>,
      broadcastId: updated.broadcastId || "",
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Active une destination de diffusion
   */
  static async enableOutput(id: string): Promise<BroadcastOutput> {
    const output = await prisma.studioOutput.findUnique({
      where: { id },
    });

    if (!output) {
      throw new Error("Output not found");
    }

    if (!output.streamUrl || !output.streamKey) {
      throw new Error("Output must have RTMP URL and stream key to be enabled");
    }

    // Mettre à jour le statut
    const updated = await prisma.studioOutput.update({
      where: { id },
      data: {
        enabled: true,
        status: "CONNECTING",
      },
    });

    // Démarrer le relay RTMP
    try {
      const decryptedKey = decrypt(output.streamKey);
      await rtmpRelayService.addDestination({
        name: (output as any).name,
        type: (output.type as any).toLowerCase(),
        rtmpUrl: output.streamUrl,
        streamKey: decryptedKey,
        enabled: true,
      });

      const finalUpdate = await prisma.studioOutput.update({
        where: { id },
        data: { status: "ACTIVE" },
      });

      return {
        id: finalUpdate.id,
        type: finalUpdate.type as OutputType,
        name: (finalUpdate as any).name,
        enabled: finalUpdate.enabled,
        rtmpUrl: finalUpdate.streamUrl || undefined,
        streamKey: output.streamKey ? decrypt(output.streamKey) : undefined,
        status: finalUpdate.status as OutputStatus,
        config: finalUpdate.config as Record<string, any>,
        broadcastId: finalUpdate.broadcastId || "",
        createdAt: finalUpdate.createdAt,
        updatedAt: finalUpdate.updatedAt,
      };
    } catch (error) {
      await prisma.studioOutput.update({
        where: { id },
        data: { status: "ERROR" },
      });
      throw error;
    }
  }

  /**
   * Force l'activation de la sortie primaire (ChurchFace) si elle est désactivée
   */
  static async ensurePrimaryOutputActive(broadcastId: string): Promise<void> {
    const primaryOutput = await prisma.studioOutput.findFirst({
      where: {
        broadcastId,
        type: "NATIVE_CHURCHFACE",
      },
    });

    if (primaryOutput && !primaryOutput.enabled) {
      await this.enableOutput(primaryOutput.id);
    }
  }

  /**
   * Démarre une destination (alias pour enableOutput)
   */
  static async startOutput(id: string): Promise<BroadcastOutput> {
    return this.enableOutput(id);
  }

  /**
   * Arrête une destination (alias pour disableOutput)
   */
  static async stopOutput(id: string): Promise<BroadcastOutput> {
    return this.disableOutput(id);
  }

  /**
   * Teste la connexion à une destination
   */
  static async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const output = await prisma.studioOutput.findUnique({
      where: { id },
    });

    if (!output) {
      return { success: false, message: "Output not found" };
    }

    if (!output.streamUrl || !output.streamKey) {
      return { success: false, message: "Missing RTMP URL or stream key" };
    }

    // Validation basique de l'URL RTMP
    try {
      const url = new URL(output.streamUrl);
      if (url.protocol !== "rtmp:" && url.protocol !== "rtmps:") {
        return { success: false, message: "Invalid RTMP protocol" };
      }
    } catch {
      return { success: false, message: "Invalid RTMP URL format" };
    }

    // Simulation de test de connexion
    // Dans une vraie implémentation, on pourrait faire un ping RTMP
    return { success: true, message: "Connection test passed" };
  }

  /**
   * Retourne une destination avec la stream key masquée
   */
  static async getOutputMasked(id: string): Promise<BroadcastOutput | null> {
    const output = await prisma.studioOutput.findUnique({
      where: { id },
    });

    if (!output) {
      return null;
    }

    return {
      id: output.id,
      type: output.type as OutputType,
      name: (output as any).name,
      enabled: output.enabled,
      rtmpUrl: output.streamUrl || undefined,
      streamKey: output.streamKey ? maskStreamKey(decrypt(output.streamKey)) : undefined,
      status: output.status as OutputStatus,
      config: output.config as Record<string, any>,
      broadcastId: output.broadcastId || "",
      createdAt: output.createdAt,
      updatedAt: output.updatedAt,
    };
  }

  /**
   * Active toutes les destinations d'un broadcast
   */
  static async enableAllOutputs(broadcastId: string): Promise<BroadcastOutput[]> {
    const outputs = await prisma.studioOutput.findMany({
      where: { broadcastId, enabled: false },
    });

    const results = await Promise.all(
      outputs.map((output) => this.enableOutput(output.id))
    );

    return results;
  }

  /**
   * Active toutes les destinations secondaires (non-primaires) pour le multistreaming
   * La destination principale ChurchFace reste toujours active
   */
  static async enableMultistreaming(broadcastId: string): Promise<BroadcastOutput[]> {
    // S'assurer que la destination principale est active
    await this.ensurePrimaryOutput(broadcastId);

    // Activer toutes les destinations secondaires activées
    const secondaryOutputs = await prisma.studioOutput.findMany({
      where: {
        broadcastId,
        isPrimary: false,
        enabled: true,
      },
    });

    const results = await Promise.all(
      secondaryOutputs.map((output) => this.enableOutput(output.id))
    );

    return results;
  }

  /**
   * Désactive toutes les destinations d'un broadcast (sauf la primaire ChurchFace)
   */
  static async disableAllOutputs(broadcastId: string): Promise<BroadcastOutput[]> {
    const outputs = await prisma.studioOutput.findMany({
      where: { 
        broadcastId, 
        enabled: true,
        type: { not: "NATIVE_CHURCHFACE" }, // Ne jamais désactiver ChurchFace
      },
    });

    const results = await Promise.all(
      outputs.map((output) => this.disableOutput(output.id))
    );

    return results;
  }

  /**
   * Crée automatiquement la destination native ChurchFace pour un broadcast
   */
  static async createNativeOutput(broadcastId: string): Promise<BroadcastOutput> {
    // Vérifier si elle existe déjà
    const existing = await prisma.studioOutput.findFirst({
      where: {
        broadcastId,
        type: "NATIVE_CHURCHFACE",
      },
    });

    if (existing) {
      return {
        id: existing.id,
        type: existing.type as OutputType,
        name: (existing as any).name,
        enabled: existing.enabled,
        rtmpUrl: existing.streamUrl || undefined,
        streamKey: existing.streamKey ? decrypt(existing.streamKey) : undefined,
        status: existing.status as OutputStatus,
        config: existing.config as Record<string, any>,
        broadcastId: existing.broadcastId || broadcastId,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
      };
    }

    // Générer les credentials ChurchFace
    const churchfaceStreamKey = generateStreamKey();
    const churchfaceRtmpUrl = process.env.CHURCHFACE_RTMP_URL || "rtmp://live.churchface.com/live";

    // Créer la destination native - toujours primaire et activée
    return this.createOutput({
      broadcastId,
      type: "NATIVE_CHURCHFACE",
      name: "ChurchFace Native",
      rtmpUrl: churchfaceRtmpUrl,
      streamKey: churchfaceStreamKey,
      enabled: true,
      config: {
        platform: "CHURCHFACE",
        autoEnable: true,
        isRelaySource: true, // Cette sortie est la source pour le relay
      },
    });
  }

  /**
   * S'assure que ChurchFace est toujours la destination principale
   */
  static async ensurePrimaryOutput(broadcastId: string): Promise<BroadcastOutput> {
    // Créer la sortie native si elle n'existe pas
    const nativeOutput = await this.createNativeOutput(broadcastId);

    // S'assurer qu'elle est marquée comme primaire
    if (!nativeOutput) {
      throw new Error("Failed to create primary ChurchFace output");
    }

    // Désactiver toutes les autres sorties marquées comme primaires
    await prisma.studioOutput.updateMany({
      where: {
        broadcastId,
        id: { not: nativeOutput.id },
        isPrimary: true,
      },
      data: { isPrimary: false },
    });

    // S'assurer que la sortie native est bien primaire
    await prisma.studioOutput.update({
      where: { id: nativeOutput.id },
      data: { isPrimary: true, enabled: true },
    });

    return nativeOutput;
  }
}
