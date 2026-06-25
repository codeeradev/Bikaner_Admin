import { ColorPicker } from "@/components/theme/ColorPicker";
import {
  AccessibilityScore,
  ContrastWarning,
} from "@/components/theme/ContrastWarning";
import { PresetCard } from "@/components/theme/PresetCard";
import { ThemePreview } from "@/components/theme/ThemePreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { themePresets, themeService } from "@/services/themeService";
import { useThemeStore, useUIStore } from "@/store";
import type { ThemeColors } from "@/store/themeStore";
import {
  Check,
  Download,
  Eye,
  ImageIcon,
  Loader2,
  Moon,
  Palette,
  RefreshCcw,
  Sun,
  Undo2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function UploadArea({
  label,
  icon: Icon,
}: { label: string; icon: typeof ImageIcon }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-card-foreground">{label}</span>
      <div className="border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer group">
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-xs text-muted-foreground">
          Click to upload or drag and drop
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          PNG, JPG up to 2MB
        </span>
      </div>
    </div>
  );
}

interface ColorConfigItem {
  key: keyof ThemeColors;
  label: string;
  tooltip: string;
  usage?: { label: string; items: string[] };
}

const brandColors: ColorConfigItem[] = [
  {
    key: "primary",
    label: "Main Brand Color",
    tooltip:
      "The primary color for your brand. Used for main buttons, links, active navigation, and key actions.",
    usage: {
      label: "Used in",
      items: ["Primary Buttons", "Links", "Active Navigation", "Toggles"],
    },
  },
  {
    key: "secondary",
    label: "Highlight Color",
    tooltip:
      "A complementary color for secondary elements like badges, focus states, and highlights.",
    usage: {
      label: "Used in",
      items: ["Secondary Buttons", "Badges", "Focus Rings", "Highlights"],
    },
  },
];

const surfaceColors: ColorConfigItem[] = [
  {
    key: "sidebar",
    label: "Sidebar Background",
    tooltip: "Background color of the left navigation sidebar.",
    usage: {
      label: "Used in",
      items: ["Sidebar Background", "Navigation Panel"],
    },
  },
  {
    key: "background",
    label: "Page Background",
    tooltip: "The main background color for pages and the top navbar.",
    usage: {
      label: "Used in",
      items: ["Page Background", "Navbar Background", "Body"],
    },
  },
  {
    key: "card",
    label: "Card Background",
    tooltip: "Background color for cards, panels, and content containers.",
    usage: {
      label: "Used in",
      items: ["Cards", "Panels", "Modals", "Popovers"],
    },
  },
  {
    key: "foreground",
    label: "Text Color",
    tooltip: "Primary text color used across the entire application.",
    usage: {
      label: "Used in",
      items: ["Headings", "Body Text", "Labels", "Descriptions"],
    },
  },
  {
    key: "muted",
    label: "Muted Background",
    tooltip:
      "Background for subtle sections, hover states, and secondary areas.",
    usage: {
      label: "Used in",
      items: ["Hover States", "Subtle Sections", "Table Stripes"],
    },
  },
  {
    key: "border",
    label: "Border Color",
    tooltip: "Color for borders, dividers, and input outlines.",
    usage: {
      label: "Used in",
      items: ["Borders", "Dividers", "Input Outlines", "Separators"],
    },
  },
];

const statusColors: ColorConfigItem[] = [
  {
    key: "success",
    label: "Success Color",
    tooltip: "Color for success states, confirmations, and positive feedback.",
    usage: {
      label: "Used in",
      items: ["Success Messages", "Checkmarks", "Positive Badges"],
    },
  },
  {
    key: "warning",
    label: "Warning Color",
    tooltip: "Color for warnings, alerts, and cautionary feedback.",
    usage: {
      label: "Used in",
      items: ["Warning Messages", "Alerts", "Caution Badges"],
    },
  },
  {
    key: "destructive",
    label: "Error / Danger Color",
    tooltip: "Color for errors, destructive actions, and negative feedback.",
    usage: {
      label: "Used in",
      items: ["Error Messages", "Delete Buttons", "Danger Alerts"],
    },
  },
];

export function ThemePage() {
  const {
    darkMode,
    lightColors,
    darkColors,
    setDarkMode,
    setLightColor,
    setDarkColor,
    applyTheme,
    resetToDefaults,
    undo,
    canUndo,
    exportTheme,
    importTheme,
  } = useThemeStore();
  const { addToast } = useUIStore();

  const [isSaving, setIsSaving] = useState(false);
  const [savedColors, setSavedColors] = useState<{
    light: ThemeColors;
    dark: ThemeColors;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!savedColors) {
      setSavedColors({ light: { ...lightColors }, dark: { ...darkColors } });
    }
  }, [lightColors, darkColors, savedColors]);

  const currentColors = darkMode ? darkColors : lightColors;

  const hasChanges = useMemo(() => {
    if (!savedColors) return false;
    const saved = darkMode ? savedColors.dark : savedColors.light;
    return Object.keys(currentColors).some(
      (key) =>
        currentColors[key as keyof ThemeColors] !==
        saved[key as keyof ThemeColors],
    );
  }, [currentColors, savedColors, darkMode]);

  const handleColorChange = useCallback(
    (key: keyof ThemeColors, value: string) => {
      if (darkMode) {
        setDarkColor(key, value);
      } else {
        setLightColor(key, value);
      }
    },
    [darkMode, setDarkColor, setLightColor],
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await themeService.saveTheme({
        primaryColor: currentColors.primary,
        secondaryColor: currentColors.secondary,
        sidebarBg: currentColors.sidebar,
        navbarBg: currentColors.background,
        cardBg: currentColors.card,
        buttonColor: currentColors.primary,
        textColor: currentColors.foreground,
        darkMode: String(darkMode),
      });
      setSavedColors({ light: { ...lightColors }, dark: { ...darkColors } });
      applyTheme();
      addToast({
        title: "Theme saved",
        description: "Your theme changes have been saved successfully.",
        variant: "success",
      });
    } catch {
      addToast({
        title: "Save failed",
        description: "Could not save theme changes. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetToDefaults();
    setSavedColors({
      light: { ...useThemeStore.getState().lightColors },
      dark: { ...useThemeStore.getState().darkColors },
    });
    addToast({
      title: "Theme reset",
      description: "Theme has been restored to default settings.",
      variant: "default",
    });
  };

  const handlePreset = (preset: (typeof themePresets)[0]) => {
    useThemeStore.getState().applyPreset(preset);
    addToast({
      title: `Preset applied: ${preset.name}`,
      description:
        "All colors have been updated. Click Save to persist changes.",
      variant: "success",
    });
  };

  const isPresetActive = (preset: (typeof themePresets)[0]) => {
    const current = darkMode ? darkColors : lightColors;
    const presetColors = darkMode ? preset.dark : preset.light;
    return (
      current.primary === presetColors.primary &&
      current.secondary === presetColors.secondary
    );
  };

  const handleExport = () => {
    const json = exportTheme();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "theme.json";
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      title: "Theme exported",
      description: "Your theme has been downloaded as theme.json.",
      variant: "success",
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const success = importTheme(event.target?.result as string);
      if (success) {
        addToast({
          title: "Theme imported",
          description: "Your theme has been imported successfully.",
          variant: "success",
        });
      } else {
        addToast({
          title: "Import failed",
          description: "Invalid theme file. Please check the format.",
          variant: "error",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const contrastChecks = [
    {
      bg: currentColors.background,
      text: currentColors.foreground,
      label: "Page text",
    },
    {
      bg: currentColors.card,
      text: currentColors.cardForeground,
      label: "Card text",
    },
    {
      bg: currentColors.sidebar,
      text: currentColors.sidebarForeground,
      label: "Sidebar text",
    },
    {
      bg: currentColors.primary,
      text: currentColors.sidebarPrimaryForeground,
      label: "Primary button",
    },
    {
      bg: currentColors.muted,
      text: currentColors.mutedForeground,
      label: "Muted text",
    },
  ];

  const renderColorSection = (items: ColorConfigItem[], sectionKey: string) => (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map(({ key, label, tooltip, usage }) => (
        <ColorPicker
          key={`${sectionKey}-${key}`}
          label={label}
          value={currentColors[key]}
          onChange={(v) => handleColorChange(key, v)}
          tooltip={tooltip}
          usage={usage}
          dataOcid={`theme.color.${String(key)}`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Theme Builder
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customize your admin panel colors, branding, and appearance
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {hasChanges && (
            <span className="text-xs font-medium flex items-center gap-1.5 text-warning animate-pulse">
              <span className="h-2 w-2 rounded-full bg-warning" />
              Unsaved changes
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            data-ocid="theme.export_button"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            data-ocid="theme.import_button"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* Contrast Warnings */}
      {contrastChecks.map((check) => (
        <ContrastWarning
          key={check.label}
          backgroundColor={check.bg}
          textColor={check.text}
          label={check.label}
        />
      ))}

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column: Settings */}
        <div className="lg:col-span-3 space-y-6">
          {/* Appearance Section - Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-card-foreground">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  Appearance Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDarkMode(false)}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 transition-all ${
                      !darkMode
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:bg-muted/50"
                    }`}
                    data-ocid="theme.light_mode_button"
                  >
                    <Sun className="h-4 w-4 text-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Light Mode
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDarkMode(true)}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 transition-all ${
                      darkMode
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:bg-muted/50"
                    }`}
                    data-ocid="theme.dark_mode_button"
                  >
                    <Moon className="h-4 w-4 text-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Dark Mode
                    </span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  You can customize colors separately for light and dark modes.
                  Switch between modes to edit each one.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Branding Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-card-foreground">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  Branding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <UploadArea label="Brand Logo" icon={ImageIcon} />
                  <UploadArea label="Favicon" icon={ImageIcon} />
                  <UploadArea label="Login Page Logo" icon={ImageIcon} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Brand Colors Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-card-foreground">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  Brand Colors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderColorSection(brandColors, "brand")}
              </CardContent>
            </Card>
          </motion.div>

          {/* Surface Colors Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-card-foreground">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  Surface Colors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderColorSection(surfaceColors, "surface")}
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Colors Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-card-foreground">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  Status Colors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderColorSection(statusColors, "status")}
              </CardContent>
            </Card>
          </motion.div>

          {/* Accessibility Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <AccessibilityScore checks={contrastChecks} />
          </motion.div>

          {/* Presets Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-card-foreground">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  Theme Presets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {themePresets.map((preset) => (
                    <PresetCard
                      key={preset.name}
                      preset={preset}
                      isActive={isPresetActive(preset)}
                      onClick={() => handlePreset(preset)}
                      dataOcid={`theme.preset.${preset.name.toLowerCase().replace(/\s+/g, "_")}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Live Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="lg:sticky lg:top-6 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-card-foreground">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ThemePreview />
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Sticky Action Footer */}
      <div
        className="sticky bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4 py-3 shadow-elevated"
        data-ocid="theme.action_footer"
      >
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-xs font-medium flex items-center gap-1.5 text-warning">
                <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                Unsaved changes
              </span>
            )}
            {!hasChanges && savedColors && (
              <span className="text-xs font-medium flex items-center gap-1.5 text-success">
                <Check className="h-3 w-3" />
                All changes saved
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => undo()}
              disabled={!canUndo()}
              data-ocid="theme.undo_button"
            >
              <Undo2 className="h-4 w-4 mr-1.5" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              data-ocid="theme.reset_button"
            >
              <RefreshCcw className="h-4 w-4 mr-1.5" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              data-ocid="theme.save_button"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1.5" />
              )}
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
