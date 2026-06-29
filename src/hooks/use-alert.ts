import { create } from "zustand";

export type AlertType = "success" | "error" | "loading" | "info" | "warning";

interface Alert {
  id: string;
  type: AlertType;
  message: string;
  duration?: number;
}

interface AlertState {
  alerts: Alert[];
  setAlert: (type: AlertType, message: string, duration?: number) => string;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],

  setAlert: (type, message, duration = 5000) => {
    const id = `${Date.now()}-${Math.random()}`;
    const alert: Alert = { id, type, message, duration };

    set((state) => ({
      alerts: [...state.alerts, alert],
    }));

    // Auto-remove after duration (except for loading type)
    if (type !== "loading" && duration > 0) {
      setTimeout(() => {
        get().removeAlert(id);
      }, duration);
    }

    return id;
  },

  removeAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    }));
  },

  clearAlerts: () => {
    set({ alerts: [] });
  },
}));

// Custom hook for easy access
import { useMemo } from "react";

export const useAlert = () => {
  const { setAlert, removeAlert, clearAlerts } = useAlertStore();

  return useMemo(
    () => ({
      setAlert,
      removeAlert,
      clearAlerts,

      success: (message: string, duration?: number) =>
        setAlert("success", message, duration),

      error: (message: string, duration?: number) =>
        setAlert("error", message, duration),

      loading: (message: string) => setAlert("loading", message, 0),

      info: (message: string, duration?: number) =>
        setAlert("info", message, duration),

      warning: (message: string, duration?: number) =>
        setAlert("warning", message, duration),
    }),
    [setAlert, removeAlert, clearAlerts],
  );
};
