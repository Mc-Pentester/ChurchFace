export interface Message {
  id: string;
  content: string;
  createdAt: string;
  chatId: string;
  senderId: string;
  sender?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  seenBy?: MessageSeen[];
}

export interface MessageSeen {
  id: string;
  messageId: string;
  userId: string;
  seenAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface Chat {
  id: string;
  isGroup: boolean;
  name: string | null;
  createdAt: string;
  members: ChatMember[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface ChatMember {
  id: string;
  userId: string;
  chatId: string;
  isTyping: boolean;
  lastSeen: string | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    bio: string | null;
    church: string | null;
    city: string | null;
  };
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  name: string | null;
  avatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
  members: ChatMember[];
}

export interface TypingIndicator {
  chatId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  type: "image" | "video" | "file" | "audio";
  url: string;
  name: string;
  size: number;
}
