export type FriendshipStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "BLOCKED";

export interface Friendship {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
  sender?: UserBasic;
  receiver?: UserBasic;
}

export interface UserBasic {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  church: string | null;
  city: string | null;
}

export interface FriendshipWithUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  church: string | null;
  city: string | null;
  friendshipId: string;
  isSender: boolean;
  status: FriendshipStatus;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  church: string | null;
  city: string | null;
  friendshipId: string;
  mutualFriends?: number;
  isSender: boolean;
  status: FriendshipStatus;
  createdAt: string;
}

export interface FriendSuggestion {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  church: string | null;
  city: string | null;
  score: number;
  mutualFriends: number;
}

export interface OnlineFriend {
  id: string;
  name: string;
  email: string;
  image: string | null;
  church: string | null;
  isOnline: boolean;
}

export interface MutualFriend {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  church: string | null;
}
