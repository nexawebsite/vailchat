import { User, Chat, Message, Call } from "./types";

export const currentUser: User = {
  id: "user_1",
  username: "Anthony",
  phoneNumber: "+255712345678",
  avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  status: "Online",
};

export const mockUsers: User[] = [
  {
    id: "user_2",
    username: "Juma",
    phoneNumber: "+255788112233",
    avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    id: "user_3",
    username: "Asha",
    phoneNumber: "+255766445566",
    avatarUrl: "https://i.pravatar.cc/150?u=a04258114e29026702d",
  },
];

export const mockMessages: Record<string, Message[]> = {
  "chat_1": [
    {
      id: "msg_1",
      chatId: "chat_1",
      senderId: "user_2",
      type: "text",
      content: "Mambo vipi?",
      timestamp: "10:00 AM",
    },
    {
      id: "msg_2",
      chatId: "chat_1",
      senderId: "user_1",
      type: "text",
      content: "Poa sana, wewe je?",
      timestamp: "10:02 AM",
    },
  ],
};

export const mockChats: Chat[] = [
  {
    id: "chat_1",
    isGroup: false,
    participants: [currentUser, mockUsers[0]],
    unreadCount: 0,
    lastMessage: mockMessages["chat_1"][1],
  },
];

export const mockCalls: Call[] = [
  {
    id: "call_1",
    callerId: "user_2",
    receiverId: "user_1",
    type: "voice",
    status: "completed",
    timestamp: "Yesterday, 14:30",
    duration: "15:20",
  },
];
