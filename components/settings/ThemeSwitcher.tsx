"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#09090b] border border-border p-6 rounded-2xl">
      <h3 className="text-lg font-bold mb-4">Muonekano (Theme)</h3>
      <p className="text-sm text-gray-500 mb-6">Chagua muonekano unaoupenda kwa Vailnet.</p>
      
      <div className="flex gap-4">
        <button
          onClick={() => setTheme("light")}
          className={`flex-1 flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
            theme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-gray-300"
          }`}
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4">
            <Sun className="text-yellow-500 w-6 h-6" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">White & Blue</span>
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`flex-1 flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
            theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-gray-700"
          }`}
        >
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-md mb-4 border border-gray-800">
            <Moon className="text-blue-400 w-6 h-6" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">Dark Mode</span>
        </button>
      </div>
    </div>
  );
}
