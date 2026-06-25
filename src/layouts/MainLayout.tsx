import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store";
import { Outlet } from "@tanstack/react-router";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function MainLayout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-300",
          "lg:ml-16",
          !sidebarCollapsed && "lg:ml-64",
        )}
      >
        <Header />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <ConfirmDialog />
      <Toaster position="top-right" richColors />
    </div>
  );
}
