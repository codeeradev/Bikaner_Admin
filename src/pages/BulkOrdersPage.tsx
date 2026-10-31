import {
  type BulkOrderRequest,
  type BulkRequestStatus,
  bulkOrderRequestService,
} from "@/api/services/bulkOrderRequestService";
import { PageHeader } from "@/components/PageHeader";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/hooks/use-alert";
import { Eye, PhoneCall } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:9020";

export function BulkOrdersPage() {
  const [requests, setRequests] = useState<BulkOrderRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [isRequestsDialogOpen, setIsRequestsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<BulkOrderRequest | null>(null);
  const alert = useAlert();

  const loadRequests = useCallback(async () => {
    try {
      setRequests(await bulkOrderRequestService.getAll());
    } catch (error) {
      alert.error(
        error instanceof Error ? error.message : "Could not load bulk requests",
      );
    } finally {
      setLoadingRequests(false);
    }
  }, [alert]);
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const setStatus = async (
    id: string,
    status: BulkRequestStatus,
    notes?: string,
  ) => {
    try {
      const updated = await bulkOrderRequestService.updateStatus(
        id,
        status,
        notes,
      );
      setRequests((items) =>
        items.map((item) => (item.id === id ? updated : item)),
      );
      setSelectedRequest((item) => (item?.id === id ? updated : item));
      alert.success("Bulk order request updated.");
    } catch (error) {
      alert.error(
        error instanceof Error ? error.message : "Could not update request",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Distributor Orders"
        description="High-volume distributor orders"
        className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-orange-50/80 to-amber-50 px-5 py-5 shadow-sm dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:px-6"
      />
      <section className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-white to-rose-50/60 p-5 shadow-sm dark:border-border dark:from-card dark:to-rose-950/10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-sm">
              <PhoneCall className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold">Bulk Orders</h2>
              <p className="text-sm text-muted-foreground">
                Large-quantity customer requests.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-xl border-rose-200 bg-white/80"
            onClick={() => setIsRequestsDialogOpen(true)}
          >
            View bulk orders{requests.length ? ` (${requests.length})` : ""}
          </Button>
        </div>
      </section>

      <Dialog
        open={isRequestsDialogOpen}
        onOpenChange={setIsRequestsDialogOpen}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[1.75rem] border-rose-100 p-5 shadow-2xl shadow-rose-950/10 sm:max-w-5xl sm:p-7">
          <DialogHeader className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4 pr-10 dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:p-5">
            <DialogTitle className="text-lg font-bold tracking-tight">
              Bulk Orders
            </DialogTitle>
          </DialogHeader>
          {loadingRequests ? (
            <p className="text-sm text-muted-foreground">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bulk orders yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-muted/60 text-muted-foreground">
                  <tr>
                    <th className="p-3 font-medium">Product</th>
                    <th className="p-3 font-medium">Quantity</th>
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Mobile number</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {requests.map((request) => (
                    <tr
                      key={request.id}
                      className="transition-colors hover:bg-rose-50/30 dark:hover:bg-rose-950/10"
                    >
                      <td className="p-3 font-medium">
                        {request.productId?.name || "Deleted product"}
                        <span className="mt-1 block text-xs font-normal text-muted-foreground">
                          {request.productId?.sku || "No SKU"}
                        </span>
                      </td>
                      <td className="p-3">{request.quantity}</td>
                      <td className="p-3">
                        {request.userId?.name || "Customer"}
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {request.userId?.email || ""}
                        </span>
                      </td>
                      <td className="p-3 font-medium">
                        {request.userId?.mobile || "Not available"}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            request.status === "cancelled"
                              ? "destructive"
                              : request.status === "delivered"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {request.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => {
                            setIsRequestsDialogOpen(false);
                            setSelectedRequest(request);
                          }}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedRequest)}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[1.75rem] border-rose-100 p-5 shadow-2xl shadow-rose-950/10 sm:max-w-3xl sm:p-7">
          <DialogHeader className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4 pr-10 dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:p-5">
            <DialogTitle className="text-lg font-bold tracking-tight">
              Bulk order details
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-5 text-sm sm:grid-cols-2">
              <section className="rounded-2xl border border-border/70 bg-card/70 p-4">
                <h3 className="mb-3 font-semibold">Customer details</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Name:</span>{" "}
                    {selectedRequest.userId?.name || "Not available"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Mobile:</span>{" "}
                    {selectedRequest.userId?.mobile || "Not available"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Email:</span>{" "}
                    {selectedRequest.userId?.email || "Not available"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Area:</span>{" "}
                    {[
                      selectedRequest.userId?.cityId?.name,
                      selectedRequest.userId?.zoneId?.name,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Not available"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      Requested:
                    </span>{" "}
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
              </section>
              <section className="rounded-2xl border border-border/70 bg-card/70 p-4">
                <h3 className="mb-3 font-semibold">Product details</h3>
                <div className="flex gap-3">
                  {selectedRequest.productId?.image && (
                    <img
                      src={`${API_BASE}${selectedRequest.productId.image}`}
                      alt={selectedRequest.productId.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                  )}
                  <div className="space-y-2 text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {selectedRequest.productId?.name || "Deleted product"}
                    </p>
                    <p>SKU: {selectedRequest.productId?.sku || "—"}</p>
                    <p>
                      Category:{" "}
                      {selectedRequest.productId?.categoryId?.name || "—"}
                    </p>
                    <p>
                      Unit: {selectedRequest.productId?.unitValue || "—"}{" "}
                      {selectedRequest.productId?.unit || ""}
                    </p>
                    <p>
                      Regular price: ₹
                      {selectedRequest.productId?.sellingPrice ?? "—"}
                    </p>
                    <p>
                      Available stock: {selectedRequest.productId?.stock ?? "—"}
                    </p>
                  </div>
                </div>
                {selectedRequest.productId?.description && (
                  <p className="mt-3 text-muted-foreground">
                    {selectedRequest.productId.description}
                  </p>
                )}
                <p className="mt-3 font-medium">
                  Requested quantity: {selectedRequest.quantity}
                </p>
              </section>
              <section className="rounded-2xl border border-border/70 bg-card/70 p-4 sm:col-span-2">
                <Label htmlFor="bulkOrderNotes">Notes</Label>
                <Textarea
                  id="bulkOrderNotes"
                  className="mt-2"
                  placeholder="Add notes for this bulk order..."
                  value={selectedRequest.notes || ""}
                  onChange={(event) =>
                    setSelectedRequest({
                      ...selectedRequest,
                      notes: event.target.value,
                    })
                  }
                  rows={4}
                />
              </section>
            </div>
          )}
          {selectedRequest && (
            <DialogFooter className="flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() =>
                  setStatus(
                    selectedRequest.id,
                    selectedRequest.status,
                    selectedRequest.notes,
                  )
                }
              >
                Save Notes
              </Button>
              <Button
                variant="destructive"
                className="rounded-xl"
                disabled={selectedRequest.status !== "pending"}
                onClick={() =>
                  setStatus(
                    selectedRequest.id,
                    "cancelled",
                    selectedRequest.notes,
                  )
                }
              >
                Cancel
              </Button>
              <Button
                disabled={selectedRequest.status !== "pending"}
                className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:brightness-105"
                onClick={() =>
                  setStatus(
                    selectedRequest.id,
                    "delivered",
                    selectedRequest.notes,
                  )
                }
              >
                Mark Delivered
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <OrdersTable
          orderType="bulk"
          searchPlaceholder="Search distributor orders..."
          emptyMessage="No distributor orders found"
        />
      </motion.div>
    </div>
  );
}
