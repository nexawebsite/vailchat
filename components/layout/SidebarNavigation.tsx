"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Phone, Settings, UserCircle } from "lucide-react";
import { currentUser } from "@/lib/mockData";

export default function SidebarNavigation() {
  const pathname = usePathname();

  const navItems = [
    { icon: MessageSquare, label: "Chats", path: "/chat" },
    { icon: Phone, label: "Calls", path: "/calls" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="w-20 bg-background border-r border-border h-screen flex flex-col items-center py-6 gap-8 z-10 shrink-0">
      <div className="text-primary font-bold text-2xl tracking-tighter">VN</div>
      
      <div className="flex-1 flex flex-col gap-6 w-full items-center">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`p-3 rounded-2xl transition-all duration-300 group relative ${
                isActive ? "bg-primary text-primary-foreground shadow-md" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-[#27272a]"
              }`}
              title={item.label}
            >
              <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto cursor-pointer hover:opacity-80 transition-opacity">
        <Link href="/settings" className="block relative">
          <img
            src={currentUser.avatarUrl}
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-border object-cover"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
        </Link>
      </div>
    </nav>
  );
}
