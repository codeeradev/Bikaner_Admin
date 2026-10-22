import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { useEffect, useState, type FormEvent } from "react";
import {
  stockRequestService,
  stockRequestError,
  type StockRequest,
  type List,
} from "@/api/services/stockRequestService";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { PERMISSIONS } from "@/lib/permissions";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 mt-2";
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
  useLiveRefresh(async () => { if (!busy && !review) setRevision(value => value + 1); });
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
      />
      <div className="flex gap-4 items-end">
        <label className="text-sm">
          Status
          <select
            className={inputClass}
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
          onClick={() => setRevision((value) => value + 1)}
        >
          Refresh
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">Loading requests…</p>
      ) : (
        data && (
          <>
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    {[
                      "Franchise / product",
                      "Stock at request",
                      "Requested",
                      "Approved",
                      "Status / notes",
                      "Actions",
                    ].map((label) => (
                      <th key={label} className="p-4 whitespace-nowrap">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="p-4">
                        <strong>
                          {row.franchiseId?.name || "Deleted franchise"}
                        </strong>
                        <p>{row.productName}</p>
                        <small className="text-muted-foreground">
                          {new Date(row.createdAt).toLocaleString()}
                        </small>
                      </td>
                      <td className="p-4">{row.stockAtRequest}</td>
                      <td className="p-4">{row.requestedQuantity}</td>
                      <td className="p-4">{row.approvedQuantity ?? "—"}</td>
                      <td className="p-4 min-w-48 max-w-sm">
                        <span className="capitalize font-medium">
                          {row.status}
                        </span>
                        {row.note && (
                          <p className="text-muted-foreground break-words">
                            Franchise: {row.note}
                          </p>
                        )}
                        {row.adminNote && (
                          <p className="text-muted-foreground break-words">
                            Admin: {row.adminNote}
                          </p>
                        )}
                        {row.reviewedBy && (
                          <small>Reviewed by {row.reviewedBy.name}</small>
                        )}
                        {row.receivedAt && (
                          <p>
                            Received {new Date(row.receivedAt).toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {canEdit && row.status === "pending" && (
                            <>
                              <Button
                                disabled={busy}
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
                                  void update(row.id, { status: "dispatched" });
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
              {!data.data.length && (
                <p className="p-8 text-center text-muted-foreground">
                  No stock requests match this filter.
                </p>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {data.pagination.total} requests · Page {page} of{" "}
                {Math.max(1, data.pagination.pages)}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {review?.status === "approved"
                ? "Approve stock request"
                : "Reject stock request"}
            </DialogTitle>
          </DialogHeader>
          {review && (
            <form onSubmit={submit} className="space-y-4">
              <p>
                {review.row.franchiseId?.name} · {review.row.productName}
              </p>
              <p className="text-sm text-muted-foreground">
                Requested: {review.row.requestedQuantity} packs. Approval does
                not increase stock; the franchise confirms receipt after
                dispatch.
              </p>
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
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Confirm"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
