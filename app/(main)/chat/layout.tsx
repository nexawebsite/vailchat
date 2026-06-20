import ChatList from "@/components/chat/ChatList";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full">
      <div className="w-80 border-r border-border bg-background flex flex-col shrink-0">
        <ChatList />
      </div>
      <div className="flex-1 flex flex-col bg-[#f4f4f5] dark:bg-[#000000]">
        {children}
      </div>
    </div>
  );
}
