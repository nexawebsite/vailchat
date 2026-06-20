import SidebarNavigation from "@/components/layout/SidebarNavigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <SidebarNavigation />
      <main className="flex-1 flex overflow-hidden">
        {children}
      </main>
    </div>
  );
}
