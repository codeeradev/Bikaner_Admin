import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAlertStore } from "@/hooks/use-alert";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  X,
  XCircle,
} from "lucide-react";

export function AlertContainer() {
  const { alerts, removeAlert } = useAlertStore();

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4" />;
      case "error":
        return <XCircle className="h-4 w-4" />;
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getVariant = (type: string): "default" | "destructive" => {
    return type === "error" ? "destructive" : "default";
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={getVariant(alert.type)}
          className="relative animate-in slide-in-from-top-5 duration-300"
        >
          {getIcon(alert.type)}
          <AlertDescription className="flex items-center justify-between gap-2">
            <span className="flex-1">{alert.message}</span>
            {alert.type !== "loading" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeAlert(alert.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
