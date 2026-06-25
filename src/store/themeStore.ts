import { hexToOklch } from "@/lib/utils";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  success: string;
  warning: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

export interface ThemePreset {
  name: string;
  description: string;
  light: ThemeColors;
  dark: ThemeColors;
}

const defaultLightColors: ThemeColors = {
  primary: "#3b82f6",
  secondary: "#06b6d4",
  background: "#f8fafc",
  foreground: "#0f172a",
  card: "#ffffff",
  cardForeground: "#0f172a",
  popover: "#ffffff",
  popoverForeground: "#0f172a",
  muted: "#f1f5f9",
  mutedForeground: "#64748b",
  accent: "#f59e0b",
  accentForeground: "#0f172a",
  destructive: "#ef4444",
  destructiveForeground: "#ffffff",
  border: "#e2e8f0",
  input: "#e2e8f0",
  ring: "#3b82f6",
  sidebar: "#f8fafc",
  sidebarForeground: "#0f172a",
  sidebarPrimary: "#3b82f6",
  sidebarPrimaryForeground: "#ffffff",
  sidebarAccent: "#f1f5f9",
  sidebarAccentForeground: "#0f172a",
  sidebarBorder: "#e2e8f0",
  sidebarRing: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  chart1: "#3b82f6",
  chart2: "#06b6d4",
  chart3: "#f59e0b",
  chart4: "#ec4899",
  chart5: "#f97316",
};

const defaultDarkColors: ThemeColors = {
  primary: "#60a5fa",
  secondary: "#22d3ee",
  background: "#0f172a",
  foreground: "#f1f5f9",
  card: "#1e293b",
  cardForeground: "#f1f5f9",
  popover: "#1e293b",
  popoverForeground: "#f1f5f9",
  muted: "#334155",
  mutedForeground: "#94a3b8",
  accent: "#fbbf24",
  accentForeground: "#0f172a",
  destructive: "#f87171",
  destructiveForeground: "#ffffff",
  border: "#334155",
  input: "#334155",
  ring: "#60a5fa",
  sidebar: "#0f172a",
  sidebarForeground: "#f1f5f9",
  sidebarPrimary: "#60a5fa",
  sidebarPrimaryForeground: "#0f172a",
  sidebarAccent: "#334155",
  sidebarAccentForeground: "#f1f5f9",
  sidebarBorder: "#334155",
  sidebarRing: "#60a5fa",
  success: "#34d399",
  warning: "#fbbf24",
  chart1: "#60a5fa",
  chart2: "#22d3ee",
  chart3: "#fbbf24",
  chart4: "#f472b6",
  chart5: "#fb923c",
};

export interface ThemeState {
  darkMode: boolean;
  lightColors: ThemeColors;
  darkColors: ThemeColors;
  apiTheme: Record<string, string> | null;
  history: { light: ThemeColors; dark: ThemeColors }[];
  historyIndex: number;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  setLightColor: (key: keyof ThemeColors, color: string) => void;
  setDarkColor: (key: keyof ThemeColors, color: string) => void;
  applyTheme: () => void;
  loadApiTheme: (theme: Record<string, string>) => void;
  resetToDefaults: () => void;
  getCurrentColors: () => ThemeColors;
  applyPreset: (preset: ThemePreset) => void;
  undo: () => void;
  canUndo: () => boolean;
  exportTheme: () => string;
  importTheme: (json: string) => boolean;
}

// Calculate relative luminance of a hex color to determine best contrast (black or white)
function getContrastColor(hex: string): string {
  const clean = hex.replace("#", "");
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  // Relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

function applyColorSet(root: HTMLElement, colors: ThemeColors) {
  const set = (name: string, hex: string) => {
    const oklch = hexToOklch(hex);
    if (oklch) root.style.setProperty(name, oklch);
  };

  set("--primary", colors.primary);
  set("--primary-foreground", getContrastColor(colors.primary));
  set("--secondary", colors.secondary);
  set("--secondary-foreground", getContrastColor(colors.secondary));
  set("--background", colors.background);
  set("--foreground", colors.foreground);
  set("--card", colors.card);
  set("--card-foreground", colors.cardForeground);
  set("--popover", colors.popover);
  set("--popover-foreground", colors.popoverForeground);
  set("--muted", colors.muted);
  set("--muted-foreground", colors.mutedForeground);
  set("--accent", colors.accent);
  set("--accent-foreground", colors.accentForeground);
  set("--destructive", colors.destructive);
  set("--destructive-foreground", colors.destructiveForeground);
  set("--border", colors.border);
  set("--input", colors.input);
  set("--ring", colors.ring);
  set("--sidebar", colors.sidebar);
  set("--sidebar-foreground", colors.sidebarForeground);
  set("--sidebar-primary", colors.sidebarPrimary);
  set("--sidebar-primary-foreground", colors.sidebarPrimaryForeground);
  set("--sidebar-accent", colors.sidebarAccent);
  set("--sidebar-accent-foreground", colors.sidebarAccentForeground);
  set("--sidebar-border", colors.sidebarBorder);
  set("--sidebar-ring", colors.sidebarRing);
  set("--success", colors.success);
  set("--success-foreground", getContrastColor(colors.success));
  set("--warning", colors.warning);
  set("--warning-foreground", getContrastColor(colors.warning));
  set("--chart-1", colors.chart1);
  set("--chart-2", colors.chart2);
  set("--chart-3", colors.chart3);
  set("--chart-4", colors.chart4);
  set("--chart-5", colors.chart5);
}

function pushHistory(
  get: () => ThemeState,
  set: (fn: (state: ThemeState) => Partial<ThemeState>) => void,
) {
  const state = get();
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push({
    light: { ...state.lightColors },
    dark: { ...state.darkColors },
  });
  if (newHistory.length > 20) newHistory.shift();
  set(() => ({
    history: newHistory,
    historyIndex: Math.min(newHistory.length - 1, 19),
  }));
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      lightColors: { ...defaultLightColors },
      darkColors: { ...defaultDarkColors },
      apiTheme: null,
      history: [],
      historyIndex: -1,

      toggleDarkMode: () => {
        const newValue = !get().darkMode;
        set({ darkMode: newValue });
        get().applyTheme();
      },

      setDarkMode: (value: boolean) => {
        set({ darkMode: value });
        get().applyTheme();
      },

      setLightColor: (key: keyof ThemeColors, color: string) => {
        pushHistory(get, set);
        set((state) => ({
          lightColors: { ...state.lightColors, [key]: color },
        }));
        if (!get().darkMode) get().applyTheme();
      },

      setDarkColor: (key: keyof ThemeColors, color: string) => {
        pushHistory(get, set);
        set((state) => ({
          darkColors: { ...state.darkColors, [key]: color },
        }));
        if (get().darkMode) get().applyTheme();
      },

      applyTheme: () => {
        const state = get();
        const root = document.documentElement;

        if (state.darkMode) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }

        const colors = state.darkMode ? state.darkColors : state.lightColors;
        applyColorSet(root, colors);
      },

      loadApiTheme: (theme: Record<string, string>) => {
        set({ apiTheme: theme });
        const light: Partial<ThemeColors> = {};
        const dark: Partial<ThemeColors> = {};

        const mapKey = (k: string): keyof ThemeColors | null => {
          const mappings: Record<string, keyof ThemeColors> = {
            primaryColor: "primary",
            secondaryColor: "secondary",
            sidebarBg: "sidebar",
            navbarBg: "background",
            cardBg: "card",
            buttonColor: "primary",
            textColor: "foreground",
          };
          return mappings[k] || null;
        };

        for (const [key, value] of Object.entries(theme)) {
          const mapped = mapKey(key);
          if (mapped) {
            light[mapped] = value;
            dark[mapped] = value;
          }
        }

        set((state) => ({
          lightColors: { ...state.lightColors, ...light },
          darkColors: { ...state.darkColors, ...dark },
        }));

        if (theme.darkMode !== undefined) {
          set({ darkMode: theme.darkMode === "true" });
        }
        get().applyTheme();
      },

      resetToDefaults: () => {
        pushHistory(get, set);
        set({
          lightColors: { ...defaultLightColors },
          darkColors: { ...defaultDarkColors },
        });
        get().applyTheme();
      },

      getCurrentColors: () => {
        const state = get();
        return state.darkMode ? state.darkColors : state.lightColors;
      },

      applyPreset: (preset: ThemePreset) => {
        pushHistory(get, set);
        set((state) => ({
          lightColors: { ...state.lightColors, ...preset.light },
          darkColors: { ...state.darkColors, ...preset.dark },
        }));
        get().applyTheme();
      },

      undo: () => {
        const state = get();
        if (state.historyIndex >= 0) {
          const entry = state.history[state.historyIndex];
          set((s) => ({
            lightColors: { ...entry.light },
            darkColors: { ...entry.dark },
            historyIndex: s.historyIndex - 1,
          }));
          get().applyTheme();
        }
      },

      canUndo: () => {
        return get().historyIndex >= 0;
      },

      exportTheme: () => {
        const state = get();
        return JSON.stringify(
          {
            version: 1,
            darkMode: state.darkMode,
            light: state.lightColors,
            dark: state.darkColors,
          },
          null,
          2,
        );
      },

      importTheme: (json: string) => {
        try {
          const data = JSON.parse(json);
          if (!data.light || !data.dark) return false;
          pushHistory(get, set);
          set((state) => ({
            lightColors: { ...state.lightColors, ...data.light },
            darkColors: { ...state.darkColors, ...data.dark },
            darkMode:
              data.darkMode !== undefined
                ? Boolean(data.darkMode)
                : state.darkMode,
          }));
          get().applyTheme();
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme immediately after rehydration from localStorage
          setTimeout(() => {
            const store = useThemeStore.getState();
            store.applyTheme();
          }, 0);
        }
      },
    },
  ),
);
