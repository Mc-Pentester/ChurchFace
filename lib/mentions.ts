import { prisma } from "./prisma";

/**
 * Structure d'une mention extraite
 */
export interface Mention {
  username: string;
  userId?: string;
}

/**
 * Parser les mentions @ dans un texte
 * @param content - Le texte à analyser
 * @returns Liste des mentions trouvées
 */
export function parseMentions(content: string): string[] {
  if (!content) return [];

  // Regex pour trouver les mentions @username
  // Capture les caractères alphanumériques et underscores après @
  const matches = content.matchAll(/@([a-zA-Z0-9_]+)/g);
  
  return Array.from(matches).map((m) => m[1]);
}

/**
 * Résoudre les mentions en IDs utilisateur
 * @param mentions - Liste des usernames mentionnés
 * @returns Map username → userId
 */
export async function resolveMentions(mentions: string[]): Promise<Map<string, string>> {
  if (!mentions || mentions.length === 0) {
    return new Map();
  }

  const users = await prisma.user.findMany({
    where: {
      OR: mentions.map((username) => ({
        OR: [
          { name: { contains: username, mode: "insensitive" } },
          { email: { contains: username, mode: "insensitive" } },
        ],
      })),
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const mentionMap = new Map<string, string>();
  
  for (const user of users) {
    // Mapper le username (insensible à la casse) vers l'ID utilisateur
    const userName = user.name?.toLowerCase() || "";
    const userEmail = user.email?.toLowerCase() || "";
    
    for (const mention of mentions) {
      const mentionLower = mention.toLowerCase();
      if (userName === mentionLower || userEmail === mentionLower) {
        mentionMap.set(mention, user.id);
      }
    }
  }

  return mentionMap;
}

/**
 * Créer des notifications pour les mentions
 * @param mentions - Map username → userId
 * @param senderId - ID de l'utilisateur qui a créé la mention
 * @param type - Type de notification (COMMENT_MENTIONED, MESSAGE_MENTIONED, etc.)
 * @param message - Message de notification
 * @param entityId - ID de l'entité concernée
 * @param entityType - Type de l'entité
 */
export async function createMentionNotifications(
  mentions: Map<string, string>,
  senderId: string,
  type: string,
  message: string,
  entityId?: string,
  entityType?: string
): Promise<void> {
  if (!mentions || mentions.size === 0) {
    return;
  }

  const { createNotification } = await import("./notifications");

  for (const [username, userId] of mentions.entries()) {
    // Ne pas notifier l'expéditeur lui-même
    if (userId === senderId) {
      continue;
    }

    try {
      await createNotification({
        userId,
        senderId,
        type,
        message,
        entityId,
        entityType,
      });
    } catch (error) {
      console.error(`Failed to create mention notification for ${username}:`, error);
    }
  }
}

/**
 * Fonction utilitaire complète pour traiter les mentions dans un contenu
 * @param content - Le contenu à analyser
 * @param senderId - ID de l'utilisateur qui a créé le contenu
 * @param type - Type de notification
 * @param message - Message de notification
 * @param entityId - ID de l'entité concernée
 * @param entityType - Type de l'entité
 */
export async function processMentions(
  content: string,
  senderId: string,
  type: string,
  message: string,
  entityId?: string,
  entityType?: string
): Promise<void> {
  const mentions = parseMentions(content);
  const mentionMap = await resolveMentions(mentions);
  await createMentionNotifications(mentionMap, senderId, type, message, entityId, entityType);
}
