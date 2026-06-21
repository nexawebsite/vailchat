import ChatArea from "@/components/chat/ChatArea";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params object to access id in Next.js 15
  const resolvedParams = await params;
  const otherUserId = resolvedParams.id;

  // We pass the ID directly to ChatArea, which will handle fetching the messages
  // and user info using its own client-side useEffect, since we need AuthContext
  return (
    <div className="h-full flex flex-col">
      <ChatArea otherUserId={otherUserId} />
    </div>
  );
}
