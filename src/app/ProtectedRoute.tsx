import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore, useThemeStore } from "@/store";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, isRehydrating } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isRehydrating && !isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, isRehydrating, navigate]);

  // Ensure theme is applied when entering protected routes
  useEffect(() => {
    if (isAuthenticated) {
      const { applyTheme } = useThemeStore.getState();
      applyTheme();
    }
  }, [isAuthenticated]);

  if (isRehydrating || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 w-96">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Outlet />;
}
