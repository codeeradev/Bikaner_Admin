import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface ColorUsage {
  label: string;
  items: string[];
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  tooltip: string;
  dataOcid: string;
  usage?: ColorUsage;
  colorName?: string;
}

export function ColorPicker({
  label,
  value,
  onChange,
  tooltip,
  dataOcid,
  usage,
  colorName,
}: ColorPickerProps) {
  return (
    <div className="flex items-start gap-3 group p-3 rounded-lg border border-transparent hover:border-border/50 hover:bg-muted/20 transition-all">
      <div className="relative shrink-0 mt-0.5">
        <div
          className="h-10 w-10 rounded-full border-2 border-border shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md"
          style={{ backgroundColor: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          data-ocid={dataOcid}
          aria-label={`${label} color picker`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Label className="text-sm font-semibold">{label}</Label>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Info about ${label}`}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px]">
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-24 h-7 rounded-md border border-input bg-background px-2 text-xs font-mono uppercase"
            data-ocid={`${dataOcid}_text`}
          />
          {colorName && (
            <span className="text-xs text-muted-foreground font-medium">
              {colorName}
            </span>
          )}
        </div>
        {usage && (
          <div className="mt-2 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {usage.label}
            </span>
            <div className="flex flex-wrap gap-1">
              {usage.items.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
