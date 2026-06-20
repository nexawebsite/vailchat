"use client";

import { mockChats, currentUser } from "@/lib/mockData";
import Link from "next/link";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";

export default function ChatList() {
  const pathname = usePathname();

  return (
    <>
      <div className="p-4 border-b border-border">
        <h2 className="text-2xl font-bold mb-4 tracking-tight">Messages</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full bg-gray-100 dark:bg-[#27272a] rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
        {mockChats.map((chat) => {
          const isActive = pathname === `/chat/${chat.id}`;
          const otherParticipant = chat.participants.find((p) => p.id !== currentUser.id) || chat.participants[0];
          const name = chat.name || otherParticipant.username;
          const avatar = chat.isGroup ? "https://i.pravatar.cc/150?u=group" : otherParticipant.avatarUrl;

          return (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive ? "bg-primary/10 dark:bg-primary/20" : "hover:bg-gray-50 dark:hover:bg-[#27272a]"
              }`}
            >
              <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-sm truncate">{name}</h3>
                  {chat.lastMessage && (
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {chat.lastMessage.timestamp}
                    </span>
                  )}
                </div>
                {chat.lastMessage && (
                  <p className="text-xs text-gray-500 truncate">
                    {chat.lastMessage.senderId === currentUser.id ? "You: " : ""}{chat.lastMessage.content}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
