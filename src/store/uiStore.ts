import type { DialogState } from "@/types";
import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  mobileDrawerOpen: boolean;
  dialog: DialogState;
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    variant?: "default" | "success" | "error" | "warning";
  }>;
  isLoading: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setMobileDrawerOpen: (open: boolean) => void;
  showDialog: (dialog: Omit<DialogState, "isOpen">) => void;
  hideDialog: () => void;
  addToast: (toast: Omit<UIState["toasts"][0], "id">) => void;
  removeToast: (id: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  mobileDrawerOpen: false,
  dialog: {
    isOpen: false,
    title: "",
    description: "",
    onConfirm: null,
  },
  toasts: [],
  isLoading: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebarCollapsed: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),

  showDialog: (dialog) =>
    set({
      dialog: { ...dialog, isOpen: true },
    }),

  hideDialog: () =>
    set({
      dialog: { isOpen: false, title: "", description: "", onConfirm: null },
    }),

  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: `toast-${Date.now()}` }],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  setIsLoading: (loading) => set({ isLoading: loading }),
}));
