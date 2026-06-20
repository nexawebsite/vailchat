export interface User {
  id: string;
  username: string;
  phoneNumber: string;
  avatarUrl?: string;
  status?: string;
}

export type MessageType = "text" | "image" | "video" | "audio";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  content: string; // text or url
  timestamp: string;
}

export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface Call {
  id: string;
  callerId: string;
  receiverId: string;
  type: "voice" | "video";
  status: "missed" | "completed" | "ongoing";
  timestamp: string;
  duration?: string;
}
