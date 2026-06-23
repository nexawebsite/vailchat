"use client";

import { useAuth } from "@/lib/AuthContext";
import { Moon, Sun, Bell, Shield, LogOut, Image as ImageIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "@/components/settings/ThemeSwitcher";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'wallpaper') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('media', file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      // Step 1: Upload to Cloudinary
      const uploadRes = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      
      if (uploadRes.ok && uploadData.url) {
        // Step 2: Save to User profile
        const updatePayload = {
          userId: user.id,
          [type]: uploadData.url
        };
        
        const settingsRes = await fetch(`${apiUrl}/api/users/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload)
        });
        
        if (settingsRes.ok) {
          updateUser({ [type]: uploadData.url });
          alert(`Imefanikiwa! ${type === 'avatar' ? 'Picha ya Profile' : 'Background'} imebadilishwa.`);
        }
      }
    } catch (error) {
      console.error(error);
      alert('Hitilafu imetokea.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !user) return null;

  return (
    <div className="flex-1 bg-[#f4f4f5] dark:bg-[#000000] overflow-y-auto p-8 relative">
      {/* Show wallpaper preview if exists */}
      {user.wallpaper && (
        <div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: `url(${user.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}
      
      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
          <p className="text-gray-500">Manage your Vailnet account and preferences.</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-[#09090b] rounded-2xl p-6 border border-border flex items-center gap-6 mb-8">
          <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
            <img 
              src={user.avatar || "https://i.pravatar.cc/150"} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <input 
              type="file" 
              id="avatar-upload" 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, 'avatar')} 
              disabled={loading}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">{user.username}</h2>
            <p className="text-muted-foreground mb-4">{user.phoneNumber}</p>
            <label className="text-sm bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/20 transition-colors cursor-pointer">
              Badili Picha
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleImageUpload(e, 'avatar')} 
                disabled={loading}
              />
            </label>
          </div>
        </div>   

        {/* Wallpaper Settings */}
        <div className="bg-white dark:bg-[#09090b] rounded-2xl p-6 border border-border flex items-center justify-between mb-8">
          <div>
            <h3 className="font-bold text-lg mb-1">Chat Background</h3>
            <p className="text-sm text-gray-500">Badili picha ya nyuma (Wallpaper) kwa chats zote.</p>
          </div>
          <label className="text-sm bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors cursor-pointer">
            Chagua Picha
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleImageUpload(e, 'wallpaper')} 
              disabled={loading}
            />
          </label>
        </div>

        <ThemeSwitcher />

        {/* Other settings stubs */}
        <div className="bg-white dark:bg-[#09090b] border border-border rounded-2xl overflow-hidden">
          <button 
            onClick={() => alert("Sehemu ya Notifications inakuja hivi karibuni!")}
            className="w-full flex items-center gap-4 p-4 border-b border-border hover:bg-gray-50 dark:hover:bg-[#27272a] transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Notifications</span>
          </button>
          <button 
            onClick={() => alert("Sehemu ya Privacy & Security inakuja hivi karibuni!")}
            className="w-full flex items-center gap-4 p-4 border-b border-border hover:bg-gray-50 dark:hover:bg-[#27272a] transition-colors"
          >
            <Shield className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Privacy & Security</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#27272a] transition-colors text-red-500"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
