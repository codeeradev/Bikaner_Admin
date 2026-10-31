import {
  type List,
  type StockRequest,
  stockRequestError,
  stockRequestService,
} from "@/api/services/stockRequestService";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { PERMISSIONS } from "@/lib/permissions";
import { useAuthStore } from "@/store/authStore";
import {
  Check,
  Clock3,
  type LucideIcon,
  Package,
  RefreshCw,
  Truck,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

const inputClass =
  "mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-rose-400/40";
export function FranchiseStockRequestsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState<List | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState<{
    row: StockRequest;
    status: "approved" | "rejected";
  } | null>(null);
  const [reviewError, setReviewError] = useState("");
  const canEdit = useAuthStore((state) =>
    state.hasPermission(PERMISSIONS.FRANCHISE_EDIT),
  );
  const pageCounts = (data?.data ?? []).reduce(
    (counts, row) => {
      counts[row.status] = (counts[row.status] ?? 0) + 1;
      return counts;
    },
    {} as Record<string, number>,
  );
  useLiveRefresh(async () => {
    if (!busy && !review) setRevision((value) => value + 1);
  });
  // `revision` intentionally triggers a reload after manual refresh and mutations.
  // biome-ignore lint/correctness/useExhaustiveDependencies: revision is the explicit reload trigger
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setData(null);
    stockRequestService
      .list({
        page,
        limit: 20,
        ...(status ? { status } : {}),
      })
      .then((response) => {
        if (active) setData(response);
      })
      .catch((err) => {
        if (active)
          setError(stockRequestError(err, "Could not load stock requests"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, status, revision]);
  async function update(
    id: string,
    body: { status: string; quantity?: number; note?: string },
  ) {
    setBusy(true);
    setReviewError("");
    setError("");
    try {
      await stockRequestService.update(id, body);
      setReview(null);
      setRevision((value) => value + 1);
    } catch (err) {
      const message = stockRequestError(err, "Could not update request");
      if (review) setReviewError(message);
      else setError(message);
    } finally {
      setBusy(false);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!review) return;
    const form = new FormData(event.currentTarget);
    void update(review.row.id, {
      status: review.status,
      note: String(form.get("note") || ""),
      ...(review.status === "approved"
        ? { quantity: Number(form.get("quantity")) }
        : {}),
    });
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Franchise Stock Requests"
        description="Review replenishment, approve quantities, and track delivery."
        className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-orange-50/80 to-amber-50 px-5 py-5 shadow-sm dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:px-6"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RequestStat
          icon={Package}
          label="Total requests"
          value={data?.pagination.total ?? "—"}
          tone="rose"
        />
        <RequestStat
          icon={Clock3}
          label="Pending on page"
          value={pageCounts.pending ?? 0}
          tone="amber"
        />
        <RequestStat
          icon={Truck}
          label="Dispatched on page"
          value={pageCounts.dispatched ?? 0}
          tone="blue"
        />
        <RequestStat
          icon={Check}
          label="Received on page"
          value={pageCounts.received ?? 0}
          tone="green"
        />
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <label className="w-full max-w-xs text-xs font-semibold text-muted-foreground">
          FILTER REQUESTS
          <select
            className={`${inputClass} mt-1.5 h-10 bg-background text-sm font-normal text-foreground`}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {["pending", "approved", "dispatched", "received", "rejected"].map(
              (value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ),
            )}
          </select>
        </label>
        <Button
          variant="outline"
          className="h-10 rounded-xl bg-background"
          onClick={() => setRevision((value) => value + 1)}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {loading ? (
        <output
          aria-live="polite"
          className="rounded-2xl border border-border/70 bg-card p-10 text-center text-sm text-muted-foreground shadow-sm"
        >
          Loading stock requests…
        </output>
      ) : (
        data && (
          <>
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-sm text-left">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr>
                      {[
                        "Franchise / product",
                        "Stock at request",
                        "Requested",
                        "Approved",
                        "Status / notes",
                        "Actions",
                      ].map((label) => (
                        <th
                          key={label}
                          className="whitespace-nowrap px-4 py-3.5 text-[11px] font-bold uppercase tracking-wide"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-border/70 transition-colors hover:bg-rose-50/30 dark:hover:bg-rose-950/10"
                      >
                        <td className="px-4 py-4">
                          <strong className="block font-semibold">
                            {row.franchiseId?.name || "Deleted franchise"}
                          </strong>
                          <p className="mt-0.5">{row.productName}</p>
                          <small className="mt-1 block text-xs text-muted-foreground">
                            {new Date(row.createdAt).toLocaleString()}
                          </small>
                        </td>
                        <td className="px-4 py-4 font-medium">
                          {row.stockAtRequest}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            packs
                          </span>
                        </td>
                        <td className="px-4 py-4 font-semibold">
                          {row.requestedQuantity}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            packs
                          </span>
                        </td>
                        <td className="px-4 py-4 font-medium">
                          {row.approvedQuantity ?? "—"}
                        </td>
                        <td className="min-w-48 max-w-sm px-4 py-4">
                          <RequestStatusBadge status={row.status} />
                          {row.note && (
                            <p className="mt-1 break-words text-xs text-muted-foreground">
                              Franchise: {row.note}
                            </p>
                          )}
                          {row.adminNote && (
                            <p className="mt-1 break-words text-xs text-muted-foreground">
                              Admin: {row.adminNote}
                            </p>
                          )}
                          {row.reviewedBy && (
                            <small className="mt-1 block text-xs text-muted-foreground">
                              Reviewed by {row.reviewedBy.name}
                            </small>
                          )}
                          {row.receivedAt && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Received{" "}
                              {new Date(row.receivedAt).toLocaleString()}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex min-w-max flex-wrap gap-2">
                            {canEdit && row.status === "pending" && (
                              <>
                                <Button
                                  disabled={busy}
                                  className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:brightness-105"
                                  onClick={() => {
                                    setReviewError("");
                                    setReview({ row, status: "approved" });
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  disabled={busy}
                                  variant="outline"
                                  className="rounded-xl"
                                  onClick={() => {
                                    setReviewError("");
                                    setReview({ row, status: "rejected" });
                                  }}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {canEdit && row.status === "approved" && (
                              <Button
                                disabled={busy}
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Mark ${row.approvedQuantity} packs of ${row.productName} as dispatched?`,
                                    )
                                  )
                                    void update(row.id, {
                                      status: "dispatched",
                                    });
                                }}
                              >
                                Mark dispatched
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!data.data.length && (
                <p className="p-12 text-center text-sm text-muted-foreground">
                  No stock requests match this filter.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-muted-foreground">
                {data.pagination.total} requests · Page {page} of{" "}
                {Math.max(1, data.pagination.pages)}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  disabled={page >= data.pagination.pages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )
      )}
      <Dialog
        open={!!review}
        onOpenChange={(open) => {
          if (!open && !busy) setReview(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[1.75rem] border-rose-100 p-5 shadow-2xl shadow-rose-950/10 sm:max-w-lg sm:p-7">
          <DialogHeader className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4 pr-10 dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:p-5">
            <DialogTitle className="text-lg font-bold tracking-tight">
              {review?.status === "approved"
                ? "Approve stock request"
                : "Reject stock request"}
            </DialogTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Review the requested quantity and add a note for the franchise
              team.
            </p>
          </DialogHeader>
          {review && (
            <form onSubmit={submit} className="space-y-4 pt-1">
              <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
                <p className="font-semibold">
                  {review.row.franchiseId?.name} · {review.row.productName}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Requested: {review.row.requestedQuantity} packs. Approval does
                  not increase stock; the franchise confirms receipt after
                  dispatch.
                </p>
              </div>
              {review.status === "approved" && (
                <label className="block">
                  Approved quantity
                  <input
                    className={inputClass}
                    name="quantity"
                    type="number"
                    min="1"
                    max="1000000"
                    step="1"
                    defaultValue={review.row.requestedQuantity}
                    required
                    disabled={busy}
                  />
                </label>
              )}
              <label className="block">
                {review.status === "rejected"
                  ? "Reason for rejection"
                  : "Note (optional)"}
                <textarea
                  className={inputClass}
                  name="note"
                  maxLength={500}
                  required={review.status === "rejected"}
                  disabled={busy}
                />
              </label>
              {reviewError && (
                <p role="alert" className="text-destructive">
                  {reviewError}
                </p>
              )}
              <div className="flex justify-end border-t border-border/70 pt-4">
                <Button
                  type="submit"
                  disabled={busy}
                  className="min-w-28 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/15 hover:brightness-105"
                >
                  {busy ? "Saving…" : "Confirm"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequestStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone: "rose" | "amber" | "blue" | "green";
}) {
  const tones = {
    rose: "from-rose-100 to-orange-100 text-rose-600 dark:from-rose-950/60 dark:to-orange-950/30 dark:text-rose-300",
    amber:
      "from-amber-100 to-orange-100 text-amber-700 dark:from-amber-950/60 dark:to-orange-950/30 dark:text-amber-300",
    blue: "from-sky-100 to-indigo-100 text-sky-700 dark:from-sky-950/60 dark:to-indigo-950/30 dark:text-sky-300",
    green:
      "from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-950/60 dark:to-teal-950/30 dark:text-emerald-300",
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tones[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function RequestStatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    pending:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
    approved:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
    dispatched:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300",
    received:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
    rejected:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
  };
  return (
    <Badge variant="outline" className={`capitalize ${tones[status] ?? ""}`}>
      {status}
    </Badge>
  );
}
