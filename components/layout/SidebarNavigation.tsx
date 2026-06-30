"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Phone, Settings } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function SidebarNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { icon: MessageSquare, label: "Chats", path: "/chat" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="w-full h-16 border-t md:w-20 md:border-r md:border-t-0 bg-background border-border md:h-screen flex flex-row md:flex-col items-center justify-around md:justify-start md:py-6 md:gap-8 z-10 shrink-0">
      <div className="hidden md:block text-primary font-bold text-2xl tracking-tighter">VN</div>
      
      <div className="flex flex-row md:flex-col gap-8 md:gap-6 md:w-full items-center justify-center md:justify-start flex-1">
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
                <>
                  <span className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full" />
                  <span className="md:hidden absolute -bottom-[14px] left-1/2 -translate-x-1/2 w-8 h-1.5 bg-primary rounded-t-full" />
                </>
              )}
            </Link>
          );
        })}
      </div>

      <div className="md:mt-auto cursor-pointer hover:opacity-80 transition-opacity pr-4 md:pr-0">
        <Link href="/settings" className="block relative">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || user?.phoneNumber || "User")}&background=10b981&color=fff`}
            alt="Profile"
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-border object-cover"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
        </Link>
      </div>
    </nav>
  );
}
