"use client";

import { useState, useEffect } from "react";
import { Chat, Message, User } from "@/lib/types";
import { Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send, X, ShieldAlert, UserMinus, UserPlus, Image as ImageIcon, Check } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

interface ChatAreaProps {
  chatId: string;
}

export default function ChatArea({ chatId }: ChatAreaProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { socket, user } = useAuth();
  
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  useEffect(() => {
    // Fetch Chat Info
    const fetchChatData = async () => {
      if (!user) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        // 1. Fetch user's chats to find this specific chat
        const chatsRes = await fetch(`${apiUrl}/api/chats/${user.id}`);
        if (chatsRes.ok) {
          const allChats = await chatsRes.json();
          const targetChat = allChats.find((c: any) => c._id === chatId);
          if (targetChat) {
            setChatInfo(targetChat);
            setNewGroupName(targetChat.groupName);
          }
        }

        // 2. Fetch messages
        const msgRes = await fetch(`${apiUrl}/api/messages/${chatId}`);
        if (msgRes.ok) {
          const data = await msgRes.json();
          const formatted = data.map((m: any) => ({
            id: m._id,
            chatId: m.chatId,
            senderId: m.senderId?._id || m.senderId,
            senderName: m.senderId?.username || "Unknown",
            type: m.type,
            content: m.content,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(formatted);
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };

    fetchChatData();
  }, [user, chatId]);

  useEffect(() => {
    if (!socket) return;

    // Join room
    socket.emit('join_chat', chatId);

    const handleReceiveMessage = (msg: any) => {
      if (msg.chatId === chatId) {
        setMessages((prev) => [...prev, {
          id: msg._id || `msg_${Date.now()}`,
          chatId: msg.chatId,
          senderId: msg.senderId?._id || msg.senderId,
          senderName: msg.senderId?.username || "Unknown",
          type: msg.type || "text",
          content: msg.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    };

    const handleMessageSent = (msg: any) => {};

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
    };
  }, [socket, chatId]);

  const handleSend = () => {
    if (!newMessage.trim() || !user) return;
    
    // Send via Socket
    if (socket) {
      socket.emit('send_message', {
        senderId: user.id,
        chatId: chatId,
        content: newMessage,
        type: 'text'
      });
    }
    
    // Optimistic UI update
    const msg = {
      id: `msg_${Date.now()}`,
      chatId: chatId,
      senderId: user.id,
      senderName: user.username,
      type: "text",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Determine type
    let fileType = 'text';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type.startsWith('audio/')) fileType = 'audio';
    
    // Upload to backend
    const formData = new FormData();
    formData.append('media', file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        // Send via Socket
        if (socket) {
          socket.emit('send_message', {
            senderId: user.id,
            chatId: chatId,
            content: data.url,
            type: fileType
          });
        }
        
        // Optimistic UI update
        const msg = {
          id: `msg_${Date.now()}`,
          chatId: chatId,
          senderId: user.id,
          senderName: user.username,
          type: fileType as any,
          content: data.url,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, msg]);
      }
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  const updateGroupName = async () => {
    if (!newGroupName.trim() || !user) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/chats/group/rename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, chatName: newGroupName, adminId: user.id })
      });
      if (res.ok) {
        const updatedChat = await res.json();
        setChatInfo(updatedChat);
        setIsEditingName(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeUserFromGroup = async (userIdToRemove: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/chats/group/remove`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, userIdToRemove, adminId: user?.id })
      });
      if (res.ok) {
        const updatedChat = await res.json();
        setChatInfo(updatedChat);
      }
    } catch (err) {
      console.error(err);
    }
  };

  let name = "Loading...";
  let avatar = "https://i.pravatar.cc/150";
  let isGroup = false;
  let isAdmin = false;

  if (chatInfo) {
    isGroup = chatInfo.isGroup;
    isAdmin = chatInfo.groupAdmins?.includes(user?.id);
    
    if (isGroup) {
      name = chatInfo.groupName;
      avatar = chatInfo.groupAvatar || "https://ui-avatars.com/api/?name=Group&background=22c55e&color=fff";
    } else {
      const otherUser = chatInfo.participants.find((p: any) => p._id !== user?.id);
      if (otherUser) {
        const savedContact = user?.contacts?.find((c: any) => c.phoneNumber === otherUser.phoneNumber);
        name = savedContact ? savedContact.name : otherUser.phoneNumber;
        avatar = otherUser.avatar || "https://i.pravatar.cc/150";
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#09090b] relative">
      {/* Header */}
      <div 
        className={`px-6 py-4 border-b border-border flex justify-between items-center bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md z-10 ${isGroup ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[#27272a]' : ''}`}
        onClick={() => isGroup && setIsGroupInfoOpen(true)}
      >
        <div className="flex items-center gap-4">
          <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h2 className="font-bold">{name}</h2>
            {isGroup ? (
              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                {chatInfo?.participants?.map((p: any) => p.username).join(', ')}
              </p>
            ) : (
              <p className="text-xs text-green-500">Online</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6 text-gray-500">
          <button className="hover:text-primary transition-colors"><Phone className="w-5 h-5" /></button>
          <button className="hover:text-primary transition-colors"><Video className="w-5 h-5" /></button>
          <button className="hover:text-primary transition-colors"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f4f4f5] dark:bg-transparent" style={{ backgroundImage: "url('https://i.ibb.co/311W9jK/whatsapp-bg.png')", backgroundSize: "cover", backgroundBlendMode: "overlay" }}>
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-2.5 shadow-sm ${
                isMe ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-black dark:text-white rounded-2xl rounded-tr-sm" : "bg-white dark:bg-[#202c33] text-black dark:text-white rounded-2xl rounded-tl-sm border border-border"
              }`}>
                {/* Show sender name if it's a group and not me */}
                {isGroup && !isMe && (
                  <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-1">{msg.senderName}</p>
                )}

                {msg.type === 'image' && (
                  <img src={msg.content} alt="Image Attachment" className="rounded-xl max-w-full h-auto mb-2" />
                )}
                {msg.type === 'video' && (
                  <video src={msg.content} controls className="rounded-xl max-w-full h-auto mb-2" />
                )}
                {msg.type === 'audio' && (
                  <audio src={msg.content} controls className="w-full mb-2" />
                )}
                {msg.type === 'text' && (
                  <p className="text-sm">{msg.content}</p>
                )}
                
                {/* Fallback for old messages without type */}
                {!msg.type && <p className="text-sm">{msg.content}</p>}
                
                <p className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-100 dark:bg-[#202c33]">
        <div className="flex items-center gap-3 bg-white dark:bg-[#2a3942] rounded-full px-4 py-2 shadow-sm">
          <button className="text-gray-500 hover:text-primary transition-colors"><Smile className="w-6 h-6" /></button>
          
          <label className="text-gray-500 hover:text-primary transition-colors cursor-pointer">
            <Paperclip className="w-5 h-5" />
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload} 
              accept="image/*,video/*,audio/*"
            />
          </label>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tuma ujumbe..."
            className="flex-1 bg-transparent outline-none px-2 text-sm text-black dark:text-white"
          />
          {newMessage.trim() ? (
            <button onClick={handleSend} className="text-white bg-green-500 p-2 rounded-full hover:bg-green-600 transition-all">
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          ) : (
            <button className="text-white bg-green-500 p-2 rounded-full hover:bg-green-600 transition-all"><Mic className="w-4 h-4" /></button>
          )}
        </div>
      </div>

      {/* Group Info Drawer/Modal */}
      {isGroupInfoOpen && (
        <div className="absolute inset-y-0 right-0 w-80 bg-gray-50 dark:bg-[#111b21] shadow-2xl border-l border-border flex flex-col z-50 transform transition-transform">
          <div className="p-4 flex items-center gap-4 bg-white dark:bg-[#202c33] border-b border-border">
            <button onClick={() => setIsGroupInfoOpen(false)}><X className="w-5 h-5" /></button>
            <h3 className="font-medium text-lg">Group Info</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 bg-white dark:bg-[#111b21] flex flex-col items-center justify-center text-center border-b border-border">
              <img src={avatar} className="w-32 h-32 rounded-full object-cover mb-4" />
              {isEditingName && isAdmin ? (
                <div className="flex items-center gap-2 w-full">
                  <input 
                    value={newGroupName} 
                    onChange={(e) => setNewGroupName(e.target.value)} 
                    className="flex-1 border-b-2 border-green-500 bg-transparent outline-none text-center"
                  />
                  <button onClick={updateGroupName} className="text-green-500"><Check className="w-5 h-5" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">{name}</h2>
                  {isAdmin && (
                     <button onClick={() => setIsEditingName(true)} className="text-gray-500"><ShieldAlert className="w-4 h-4" /></button>
                  )}
                </div>
              )}
              <p className="text-gray-500 text-sm mt-1">Group • {chatInfo?.participants?.length} participants</p>
            </div>

            <div className="p-4 bg-white dark:bg-[#111b21] mt-2">
              <div className="flex justify-between items-center mb-4">
                <p className="text-green-500 font-medium text-sm">{chatInfo?.participants?.length} Participants</p>
                {isAdmin && (
                  <button className="flex items-center gap-1 text-green-500 hover:text-green-600 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add</span>
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {chatInfo?.participants?.map((p: any) => {
                  const isUserAdmin = chatInfo?.groupAdmins?.includes(p._id);
                  const isMe = p._id === user?.id;
                  const savedContact = user?.contacts?.find((c: any) => c.phoneNumber === p.phoneNumber);
                  const displayName = isMe ? "You" : (savedContact ? savedContact.name : p.phoneNumber);

                  return (
                    <div key={p._id} className="flex justify-between items-center group cursor-pointer hover:bg-gray-100 dark:hover:bg-[#202c33] p-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={p.avatar || "https://i.pravatar.cc/150"} className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-medium text-sm">{displayName}</p>
                          {isUserAdmin && <p className="text-[10px] text-green-500 border border-green-500 rounded px-1 w-fit mt-0.5">Group Admin</p>}
                        </div>
                      </div>
                      
                      {isAdmin && !isMe && !isUserAdmin && (
                        <button onClick={() => removeUserFromGroup(p._id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
