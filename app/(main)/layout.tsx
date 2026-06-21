"use client";

import SidebarNavigation from "@/components/layout/SidebarNavigation";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Kama mtu hajajisajili, mpeleke kwenye ukurasa wa login
    if (!localStorage.getItem('vailnet_token')) {
      router.push("/login");
    }
  }, [router]);

  // Usionyeshe UI ya ndani kama mtu hayupo au bado inatafuta session
  if (!mounted || (!user && !localStorage.getItem('vailnet_token'))) {
    return <div className="flex items-center justify-center h-screen bg-background text-foreground">Inafungua mfumo...</div>;
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SidebarNavigation />
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
}
