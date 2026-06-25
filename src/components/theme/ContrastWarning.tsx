import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

function getLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = Number.parseInt(clean.slice(0, 2), 16) / 255;
  const g = Number.parseInt(clean.slice(2, 4), 16) / 255;
  const b = Number.parseInt(clean.slice(4, 6), 16) / 255;

  const [lr, lg, lb] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function contrastRatio(bg: string, text: string): number {
  const l1 = getLuminance(bg);
  const l2 = getLuminance(text);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getGrade(ratio: number): {
  grade: string;
  color: string;
  icon: typeof CheckCircle2;
} {
  if (ratio >= 7) {
    return { grade: "AAA", color: "text-success", icon: CheckCircle2 };
  }
  if (ratio >= 4.5) {
    return { grade: "AA", color: "text-success", icon: CheckCircle2 };
  }
  if (ratio >= 3) {
    return { grade: "AA Large", color: "text-warning", icon: Info };
  }
  return { grade: "Fail", color: "text-destructive", icon: AlertTriangle };
}

interface ContrastWarningProps {
  backgroundColor: string;
  textColor: string;
  label: string;
}

export function ContrastWarning({
  backgroundColor,
  textColor,
  label,
}: ContrastWarningProps) {
  const ratio = contrastRatio(backgroundColor, textColor);
  const { grade, color, icon: Icon } = getGrade(ratio);
  const isReadable = ratio >= 4.5;

  if (isReadable) return null;

  return (
    <div className="flex items-center gap-2 text-xs mt-1">
      <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
      <span className={color}>
        Low contrast for {label}: {ratio.toFixed(2)}:1 (needs 4.5:1) — {grade}
      </span>
    </div>
  );
}

interface ContrastScoreProps {
  backgroundColor: string;
  textColor: string;
  label: string;
}

export function ContrastScore({
  backgroundColor,
  textColor,
  label,
}: ContrastScoreProps) {
  const ratio = contrastRatio(backgroundColor, textColor);
  const { grade, color, icon: Icon } = getGrade(ratio);

  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
      <span className="text-muted-foreground">
        {label}: {ratio.toFixed(2)}:1
      </span>
      <span className={`font-semibold ${color}`}>{grade}</span>
    </div>
  );
}

interface AccessibilityScoreProps {
  checks: Array<{
    bg: string;
    text: string;
    label: string;
  }>;
}

export function AccessibilityScore({ checks }: AccessibilityScoreProps) {
  const scores = checks.map((c) => contrastRatio(c.bg, c.text));
  const avgRatio = scores.reduce((a, b) => a + b, 0) / scores.length;
  const passCount = scores.filter((r) => r >= 4.5).length;
  const total = scores.length;

  let scoreLabel: string;
  let scoreColor: string;
  if (avgRatio >= 7) {
    scoreLabel = "Excellent";
    scoreColor = "text-success";
  } else if (avgRatio >= 4.5) {
    scoreLabel = "Good";
    scoreColor = "text-success";
  } else if (avgRatio >= 3) {
    scoreLabel = "Fair";
    scoreColor = "text-warning";
  } else {
    scoreLabel = "Poor";
    scoreColor = "text-destructive";
  }

  const percentage = Math.round((passCount / total) * 100);

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-card-foreground">
            Accessibility Score
          </div>
          <div className="text-xs text-muted-foreground">
            {passCount} of {total} checks passed
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${scoreColor}`}>
            {percentage}%
          </div>
          <div className={`text-xs font-medium ${scoreColor}`}>
            {scoreLabel}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden bg-muted">
        <div
          className={`h-full rounded-full transition-all ${
            percentage >= 80
              ? "bg-success"
              : percentage >= 50
                ? "bg-warning"
                : "bg-destructive"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Individual scores */}
      <div className="space-y-1.5 pt-1">
        {checks.map((check) => (
          <ContrastScore
            key={check.label}
            backgroundColor={check.bg}
            textColor={check.text}
            label={check.label}
          />
        ))}
      </div>
    </div>
  );
}
