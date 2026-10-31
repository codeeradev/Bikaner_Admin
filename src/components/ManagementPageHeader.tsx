import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ManagementPageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: ReactNode;
  className?: string;
}

/** Shared, responsive heading for the catalog management pages. */
export function ManagementPageHeader({
  title,
  description,
  icon: Icon,
  children,
  className,
}: ManagementPageHeaderProps) {
  return (
    <section
      className={cn(
        "relative isolate flex flex-col gap-5 overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-orange-50/80 to-amber-50 p-5 shadow-sm shadow-rose-950/[0.035] dark:border-border dark:from-rose-950/25 dark:via-orange-950/15 dark:to-card sm:flex-row sm:items-center sm:justify-between sm:p-6",
        className,
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 -z-10 h-48 w-48 rounded-full bg-white/50 blur-3xl dark:bg-rose-500/5" />
      <div className="flex min-w-0 items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20 ring-4 ring-white/60 dark:ring-white/5">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-300">Catalog management</p>
          <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      {children && (
        <div className="relative flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {children}
        </div>
      )}
    </section>
  );
}
