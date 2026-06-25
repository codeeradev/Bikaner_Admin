import { currentUser } from "@/mock-data/users";
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
    email: string,
    password: string,
    rememberMe: boolean,
  ) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isRehydrating: true,
      rememberMe: false,

      login: async (email: string, password: string, rememberMe: boolean) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (email === "admin@franchise.com" && password === "password") {
          set({
            user: currentUser,
            isAuthenticated: true,
            rememberMe,
            isLoading: false,
          });
          return true;
        }

        set({ isLoading: false });
        return false;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          rememberMe: false,
          isRehydrating: false,
        });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
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
