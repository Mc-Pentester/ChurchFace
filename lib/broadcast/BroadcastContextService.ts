/**
 * Service d'orchestration des contextes de diffusion
 * ChurchFace V1 Stabilization
 * 
 * Ce service résout le contexte de diffusion (USER, CHURCH, GLOBAL)
 * et fournit les permissions et configurations nécessaires au Studio.
 */

import { prisma } from "@/lib/prisma";
import { 
  BroadcastContext, 
  ResolveContextParams, 
  OwnerType, 
  BroadcastPermissions 
} from "@/types/broadcast";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Service de gestion des contextes de diffusion
 */
export class BroadcastContextService {
  
  /**
   * Résout le contexte de diffusion basé sur les paramètres
   */
  static async resolveContext(params: ResolveContextParams): Promise<BroadcastContext> {
    const { churchSlug, broadcastId, userId, userRole, userName } = params;
    
    // Déterminer le type de propriétaire
    let ownerType: OwnerType;
    let ownerId: string;
    let ownerName: string;
    
    if (churchSlug) {
      // Contexte église
      ownerType = "CHURCH";
      
      const church = await prisma.church.findUnique({
        where: { slug: churchSlug },
      });
      
      if (!church) {
        throw new Error("Church not found");
      }
      
      ownerId = church.id;
      ownerName = church.name;
      
      // Chercher ou créer un broadcast pour cette église
      let broadcast = await prisma.liveBroadcast.findFirst({
        where: {
          ownerType: "CHURCH",
          authorId: userId,
          status: { in: ["SCHEDULED", "PREPARING"] },
        },
        orderBy: { createdAt: "desc" },
      });
      
      if (!broadcast) {
        // Créer un nouveau broadcast pour l'église
        broadcast = await prisma.liveBroadcast.create({
          data: {
            title: `${church.name} - Live`,
            description: "Diffusion en direct",
            streamUrl: "",
            authorId: userId,
            ownerType: "CHURCH",
            status: "SCHEDULED",
          },
        });
      }
      
      return {
        ownerType,
        ownerId,
        ownerName,
        broadcastId: broadcast.id,
        broadcastName: broadcast.title,
        permissions: await this.resolvePermissions({
          ownerType,
          ownerId,
          userId,
          userRole,
        }),
        livekitConfig: await this.generateLiveKitConfig({
          ownerType,
          ownerId,
          broadcastId: broadcast.id,
        }),
      };
    } else if (broadcastId) {
      // Contexte global ou utilisateur - déterminer via le broadcast
      const broadcast = await prisma.liveBroadcast.findUnique({
        where: { id: broadcastId },
        include: { author: true },
      });
      
      if (!broadcast) {
        throw new Error("Broadcast not found");
      }
      
      ownerType = (broadcast.ownerType as any as OwnerType) || "USER";
      ownerId = broadcast.authorId;
      ownerName = broadcast.author.name || "Unknown";
      
      return {
        ownerType,
        ownerId,
        ownerName,
        broadcastId: broadcast.id,
        broadcastName: broadcast.title,
        permissions: await this.resolvePermissions({
          ownerType,
          ownerId,
          userId,
          userRole,
        }),
        livekitConfig: await this.generateLiveKitConfig({
          ownerType,
          ownerId,
          broadcastId: broadcast.id,
        }),
      };
    } else {
      // Contexte utilisateur par défaut - créer un broadcast
      ownerType = "USER";
      ownerId = userId;
      ownerName = userName || "Unknown";
      
      // Créer un broadcast pour l'utilisateur
      const broadcast = await prisma.liveBroadcast.create({
        data: {
          title: `${ownerName} - Live`,
          description: "Diffusion en direct",
          streamUrl: "",
          authorId: userId,
          ownerType: "USER",
          status: "SCHEDULED",
        },
      });
      
      return {
        ownerType,
        ownerId,
        ownerName,
        broadcastId: broadcast.id,
        broadcastName: broadcast.title,
        permissions: await this.resolvePermissions({
          ownerType,
          ownerId,
          userId,
          userRole,
        }),
        livekitConfig: await this.generateLiveKitConfig({
          ownerType,
          ownerId,
          broadcastId: broadcast.id,
        }),
      };
    }
  }
  
  /**
   * Résout les permissions basées sur le contexte et l'utilisateur
   */
  private static async resolvePermissions(params: {
    ownerType: OwnerType;
    ownerId: string;
    userId: string;
    userRole?: string;
  }): Promise<BroadcastPermissions> {
    const { ownerType, ownerId, userId, userRole } = params;
    
    // Permissions par défaut
    const permissions: BroadcastPermissions = {
      canPublish: false,
      canRecord: false,
      canStream: false,
      canManageOutputs: false,
      canInviteGuests: false,
      canUseMultistream: false,
      canManageChat: false,
    };
    
    // Administrateur global a toutes les permissions
    if (userRole === "ADMIN") {
      return {
        canPublish: true,
        canRecord: true,
        canStream: true,
        canManageOutputs: true,
        canInviteGuests: true,
        canUseMultistream: true,
        canManageChat: true,
      };
    }
    
    // Contexte USER : l'utilisateur est le propriétaire
    if (ownerType === "USER" && ownerId === userId) {
      return {
        canPublish: true,
        canRecord: true,
        canStream: true,
        canManageOutputs: true,
        canInviteGuests: true,
        canUseMultistream: true,
        canManageChat: true,
      };
    }
    
    // Contexte CHURCH : vérifier si l'utilisateur est admin de l'église
    if (ownerType === "CHURCH") {
      const churchAdmin = await prisma.churchAdmin.findFirst({
        where: {
          userId,
          churchId: ownerId,
        },
      });
      
      if (churchAdmin) {
        return {
          canPublish: true,
          canRecord: true,
          canStream: true,
          canManageOutputs: true,
          canInviteGuests: true,
          canUseMultistream: true,
          canManageChat: true,
        };
      }
    }
    
    // Par défaut, aucune permission
    return permissions;
  }
  
  /**
   * Génère la configuration LiveKit pour un contexte
   */
  private static async generateLiveKitConfig(params: {
    ownerType: OwnerType;
    ownerId: string;
    broadcastId?: string;
  }): Promise<{ token: string; url: string; roomName: string }> {
    const { ownerType, ownerId, broadcastId } = params;
    
    // Générer un nom de room unique - format compatible avec le public viewer
    // Le public viewer utilise: studio-${broadcastId}
    const roomName = broadcastId 
      ? `studio-${broadcastId}`
      : `${ownerType.toLowerCase()}_${ownerId}_studio`;
    
    // Récupérer l'URL LiveKit depuis les variables d'environnement
    const livekitUrl = process.env.LIVEKIT_URL || "";
    
    // Le token sera généré via l'API endpoint /api/livekit/token
    // Ici, nous retournons une configuration vide qui sera remplie par l'appelant
    return {
      token: "", // Sera généré via l'API
      url: livekitUrl,
      roomName,
    };
  }
  
  /**
   * Génère un token LiveKit pour un contexte
   */
  static async generateToken(context: BroadcastContext): Promise<string> {
    // Cette méthode délègue la génération du token à l'API endpoint
    // qui utilise le SDK LiveKit serveur
    const response = await fetch("/api/livekit/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomName: context.livekitConfig.roomName,
        participantName: context.ownerName,
        isPublisher: context.permissions.canPublish,
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to generate LiveKit token");
    }
    
    const data = await response.json();
    return data.token;
  }
  
  /**
   * Valide les permissions pour une action spécifique
   */
  static async validatePermission(
    context: BroadcastContext,
    permission: keyof BroadcastPermissions
  ): Promise<boolean> {
    return context.permissions[permission];
  }
  
  /**
   * Crée un nouveau broadcast pour un contexte
   */
  static async createBroadcast(params: {
    ownerType: OwnerType;
    ownerId: string;
    title: string;
    authorId: string;
  }) {
    const { ownerType, ownerId, title, authorId } = params;
    
    return await prisma.liveBroadcast.create({
      data: {
        title,
        description: "",
        streamUrl: "",
        authorId,
        ownerType,
        status: "SCHEDULED",
      },
    });
  }
  
  /**
   * Récupère un broadcast par ID avec son contexte
   */
  static async getBroadcastWithContext(broadcastId: string) {
    const broadcast = await prisma.liveBroadcast.findUnique({
      where: { id: broadcastId },
      include: {
        author: true,
        outputs: true,
        scenes: {
          include: {
            sources: true,
          },
        },
      },
    });
    
    if (!broadcast) {
      throw new Error("Broadcast not found");
    }
    
    return broadcast;
  }
  
  /**
   * Liste les broadcasts pour un contexte
   */
  static async listBroadcasts(params: {
    ownerType?: OwnerType;
    ownerId?: string;
    authorId?: string;
  }) {
    const { ownerType, ownerId, authorId } = params;
    
    const where: any = {};
    
    if (ownerType) {
      where.ownerType = ownerType;
    }
    
    if (ownerId) {
      where.authorId = ownerId;
    }
    
    if (authorId) {
      where.authorId = authorId;
    }
    
    return await prisma.liveBroadcast.findMany({
      where,
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
