import { useEffect, useRef } from "react";

/** Keep independently opened admin views current with franchise-side writes. */
export function useLiveRefresh(refresh: () => Promise<void>, intervalMs = 15000) {
  const latest = useRef(refresh);
  useEffect(() => { latest.current = refresh; }, [refresh]);
  useEffect(() => {
    let busy = false;
    const run = async () => {
      if (document.hidden || busy) return;
      busy = true;
      try { await latest.current(); } finally { busy = false; }
    };
    const timer = window.setInterval(run, intervalMs);
    window.addEventListener("focus", run);
    document.addEventListener("visibilitychange", run);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", run);
      document.removeEventListener("visibilitychange", run);
    };
  }, [intervalMs]);
}
