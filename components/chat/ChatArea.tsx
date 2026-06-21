"use client";

import { useState, useEffect } from "react";
import { Chat, Message, User } from "@/lib/types";
import { Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

interface ChatAreaProps {
  otherUserId: string;
}

export default function ChatArea({ otherUserId }: ChatAreaProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { socket, user } = useAuth();
  const [otherParticipant, setOtherParticipant] = useState<any>(null);

  useEffect(() => {
    // Fetch other user info and messages
    const fetchData = async () => {
      if (!user) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        // Fetch all users to find the specific one
        const usersRes = await fetch(`${apiUrl}/api/users`);
        if (usersRes.ok) {
          const users = await usersRes.json();
          const targetUser = users.find((u: any) => u._id === otherUserId);
          setOtherParticipant(targetUser);
        }

        // Fetch messages
        const msgRes = await fetch(`${apiUrl}/api/messages/${user.id}/${otherUserId}`);
        if (msgRes.ok) {
          const data = await msgRes.json();
          // Format messages for UI
          const formatted = data.map((m: any) => ({
            id: m._id,
            chatId: otherUserId,
            senderId: m.senderId,
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

    fetchData();
  }, [user, otherUserId]);

  const name = otherParticipant?.username || "Unknown";
  const avatar = otherParticipant?.avatar || "https://i.pravatar.cc/150";

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: any) => {
      // Ensure the message belongs to the current chat
      // For a real app, you'd match the receiverId/senderId, but for now we append
      setMessages((prev) => [...prev, {
        id: msg._id || `msg_${Date.now()}`,
        chatId: otherUserId,
        senderId: msg.senderId,
        type: msg.type || "text",
        content: msg.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    };

    const handleMessageSent = (msg: any) => {
      // You can confirm message delivery here
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
    };
  }, [socket, otherUserId]);

  const handleSend = () => {
    if (!newMessage.trim() || !user) return;
    
    const realSenderId = user.id; // From AuthContext
    const receiverId = otherUserId;

    // Send via Socket
    if (socket) {
      socket.emit('send_message', {
        senderId: realSenderId,
        receiverId: receiverId,
        content: newMessage,
        type: 'text'
      });
    }
    
    // Optimistic UI update
    const msg: Message = {
      id: `msg_${Date.now()}`,
      chatId: otherUserId,
      senderId: user.id,
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
            receiverId: otherUserId,
            content: data.url,
            type: fileType
          });
        }
        
        // Optimistic UI update
        const msg: Message = {
          id: `msg_${Date.now()}`,
          chatId: otherUserId,
          senderId: user.id,
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#09090b]">
      {/* Header */}
      {/* ... (rest of the header remains) ... */}
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
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-2.5 shadow-sm ${
                isMe ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" : "bg-white dark:bg-[#27272a] rounded-2xl rounded-tl-sm border border-border"
              }`}>
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
      <div className="p-4 bg-white dark:bg-[#09090b] border-t border-border">
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-[#27272a] rounded-full px-4 py-2">
          <button className="text-gray-500 hover:text-primary transition-colors"><Smile className="w-6 h-6" /></button>
          
          {/* File Upload Logic */}
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
