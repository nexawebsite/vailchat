"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Users as UsersIcon, X, Check, CheckCheck, MessageCirclePlus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function ChatList() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, socket } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  
  // Group state
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Users state
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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

    if (user) {
      fetchChats();
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleChatAdded = (chat: any) => {
      setChats(prev => {
        if (!prev.find(c => c._id === chat._id)) {
          return [chat, ...prev];
        }
        return prev;
      });
    };

    socket.on('chat_added', handleChatAdded);
    return () => {
      socket.off('chat_added', handleChatAdded);
    };
  }, [socket]);

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert("Tafadhali andika jina la Group kwanza!");
      return;
    }
    if (selectedParticipants.length === 0) {
      alert("Tafadhali chagua angalau mtu mmoja wa kumuweka kwenye Group!");
      return;
    }
    if (!user) return;
    setCreatingGroup(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/chats/group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName,
          participants: selectedParticipants,
          creatorId: user.id
        })
      });
      
      if (res.ok) {
        const newGroup = await res.json();
        setIsGroupModalOpen(false);
        setIsNewChatModalOpen(false);
        setGroupName("");
        setSelectedParticipants([]);
        setChats(prev => [newGroup, ...prev]); // Add to sidebar immediately
        
        // Notify other participants via socket
        if (socket) {
          socket.emit('new_chat_created', {
            chat: newGroup,
            participants: newGroup.participants
          });
        }
        
        router.push(`/chat/${newGroup._id}`);
      }
    } catch (error) {
      console.error("Error creating group", error);
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleAccessChat = async (otherUserId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, otherUserId })
      });
      if (res.ok) {
        const chat = await res.json();
        setIsNewChatModalOpen(false);
        setChats(prev => {
          if (!prev.find(c => c._id === chat._id)) {
            return [chat, ...prev]; // Add to sidebar if not exists
          }
          return prev;
        });

        // Notify other participant via socket
        if (socket) {
          socket.emit('new_chat_created', {
            chat,
            participants: chat.participants
          });
        }

        router.push(`/chat/${chat._id}`);
      }
    } catch (error) {
      console.error("Error accessing chat:", error);
    }
  };

  // Filter existing chats for sidebar
  const filteredChats = chats.filter((chat) => {
    if (chat.isGroup) {
      return chat.groupName.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      const otherUser = chat.participants.find((p: any) => p._id !== user?.id);
      const savedContact = user?.contacts?.find((c: any) => c.phoneNumber === otherUser?.phoneNumber);
      const displayName = savedContact ? savedContact.name : (otherUser?.phoneNumber || otherUser?.username || "");
      return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  // Filter all users for new chat modal
  const searchUsers = allUsers.filter(u => 
    u.phoneNumber.includes(searchQuery) || 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user?.contacts?.some((c: any) => c.phoneNumber === u.phoneNumber && c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <div className="p-4 border-b border-border flex justify-between items-center bg-white dark:bg-[#09090b]">
        <h2 className="text-2xl font-bold tracking-tight">Chats</h2>
        <button 
          className="p-2 bg-green-500/10 text-green-500 rounded-full hover:bg-green-500/20 transition-colors" 
          title="New Chat"
          onClick={() => {
            setSearchQuery("");
            setIsNewChatModalOpen(true);
          }}
        >
          <MessageCirclePlus className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 border-b border-border bg-white dark:bg-[#09090b]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tafuta chati..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 dark:bg-[#27272a] rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 bg-white dark:bg-[#09090b]">
        {loading ? (
          <p className="text-center text-gray-500 mt-4">Inatafuta...</p>
        ) : filteredChats.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">Hakuna chati. Bonyeza kitufe hapo juu kuanza.</p>
        ) : (
          filteredChats.map((chat) => {
            const isActive = pathname === `/chat/${chat._id}`;
            let displayName = "Unknown";
            let avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff`;
            let subText = chat.lastMessage?.content || "Anza kuchat...";
            
            if (chat.isGroup) {
              displayName = chat.groupName;
              avatar = chat.groupAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff`;
            } else {
              const otherUser = chat.participants.find((p: any) => p._id !== user?.id);
              if (otherUser) {
                const savedContact = user?.contacts?.find((c: any) => c.phoneNumber === otherUser.phoneNumber);
                displayName = savedContact ? savedContact.name : otherUser.phoneNumber;
                avatar = otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff`;
              }
            }

            return (
              <Link
                key={chat._id}
                href={`/chat/${chat._id}`}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive ? "bg-green-500/10 dark:bg-green-500/20" : "hover:bg-gray-50 dark:hover:bg-[#27272a]"
                }`}
              >
                <img src={avatar} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-sm truncate">{displayName}</h3>
                  </div>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    {chat.lastMessage && chat.lastMessage.senderId === user?.id && (
                      <span className="inline-flex items-center">
                        {chat.lastMessage.status === 'sent' && <Check className="w-3 h-3 text-gray-500" />}
                        {chat.lastMessage.status === 'delivered' && <CheckCheck className="w-3 h-3 text-gray-500" />}
                        {(!chat.lastMessage.status || chat.lastMessage.status === 'read') && <CheckCheck className="w-3 h-3 text-blue-500" />}
                      </span>
                    )}
                    <span className="truncate notranslate" translate="no">{subText}</span>
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* New Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#18181b] w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50 dark:bg-[#27272a]">
              <h3 className="font-semibold text-lg">Anza Maongezi Mapya</h3>
              <button onClick={() => setIsNewChatModalOpen(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-[#3f3f46] rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-border">
               <button 
                onClick={() => {
                  setIsNewChatModalOpen(false);
                  setIsGroupModalOpen(true);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#27272a] transition-colors"
               >
                 <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                   <UsersIcon className="w-5 h-5" />
                 </div>
                 <span className="font-medium">Tengeneza Group Jipya</span>
               </button>
            </div>

            <div className="p-2 overflow-y-auto flex-1">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Watu Wenye Vailnet</p>
              {searchUsers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Wewe ndio mtumiaji pekee wa Vailnet kwa sasa. Tafadhali fungua incognito na usajili akaunti nyingine (namba nyingine) ili uweze kuchat na mtu!</p>
              ) : (
                searchUsers.map((u) => {
                  const savedContact = user?.contacts?.find((c: any) => c.phoneNumber === u.phoneNumber);
                  const displayName = savedContact ? savedContact.name : u.phoneNumber;
                  return (
                    <div 
                      key={u._id} 
                      onClick={() => handleAccessChat(u._id)}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#27272a] transition-all"
                    >
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff`} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{displayName}</p>
                        <p className="text-xs text-gray-500">~ {u.username}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Group Creation Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#18181b] w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-lg">Tengeneza Group</h3>
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
                  placeholder="Mfano: Familia, Kazini..."
                  className="w-full bg-gray-100 dark:bg-[#27272a] rounded-xl py-2 px-3 outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Chagua Wanakikundi</label>
                <div className="space-y-2">
                  {allUsers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Wewe ndio mtumiaji pekee wa Vailnet kwa sasa. Huwezi kutengeneza group peke yako! Tafadhali fungua incognito na usajili akaunti nyingine ili kuweza kutengeneza group.</p>
                  ) : (
                    allUsers.map((u) => {
                      const isSelected = selectedParticipants.includes(u._id);
                      const savedContact = user?.contacts?.find((c: any) => c.phoneNumber === u.phoneNumber);
                      const displayName = savedContact ? savedContact.name : u.phoneNumber;
                      return (
                        <div 
                          key={u._id} 
                          onClick={() => toggleParticipant(u._id)}
                          className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${isSelected ? 'border-green-500 bg-green-500/10' : 'border-transparent hover:bg-gray-50 dark:hover:bg-[#27272a]'}`}
                        >
                          <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff`} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{displayName}</p>
                            <p className="text-xs text-gray-500">~ {u.username}</p>
                          </div>
                          {isSelected && <Check className="w-5 h-5 text-green-500" />}
                        </div>
                      )
                    })
                  )}
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
