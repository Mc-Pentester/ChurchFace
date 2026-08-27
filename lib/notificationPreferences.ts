import { prisma } from "./prisma";
import { NotificationCategory } from "./notificationTypes";

/**
 * Structure des préférences de notification
 */
export interface UserNotificationPreferences {
  // Préférences globales
  enabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled?: boolean;

  // Préférences par catégorie
  categories: {
    [key in NotificationCategory]?: {
      enabled: boolean;
      pushEnabled: boolean;
    };
  };
}

/**
 * Préférences par défaut
 */
const DEFAULT_PREFERENCES: UserNotificationPreferences = {
  enabled: true,
  inAppEnabled: true,
  pushEnabled: true,
  emailEnabled: false,
  categories: {
    [NotificationCategory.SOCIAL]: { enabled: true, pushEnabled: true },
    [NotificationCategory.POST]: { enabled: true, pushEnabled: true },
    [NotificationCategory.CHURCH]: { enabled: true, pushEnabled: true },
    [NotificationCategory.PRAYER]: { enabled: true, pushEnabled: true },
    [NotificationCategory.LIVE]: { enabled: true, pushEnabled: true },
    [NotificationCategory.MESSAGING]: { enabled: true, pushEnabled: true },
    [NotificationCategory.CALL]: { enabled: true, pushEnabled: true },
    [NotificationCategory.SECURITY]: { enabled: true, pushEnabled: true },
  },
};

/**
 * Récupérer les préférences de notification d'un utilisateur
 */
export async function getUserNotificationPreferences(
  userId: string
): Promise<UserNotificationPreferences> {
  try {
    // Chercher dans ChurchMember (si l'utilisateur est membre d'une église)
    const churchMember = await prisma.churchMember.findFirst({
      where: { userId },
      select: { notificationPreferences: true },
    });

    if (churchMember?.notificationPreferences) {
      const prefs = churchMember.notificationPreferences as Record<string, unknown>;
      return {
        ...DEFAULT_PREFERENCES,
        ...prefs,
      };
    }

    // Retourner les préférences par défaut
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error("Error fetching user notification preferences:", error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Mettre à jour les préférences de notification d'un utilisateur
 */
export async function updateUserNotificationPreferences(
  userId: string,
  preferences: Partial<UserNotificationPreferences>
): Promise<void> {
  try {
    // Mettre à jour dans ChurchMember
    const churchMember = await prisma.churchMember.findFirst({
      where: { userId },
    });

    if (churchMember) {
      await prisma.churchMember.update({
        where: { id: churchMember.id },
        data: {
          notificationPreferences: preferences as any,
        },
      });
    } else {
      console.warn("User is not a church member, cannot update notification preferences");
    }
  } catch (error) {
    console.error("Error updating user notification preferences:", error);
    throw error;
  }
}

/**
 * Vérifier si un utilisateur doit recevoir une notification
 * en fonction de ses préférences
 */
export async function shouldSendNotification(
  userId: string,
  type: string,
  channel: "inApp" | "push" | "email" = "inApp"
): Promise<boolean> {
  try {
    const preferences = await getUserNotificationPreferences(userId);

    // Vérifier si les notifications sont globalement désactivées
    if (!preferences.enabled) {
      return false;
    }

    // Vérifier le canal spécifique
    if (channel === "inApp" && !preferences.inAppEnabled) {
      return false;
    }
    if (channel === "push" && !preferences.pushEnabled) {
      return false;
    }
    if (channel === "email" && !preferences.emailEnabled) {
      return false;
    }

    // Vérifier les préférences par catégorie
    // Pour simplifier, on mappe le type de notification vers une catégorie
    // Dans une implémentation complète, on aurait un mapping plus précis
    const category = getCategoryFromType(type);
    const categoryPrefs = preferences.categories[category];

    if (categoryPrefs && !categoryPrefs.enabled) {
      return false;
    }

    if (channel === "push" && categoryPrefs && !categoryPrefs.pushEnabled) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking notification preferences:", error);
    // En cas d'erreur, on autorise la notification par défaut
    return true;
  }
}

/**
 * Mapper un type de notification vers une catégorie
 * Cette fonction peut être étendue pour un mapping plus précis
 */
function getCategoryFromType(type: string): NotificationCategory {
  // Mapping basé sur les préfixes des types
  if (type.startsWith("FRIEND_") || type === "USER_FOLLOWED") {
    return NotificationCategory.SOCIAL;
  }
  if (type.startsWith("POST_") || type.startsWith("COMMENT_")) {
    return NotificationCategory.POST;
  }
  if (type.startsWith("CHURCH_")) {
    return NotificationCategory.CHURCH;
  }
  if (type.startsWith("PRAYER_")) {
    return NotificationCategory.PRAYER;
  }
  if (type.startsWith("LIVE_")) {
    return NotificationCategory.LIVE;
  }
  if (type.startsWith("MESSAGE_") || type.startsWith("CONVERSATION_")) {
    return NotificationCategory.MESSAGING;
  }
  if (type.startsWith("CALL_")) {
    return NotificationCategory.CALL;
  }
  if (type.startsWith("NEW_LOGIN") || type.startsWith("PASSWORD_")) {
    return NotificationCategory.SECURITY;
  }

  // Par défaut
  return NotificationCategory.SOCIAL;
}
