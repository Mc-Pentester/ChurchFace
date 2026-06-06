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
  user: {
    id: string;
    name: string | null;
    image: string | null;
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
  _count?: {
    links: number;
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
