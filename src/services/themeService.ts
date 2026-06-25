import type { ThemeColors, ThemePreset } from "@/store/themeStore";

export interface ThemeApiResponse {
  primaryColor: string;
  secondaryColor: string;
  sidebarBg: string;
  navbarBg: string;
  cardBg: string;
  buttonColor: string;
  textColor: string;
  darkMode: string;
  logoUrl?: string;
  faviconUrl?: string;
  loginLogoUrl?: string;
}

const mockApiDelay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function lighten(hex: string, percent: number): string {
  const num = Number.parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function _darken(hex: string, percent: number): string {
  const num = Number.parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function makePreset(
  name: string,
  description: string,
  primary: string,
  secondary: string,
  accent: string,
  destructive: string,
): ThemePreset {
  // Derive neutral surfaces from primary warmth so presets feel cohesive
  const isWarm =
    primary === "#D4A017" || primary === "#a855f7" || primary === "#6366f1";
  const lightBg = isWarm ? "#fdf8f0" : "#f8fafc";
  const lightSidebar = isWarm ? "#faf5eb" : "#f8fafc";
  const darkBg = isWarm ? "#1a1410" : "#0f172a";
  const darkSidebar = isWarm ? "#1a1410" : "#0f172a";

  const light: ThemeColors = {
    primary,
    secondary,
    background: lightBg,
    foreground: "#0f172a",
    card: "#ffffff",
    cardForeground: "#0f172a",
    popover: "#ffffff",
    popoverForeground: "#0f172a",
    muted: isWarm ? "#f5efe6" : "#f1f5f9",
    mutedForeground: "#64748b",
    accent,
    accentForeground: "#0f172a",
    destructive,
    destructiveForeground: "#ffffff",
    border: isWarm ? "#e8dfd1" : "#e2e8f0",
    input: isWarm ? "#e8dfd1" : "#e2e8f0",
    ring: primary,
    sidebar: lightSidebar,
    sidebarForeground: "#0f172a",
    sidebarPrimary: primary,
    sidebarPrimaryForeground: "#ffffff",
    sidebarAccent: isWarm ? "#f5efe6" : "#f1f5f9",
    sidebarAccentForeground: "#0f172a",
    sidebarBorder: isWarm ? "#e8dfd1" : "#e2e8f0",
    sidebarRing: primary,
    success: "#10b981",
    warning: "#f59e0b",
    chart1: primary,
    chart2: secondary,
    chart3: accent,
    chart4: "#ec4899",
    chart5: "#f97316",
  };
  const dark: ThemeColors = {
    primary: lighten(primary, 15),
    secondary: lighten(secondary, 15),
    background: darkBg,
    foreground: "#f1f5f9",
    card: isWarm ? "#2a2018" : "#1e293b",
    cardForeground: "#f1f5f9",
    popover: isWarm ? "#2a2018" : "#1e293b",
    popoverForeground: "#f1f5f9",
    muted: isWarm ? "#3a3028" : "#334155",
    mutedForeground: "#94a3b8",
    accent: lighten(accent, 10),
    accentForeground: "#0f172a",
    destructive: lighten(destructive, 15),
    destructiveForeground: "#ffffff",
    border: isWarm ? "#3a3028" : "#334155",
    input: isWarm ? "#3a3028" : "#334155",
    ring: lighten(primary, 15),
    sidebar: darkSidebar,
    sidebarForeground: "#f1f5f9",
    sidebarPrimary: lighten(primary, 15),
    sidebarPrimaryForeground: "#0f172a",
    sidebarAccent: isWarm ? "#3a3028" : "#334155",
    sidebarAccentForeground: "#f1f5f9",
    sidebarBorder: isWarm ? "#3a3028" : "#334155",
    sidebarRing: lighten(primary, 15),
    success: "#34d399",
    warning: "#fbbf24",
    chart1: lighten(primary, 15),
    chart2: lighten(secondary, 15),
    chart3: lighten(accent, 10),
    chart4: "#f472b6",
    chart5: "#fb923c",
  };
  return { name, description, light, dark };
}

export const themePresets: ThemePreset[] = [
  makePreset(
    "Corporate Blue",
    "Professional blue theme for businesses",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
  ),
  makePreset(
    "Modern Indigo",
    "Creative purple with cyan accents",
    "#6366f1",
    "#06b6d4",
    "#f59e0b",
    "#ef4444",
  ),
  makePreset(
    "Emerald Green",
    "Fresh green with warm highlights",
    "#10b981",
    "#f59e0b",
    "#3b82f6",
    "#ef4444",
  ),
  makePreset(
    "Minimal Gray",
    "Clean and neutral gray palette",
    "#64748b",
    "#94a3b8",
    "#cbd5e1",
    "#ef4444",
  ),
  makePreset(
    "Dark Professional",
    "Sleek dark theme with indigo tones",
    "#6366f1",
    "#ec4899",
    "#f59e0b",
    "#ef4444",
  ),
  makePreset(
    "Purple Neon",
    "Vibrant purple with neon accents",
    "#a855f7",
    "#22d3ee",
    "#fbbf24",
    "#f43f5e",
  ),
  makePreset(
    "Bikaner Biscuit",
    "Warm gold and brown palette inspired by Indian biscuit brands",
    "#D4A017",
    "#8B4513",
    "#F5DEB3",
    "#DC2626",
  ),
  makePreset(
    "Royal Amber",
    "Rich amber with deep brown for a premium biscuit house feel",
    "#C68E17",
    "#6B3A1F",
    "#E8C97A",
    "#B91C1C",
  ),
];

export const themeService = {
  async getTheme(): Promise<ThemeApiResponse> {
    await mockApiDelay(800);
    return {
      primaryColor: "#3b82f6",
      secondaryColor: "#10b981",
      sidebarBg: "#f8fafc",
      navbarBg: "#f8fafc",
      cardBg: "#ffffff",
      buttonColor: "#3b82f6",
      textColor: "#0f172a",
      darkMode: "false",
    };
  },

  async saveTheme(
    _theme: Partial<ThemeApiResponse>,
  ): Promise<{ success: boolean }> {
    await mockApiDelay(1200);
    return { success: true };
  },
};
