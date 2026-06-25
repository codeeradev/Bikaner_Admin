import { Check } from "lucide-react";

import type { ThemeColors } from "@/store/themeStore";

export interface PresetTheme {
  name: string;
  description: string;
  light: ThemeColors;
  dark: ThemeColors;
}

interface PresetCardProps {
  preset: PresetTheme;
  isActive: boolean;
  onClick: () => void;
  dataOcid: string;
}

function getColorPreview(colors: ThemeColors): string[] {
  return [
    colors.primary,
    colors.secondary,
    colors.accent,
    colors.sidebar,
    colors.card,
    colors.foreground,
  ];
}

export function PresetCard({
  preset,
  isActive,
  onClick,
  dataOcid,
}: PresetCardProps) {
  const previewColors = getColorPreview(preset.light);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col gap-3 rounded-xl border p-4 transition-all text-left hover:shadow-md hover:-translate-y-0.5 ${
        isActive
          ? "border-primary bg-primary/5 ring-2 ring-primary shadow-md"
          : "border-border bg-card hover:bg-muted/30"
      }`}
      data-ocid={dataOcid}
    >
      {isActive && (
        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}

      {/* Color Strip */}
      <div className="flex gap-1">
        {previewColors.map((color, _i) => (
          <div
            key={`strip-${color}`}
            className="h-8 flex-1 rounded-md border border-border/40 first:rounded-l-lg last:rounded-r-lg"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <div className="text-sm font-semibold text-card-foreground">
          {preset.name}
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed">
          {preset.description}
        </div>
      </div>

      {/* Mini Color Dots */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {previewColors.slice(0, 4).map((color, _i) => (
          <div
            key={`dot-${color}`}
            className="h-4 w-4 rounded-full border border-border/50"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
        {previewColors.length > 4 && (
          <span className="text-[10px] text-muted-foreground font-medium">
            +{previewColors.length - 4}
          </span>
        )}
      </div>
    </button>
  );
}
