import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  tone?: "amber" | "rose" | "violet" | "teal" | "sky" | "orange" | "lime" | "pink";
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  amber: "border-amber-200/80 bg-gradient-to-br from-amber-50 to-card dark:from-amber-950/30 dark:to-card",
  rose: "border-rose-200/80 bg-gradient-to-br from-rose-50 to-card dark:from-rose-950/30 dark:to-card",
  violet: "border-violet-200/80 bg-gradient-to-br from-violet-50 to-card dark:from-violet-950/30 dark:to-card",
  teal: "border-teal-200/80 bg-gradient-to-br from-teal-50 to-card dark:from-teal-950/30 dark:to-card",
  sky: "border-sky-200/80 bg-gradient-to-br from-sky-50 to-card dark:from-sky-950/30 dark:to-card",
  orange: "border-orange-200/80 bg-gradient-to-br from-orange-50 to-card dark:from-orange-950/30 dark:to-card",
  lime: "border-lime-200/80 bg-gradient-to-br from-lime-50 to-card dark:from-lime-950/30 dark:to-card",
  pink: "border-pink-200/80 bg-gradient-to-br from-pink-50 to-card dark:from-pink-950/30 dark:to-card",
};

const iconToneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-200",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-200",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-200",
  lime: "bg-lime-100 text-lime-700 dark:bg-lime-900/60 dark:text-lime-200",
  pink: "bg-pink-100 text-pink-700 dark:bg-pink-900/60 dark:text-pink-200",
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  tone = "amber",
}: StatCardProps) {
  return (
    <Card className={cn("rounded-2xl transition-smooth hover:-translate-y-0.5 hover:shadow-elevated", toneStyles[tone], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconToneStyles[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.value >= 0 ? "text-success" : "text-destructive",
                )}
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value}%
              </span>
            )}
            <p className="text-xs text-muted-foreground">
              {description || trend?.label}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
