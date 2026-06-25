import { RouterProvider } from "@tanstack/react-router";
import { useEffect } from "react";
import { router } from "./app/router";
import { useThemeStore } from "./store";

export default function App() {
  useEffect(() => {
    // Ensure theme is applied on initial mount
    // This runs before router renders, so CSS variables are set before any component paints
    const unsubscribe = useThemeStore.persist.onFinishHydration(() => {
      const { applyTheme } = useThemeStore.getState();
      applyTheme();
    });

    // Also apply immediately in case hydration already finished
    const { applyTheme } = useThemeStore.getState();
    applyTheme();

    return () => {
      unsubscribe();
    };
  }, []);

  return <RouterProvider router={router} />;
}
