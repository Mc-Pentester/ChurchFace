export type PreachingCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PreachingSeries = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  authorId: string;
  author?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    preachings: number;
  };
};

export type Preaching = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
  views: number;
  authorId: string;
  categoryId: string;
  seriesId: string | null;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  category?: PreachingCategory;
  series?: PreachingSeries | null;
  verses?: PreachingVerse[];
  _count?: {
    preachingViews: number;
    likes: number;
    comments: number;
    bookmarks: number;
  };
  isLiked?: boolean;
  isBookmarked?: boolean;
};

export type PreachingView = {
  id: string;
  preachingId: string;
  userId: string;
  watchedAt: Date;
  duration: number | null;
};

export type PreachingLike = {
  id: string;
  preachingId: string;
  userId: string;
  createdAt: Date;
};

export type PreachingComment = {
  id: string;
  preachingId: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  replies?: PreachingComment[];
  _count?: {
    replies: number;
  };
};

export type PreachingBookmark = {
  id: string;
  preachingId: string;
  userId: string;
  createdAt: Date;
  preaching?: Preaching;
};

export type PreachingNote = {
  id: string;
  preachingId: string;
  userId: string;
  content: string;
  timestamp: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PreachingVerse = {
  id: string;
  preachingId: string;
  book: string;
  chapter: number;
  verse: string;
  text: string;
  createdAt: Date;
};

export type LiveBroadcast = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  streamUrl: string;
  authorId: string;
  viewerCount: number;
  status: "SCHEDULED" | "LIVE" | "ENDED";
  scheduledAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export type PreachingFilter = {
  categoryId?: string;
  seriesId?: string;
  authorId?: string;
  period?: "week" | "month" | "all";
  sort?: "views" | "recent" | "rating";
  search?: string;
};

export type PreachingStats = {
  totalPreachings: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalBookmarks: number;
  activeLiveBroadcasts: number;
};
