"use client";

import ChatList from "@/components/chat/ChatList";
import { usePathname } from "next/navigation";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatActive = pathname !== "/chat";

  return (
    <div className="flex h-full w-full relative">
      <div className={`w-full md:w-80 border-r border-border bg-background flex-col shrink-0 ${isChatActive ? 'hidden md:flex' : 'flex'}`}>
        <ChatList />
      </div>
      <div className={`flex-1 flex-col bg-[#f4f4f5] dark:bg-[#000000] ${isChatActive ? 'flex' : 'hidden md:flex'}`}>
        {children}
      </div>
    </div>
  );
}
