import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuthStore, useThemeStore } from "@/store";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

// Map routes to required permissions
const ROUTE_PERMISSIONS: Record<string, string> = {
  "/dashboard": "dashboard:view",
  "/categories": "categories:view",
  "/products": "products:view",
  "/cities": "cities:view",
  "/zones": "zones:view",
  "/orders": "orders:view",
  "/orders/normal": "normalOrders:view",
  "/orders/bulk": "bulkOrders:view",
  "/approvals/sellers": "sellerApprovals:view",
  "/franchise": "franchise:view",
  "/franchise/registered": "registeredFranchises:view",
  "/franchise/requests": "franchiseRequests:view",
  "/users": "users:view",
  "/roles": "roles:view",
  "/wallet": "wallet:view",
  "/theme": "theme:view",
  "/profile": "profile:view",
  "/settings": "settings:view",
};

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, isRehydrating } = useAuthStore();
  const { can, isAdmin } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isRehydrating && !isLoading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, isRehydrating, navigate]);

  // Check permissions after authentication is confirmed
  useEffect(() => {
    if (isAuthenticated && !isRehydrating && !isLoading) {
      const currentPath = location.pathname;
      const requiredPermission = ROUTE_PERMISSIONS[currentPath];

      // If route requires permission and user doesn't have it (and is not admin)
      if (requiredPermission && !isAdmin && !can(requiredPermission)) {
        navigate({ to: "/unauthorized" });
      }
    }
  }, [
    isAuthenticated,
    isRehydrating,
    isLoading,
    location.pathname,
    can,
    isAdmin,
    navigate,
  ]);

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
