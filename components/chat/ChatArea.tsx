"use client";

import { useState } from "react";
import { Chat, Message, User } from "@/lib/types";
import { Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send } from "lucide-react";

interface ChatAreaProps {
  chat: Chat;
  initialMessages: Message[];
  currentUser: User;
}

export default function ChatArea({ chat, initialMessages, currentUser }: ChatAreaProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");

  const otherParticipant = chat.participants.find((p) => p.id !== currentUser.id) || chat.participants[0];
  const name = chat.name || otherParticipant.username;
  const avatar = chat.isGroup ? "https://i.pravatar.cc/150?u=group" : otherParticipant.avatarUrl;

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const msg: Message = {
      id: `msg_${Date.now()}`,
      chatId: chat.id,
      senderId: currentUser.id,
      type: "text",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, msg]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#09090b]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h2 className="font-bold">{name}</h2>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-gray-500">
          <button className="hover:text-primary transition-colors"><Phone className="w-5 h-5" /></button>
          <button className="hover:text-primary transition-colors"><Video className="w-5 h-5" /></button>
          <button className="hover:text-primary transition-colors"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f4f4f5] dark:bg-transparent">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-2.5 shadow-sm ${
                isMe ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" : "bg-white dark:bg-[#27272a] rounded-2xl rounded-tl-sm border border-border"
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-[#09090b] border-t border-border">
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-[#27272a] rounded-full px-4 py-2">
          <button className="text-gray-500 hover:text-primary transition-colors"><Smile className="w-6 h-6" /></button>
          <button className="text-gray-500 hover:text-primary transition-colors"><Paperclip className="w-5 h-5" /></button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent outline-none px-2 text-sm"
          />
          {newMessage.trim() ? (
            <button onClick={handleSend} className="text-white bg-primary p-2 rounded-full hover:bg-primary/90 transition-all">
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          ) : (
            <button className="text-gray-500 hover:text-primary transition-colors"><Mic className="w-5 h-5" /></button>
          )}
        </div>
      </div>
    </div>
  );
}
