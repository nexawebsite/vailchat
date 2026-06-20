import { MessageSquare } from "lucide-react";

export default function ChatEmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 h-full">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <MessageSquare className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Vailnet Messages</h2>
      <p className="text-gray-500 max-w-sm">
        Select a chat from the sidebar to start messaging or create a new conversation.
      </p>
    </div>
  );
}
