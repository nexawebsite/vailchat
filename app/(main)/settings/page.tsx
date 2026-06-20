import ThemeSwitcher from "@/components/settings/ThemeSwitcher";
import { currentUser } from "@/lib/mockData";
import { Shield, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex-1 bg-[#f4f4f5] dark:bg-[#000000] overflow-y-auto p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
          <p className="text-gray-500">Manage your Vailnet account and preferences.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-[#09090b] border border-border p-6 rounded-2xl flex items-center gap-6">
          <img src={currentUser.avatarUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-background shadow-sm" />
          <div>
            <h2 className="text-xl font-bold">{currentUser.username}</h2>
            <p className="text-gray-500">{currentUser.phoneNumber}</p>
          </div>
          <button className="ml-auto px-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors">
            Edit Profile
          </button>
        </div>

        <ThemeSwitcher />

        {/* Other settings stubs */}
        <div className="bg-white dark:bg-[#09090b] border border-border rounded-2xl overflow-hidden">
          <button className="w-full flex items-center gap-4 p-4 border-b border-border hover:bg-gray-50 dark:hover:bg-[#27272a] transition-colors">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Notifications</span>
          </button>
          <button className="w-full flex items-center gap-4 p-4 border-b border-border hover:bg-gray-50 dark:hover:bg-[#27272a] transition-colors">
            <Shield className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Privacy & Security</span>
          </button>
          <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#27272a] transition-colors text-red-500">
            <span className="font-medium ml-9">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
