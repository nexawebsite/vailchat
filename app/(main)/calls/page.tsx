import { mockCalls, mockUsers, currentUser } from "@/lib/mockData";
import { Phone, Video, PhoneMissed, Search } from "lucide-react";

export default function CallsPage() {
  return (
    <div className="flex h-full w-full">
      {/* Sidebar for Call Logs */}
      <div className="w-80 border-r border-border bg-background flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Calls</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search calls..."
              className="w-full bg-gray-100 dark:bg-[#27272a] rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {mockCalls.map((call) => {
            const isCaller = call.callerId === currentUser.id;
            const otherUserId = isCaller ? call.receiverId : call.callerId;
            const otherUser = mockUsers.find(u => u.id === otherUserId);
            
            if (!otherUser) return null;

            const isMissed = call.status === "missed";
            const CallIcon = call.type === "video" ? Video : Phone;

            return (
              <div key={call.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#27272a] transition-all cursor-pointer">
                <img src={otherUser.avatarUrl} alt={otherUser.username} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm ${isMissed && !isCaller ? 'text-red-500' : ''}`}>{otherUser.username}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    {isMissed ? <PhoneMissed className="w-3 h-3 text-red-500" /> : <CallIcon className="w-3 h-3" />}
                    <span>{call.timestamp}</span>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                  <CallIcon className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Area Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f4f4f5] dark:bg-[#000000]">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Phone className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Call History</h2>
        <p className="text-gray-500 max-w-sm">
          Select a contact to view your call history or start a new call.
        </p>
      </div>
    </div>
  );
}
