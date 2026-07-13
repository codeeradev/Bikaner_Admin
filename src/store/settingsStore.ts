import { create } from "zustand";

interface SettingsState {
  siteTitle: string;
  siteLogo: string;
  setBrandSettings: (settings: {
    siteTitle?: string;
    siteLogo?: string;
  }) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  siteTitle: "Bikaner Biscuit",
  siteLogo: "",
  setBrandSettings: (settings) =>
    set((state) => ({
      siteTitle: settings.siteTitle ?? state.siteTitle,
      siteLogo: settings.siteLogo ?? state.siteLogo,
    })),
}));
