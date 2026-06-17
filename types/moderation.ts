export type ReportReason = "spam" | "harassment" | "fake_account" | "offensive" | "inappropriate" | "other";
export type ReportStatus = "PENDING" | "RESOLVED" | "DISMISSED";
export type ReportTargetType = "post" | "comment" | "story" | "user";

export type AdminAction = 
  | "approve_post" 
  | "hide_post" 
  | "delete_post" 
  | "restore_post" 
  | "pin_post"
  | "hide_comment"
  | "delete_comment"
  | "restore_comment"
  | "suspend_user"
  | "ban_user"
  | "reactivate_user"
  | "delete_story"
  | "hide_story"
  | "resolve_report"
  | "dismiss_report";

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: ReportTargetType;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  reporter?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  target?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: AdminAction;
  targetId: string | null;
  targetType: string | null;
  details: any;
  createdAt: string;
  admin?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface ModerationStats {
  pendingReports: number;
  reportedPosts: number;
  reportedComments: number;
  reportedStories: number;
  reportedUsers: number;
  hiddenPosts: number;
  hiddenComments: number;
  suspendedUsers: number;
  bannedUsers: number;
}

export interface PostModerationData {
  id: string;
  content: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
  authorId: string;
  author?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  isHidden: boolean;
  isPinned: boolean;
  reportCount: number;
  likeCount: number;
  commentCount: number;
}

export interface CommentModerationData {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  postId: string;
  isHidden: boolean;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  post?: {
    id: string;
    content: string | null;
  };
  reportCount: number;
}

export interface UserModerationData {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: string;
  isSuspended: boolean;
  isBanned: boolean;
  suspendedAt: string | null;
  bannedAt: string | null;
  reportCount: number;
  postCount: number;
  commentCount: number;
}

export interface StoryModerationData {
  id: string;
  imageUrl: string | null;
  videoUrl: string | null;
  content: string | null;
  createdAt: string;
  expiresAt: string;
  authorId: string;
  isHidden: boolean;
  author?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  reportCount: number;
  viewCount: number;
}
