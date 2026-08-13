export type PrayerCategory =
  | "SANTE"
  | "FAMILLE"
  | "TRAVAIL"
  | "ETUDES"
  | "MINISTERE"
  | "FINANCES"
  | "MARIAGE"
  | "EVANGELISATION";

export interface PrayerRequestWithUser {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: PrayerCategory;
  isUrgent: boolean;
  isAnswered: boolean;
  createdAt: string;
  updatedAt: string;
  churchId?: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  church?: {
    id: string;
    name: string;
    slug: string;
  };
  _count?: {
    reactions: number;
    responses: number;
    verses: number;
  };
  reactions?: PrayerReactionWithUser[];
  responses?: PrayerResponseWithUser[];
  verses?: PrayerVerseWithUser[];
  testimony?: PrayerTestimony | null;
}

export interface PrayerReactionWithUser {
  id: string;
  type: "PRAY" | "ENCOURAGE";
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface PrayerResponseWithUser {
  id: string;
  content: string;
  type: "COMMENT" | "ENCOURAGEMENT";
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface PrayerVerseWithUser {
  id: string;
  reference: string;
  text: string | null;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface PrayerTestimony {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface PrayerChainWithLinks {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  ownerId?: string;
  ownerType?: string;
  churchId?: string;
  groupId?: string;
  ministryId?: string;
  eventId?: string;
  imageUrl?: string;
  visibility?: "PUBLIC" | "PRIVATE" | "CHURCH_MEMBERS";
  prayerCampaignId?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  _count?: {
    links: number;
    participants?: number;
  };
  links?: {
    id: string;
    message: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }[];
}

export interface PrayerParticipant {
  id: string;
  prayerChainId: string;
  userId: string;
  role: "PARTICIPANT" | "MODERATOR" | "ADMIN";
  joinedAt: string;
  lastPrayedAt?: string;
  prayerCount: number;
  notificationEnabled: boolean;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface PrayerSchedule {
  id: string;
  prayerChainId: string;
  userId: string;
  hour: number;
  dayOfWeek?: number;
  isActive: boolean;
  createdAt: string;
}

export interface PrayerRoom {
  id: string;
  prayerChainId?: string;
  title: string;
  description?: string;
  roomType: "TEXT" | "AUDIO" | "VIDEO";
  isPublic: boolean;
  isActive: boolean;
  moderatorId: string;
  maxParticipants?: number;
  scheduledStart?: string;
  scheduledEnd?: string;
  createdAt: string;
  endedAt?: string;
  _count?: {
    participants?: number;
  };
}

export interface PrayerCampaign {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  type: "FAST" | "PRAYER" | "VIGIL" | "NATIONAL" | "GLOBAL";
  startDate: string;
  endDate: string;
  isActive: boolean;
  churchId?: string;
  createdBy: string;
  createdAt: string;
  church?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  _count?: {
    chains?: number;
  };
}

export interface PrayerEngagement {
  id: string;
  prayerRequestId: string;
  userId: string;
  type: "PRAYED" | "ENCOURAGED" | "SHARED_VERSE" | "SHARED_TESTIMONY";
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface PrayerLiveRoomWithCount {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  isActive: boolean;
  moderatorId: string;
  createdAt: string;
  endedAt: string | null;
  _count?: {
    participants: number;
  };
}

export const PRAYER_CATEGORIES: { key: PrayerCategory; label: string; emoji: string }[] = [
  { key: "SANTE", label: "Santé", emoji: "💊" },
  { key: "FAMILLE", label: "Famille", emoji: "👨‍👩‍👧‍👦" },
  { key: "TRAVAIL", label: "Travail", emoji: "💼" },
  { key: "ETUDES", label: "Études", emoji: "📚" },
  { key: "MINISTERE", label: "Ministère", emoji: "⛪" },
  { key: "FINANCES", label: "Finances", emoji: "💰" },
  { key: "MARIAGE", label: "Mariage", emoji: "💍" },
  { key: "EVANGELISATION", label: "Évangélisation", emoji: "📢" },
];
