import { authService } from "@/api/services/authService";
import type { User } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRehydrating: boolean;
  rememberMe: boolean;
  login: (
    mobile: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isRehydrating: true,
      rememberMe: false,

      login: async (mobile: string, password: string, rememberMe: boolean) => {
        console.log("🔑 AuthStore: Starting login...", { mobile });
        set({ isLoading: true });
        
        try {
          console.log("📡 AuthStore: Calling authService.login...");
          const response = await authService.login({ mobile, password });
          console.log("📥 AuthStore: Received response:", { success: response.success, hasUser: !!response.user });
          
          if (response.success && response.user) {
            // Transform backend user to frontend User type
            const user: User = {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email || '',
              phone: response.user.mobile,
              avatar: response.user.profileImage || '',
              role: response.user.role,
              roleId: response.user.roleId,
              permissions: response.user.permissions || [],
              status: response.user.status as "active" | "inactive",
              createdAt: new Date().toISOString(),
            };

            console.log("✨ AuthStore: User transformed, setting state...", { role: user.role, permissionCount: user.permissions.length });
            
            set({
              user,
              isAuthenticated: true,
              rememberMe,
              isLoading: false,
            });

            console.log("✅ AuthStore: Login successful!");
            return { success: true };
          }

          console.warn("⚠️ AuthStore: Login failed - no user in response");
          set({ isLoading: false });
          return { success: false, error: response.message || "Login failed" };
        } catch (error: any) {
          console.error("💥 AuthStore: Login error:", error);
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.message || "An error occurred during login" 
          };
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            rememberMe: false,
            isRehydrating: false,
          });
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'Admin') return true; // Admin has all permissions
        return user.permissions.includes(permission);
      },

      hasAnyPermission: (permissions: string[]) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'Admin') return true;
        return permissions.some(p => user.permissions.includes(p));
      },

      hasAllPermissions: (permissions: string[]) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'Admin') return true;
        return permissions.every(p => user.permissions.includes(p));
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'Admin';
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isRehydrating = false;
        }
      },
    },
  ),
);
