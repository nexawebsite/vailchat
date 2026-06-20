import { mockChats, mockMessages, currentUser } from "@/lib/mockData";
import { notFound } from "next/navigation";
import ChatArea from "@/components/chat/ChatArea";

export default function ChatPage({ params }: { params: { id: string } }) {
  const chat = mockChats.find((c) => c.id === params.id);
  
  if (!chat) {
    notFound();
  }

  const messages = mockMessages[chat.id] || [];

  return <ChatArea chat={chat} initialMessages={messages} currentUser={currentUser} />;
}
