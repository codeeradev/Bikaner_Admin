import { useEffect, useRef, useState } from "react";
import { franchiseService } from "@/api/services/franchiseService";
import { Button } from "@/components/ui/button";

/** Fetch on demand; never persist credentials in the global store or query cache. */
export function FranchisePassword({ franchiseId }: { franchiseId: string }) {
  const [password, setPassword] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const generation = useRef(0);
  useEffect(() => {
    const hide = () => { generation.current++; setPassword(null); setLoading(false); };
    window.addEventListener("blur", hide);
    return () => { generation.current++; window.removeEventListener("blur", hide); };
  }, []);
  useEffect(() => {
    if (!password) return;
    const timer = window.setTimeout(() => setPassword(null), 30000);
    return () => window.clearTimeout(timer);
  }, [password]);
  async function reveal() {
    const request = ++generation.current;
    setLoading(true);
    setMessage("");
    try {
      const response = await franchiseService.revealPassword(franchiseId);
      if (request !== generation.current) return;
      setPassword(response.data.password);
      if (!response.data.password) setMessage("Available after the next password login.");
    } catch (error) {
      if (request === generation.current) setMessage(error instanceof Error ? error.message : "Unable to show password");
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }
  return <div className="max-w-56 space-y-1">
    {password && <code className="block break-all select-all">{password}</code>}
    <Button variant="outline" size="sm" disabled={loading} onClick={() => password ? setPassword(null) : void reveal()}>
      {loading ? "Loading…" : password ? "Hide password" : "Show password"}
    </Button>
    {message && <p role="status" className="text-xs text-muted-foreground">{message}</p>}
  </div>;
}
