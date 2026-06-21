"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Users as UsersIcon, X, Check } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function ChatList() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Group creation state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        // Hapa tunavuta chats (zikiwemo groups) badala ya users pekee
        const res = await fetch(`${apiUrl}/api/chats/${user?.id}`);
        if (res.ok) {
          const data = await res.json();
          setChats(data);
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchChats();
    }
  }, [user]);

  // Fallback kama hakuna chats, tuweze kutafuta users wote ili kuanzisha chat mpya
  const [allUsers, setAllUsers] = useState<any[]>([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/users`);
        if (res.ok) {
          const data = await res.json();
          setAllUsers(data.filter((u: any) => u._id !== user?.id));
        }
      } catch (error) {}
    };
    if (user) fetchUsers();
  }, [user]);

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedParticipants.length === 0 || !user) return;
    setCreatingGroup(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/chats/group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          groupName,
          participants: selectedParticipants,
          creatorId: user.id
        })
      });
      
      if (res.ok) {
        setIsGroupModalOpen(false);
        setGroupName("");
        setSelectedParticipants([]);
        // Optional: you could refresh chats here by calling fetchChats again if it were broken out,
        // but it will reload when user toggles or changes context.
      }
    } catch (error) {
      console.error("Error creating group", error);
    } finally {
      setCreatingGroup(false);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.phoneNumber.includes(searchQuery) || 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user?.contacts?.some((c: any) => c.phoneNumber === u.phoneNumber && c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Chats</h2>
        <button 
          className="p-2 bg-green-500/10 text-green-500 rounded-full hover:bg-green-500/20" 
          title="Tengeneza Group"
          onClick={() => setIsGroupModalOpen(true)}
        >
          <UsersIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tafuta namba au jina..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 dark:bg-[#27272a] rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
        {loading ? (
          <p className="text-center text-gray-500 mt-4">Inatafuta...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">Hakuna watumiaji waliopatikana</p>
        ) : (
          filteredUsers.map((otherUser) => {
            const isActive = pathname === `/chat/${otherUser._id}`;
            const avatar = otherUser.avatar || "https://i.pravatar.cc/150";
            
            // Check if saved in contacts
            const savedContact = user?.contacts?.find((c: any) => c.phoneNumber === otherUser.phoneNumber);
            const displayName = savedContact ? savedContact.name : otherUser.phoneNumber;
            const subText = savedContact ? `~ ${otherUser.username}` : "Bofya kuanza kuchat";

            return (
              <Link
                key={otherUser._id}
                href={`/chat/${otherUser._id}`}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive ? "bg-green-500/10 dark:bg-green-500/20" : "hover:bg-gray-50 dark:hover:bg-[#27272a]"
                }`}
              >
                <img src={avatar} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-sm truncate">{displayName}</h3>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {subText}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Group Creation Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#18181b] w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-lg">Tengeneza Group Jipya</h3>
              <button onClick={() => setIsGroupModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-[#27272a] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Jina la Group</label>
                <input 
                  type="text" 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Andika jina la group..."
                  className="w-full bg-gray-100 dark:bg-[#27272a] rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Chagua Wanakikundi</label>
                <div className="space-y-2">
                  {allUsers.map((u) => {
                    const isSelected = selectedParticipants.includes(u._id);
                    return (
                      <div 
                        key={u._id} 
                        onClick={() => toggleParticipant(u._id)}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${isSelected ? 'border-green-500 bg-green-500/10' : 'border-transparent hover:bg-gray-50 dark:hover:bg-[#27272a]'}`}
                      >
                        <img src={u.avatar || "https://i.pravatar.cc/150"} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{u.username}</p>
                          <p className="text-xs text-gray-500">{u.phoneNumber}</p>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-green-500" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-border">
              <button 
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedParticipants.length === 0 || creatingGroup}
                className="w-full py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {creatingGroup ? "Inatengeneza..." : "Tengeneza Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
