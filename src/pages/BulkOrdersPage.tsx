import { PageHeader } from "@/components/PageHeader";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { bulkOrderRequestService, type BulkOrderRequest, type BulkRequestStatus } from "@/api/services/bulkOrderRequestService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAlert } from "@/hooks/use-alert";
import { Eye, PhoneCall } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:9020";

export function BulkOrdersPage() {
  const [requests, setRequests] = useState<BulkOrderRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [isRequestsDialogOpen, setIsRequestsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BulkOrderRequest | null>(null);
  const alert = useAlert();

  const loadRequests = async () => {
    try { setRequests(await bulkOrderRequestService.getAll()); }
    catch (error) { alert.error(error instanceof Error ? error.message : "Could not load bulk requests"); }
    finally { setLoadingRequests(false); }
  };
  useEffect(() => { loadRequests(); }, []);

  const setStatus = async (id: string, status: BulkRequestStatus) => {
    try {
      const updated = await bulkOrderRequestService.updateStatus(id, status);
      setRequests((items) => items.map((item) => item.id === id ? updated : item));
    } catch (error) { alert.error(error instanceof Error ? error.message : "Could not update request"); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Bulk Orders" description="High-volume seller orders" />
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-primary" />
            <div><h2 className="font-semibold">Large quantity requests</h2><p className="text-sm text-muted-foreground">Customer requests for a quotation or callback.</p></div>
          </div>
          <Button variant="outline" onClick={() => setIsRequestsDialogOpen(true)}>
            View requests{requests.length ? ` (${requests.length})` : ""}
          </Button>
        </div>
      </section>

      <Dialog open={isRequestsDialogOpen} onOpenChange={setIsRequestsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader><DialogTitle>Large quantity requests</DialogTitle></DialogHeader>
          {loadingRequests ? <p className="text-sm text-muted-foreground">Loading requests...</p> : requests.length === 0 ? <p className="text-sm text-muted-foreground">No large quantity requests yet.</p> : <div className="overflow-x-auto rounded-lg border"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-muted/60 text-muted-foreground"><tr><th className="p-3 font-medium">Product</th><th className="p-3 font-medium">Quantity</th><th className="p-3 font-medium">Customer</th><th className="p-3 font-medium">Contact</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Actions</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id} className="border-t"><td className="p-3 font-medium">{request.productId?.name || "Deleted product"}<span className="mt-1 block text-xs font-normal text-muted-foreground">{request.productId?.sku || "No SKU"}</span></td><td className="p-3">{request.quantity}</td><td className="p-3">{request.userId?.name || "Customer"}</td><td className="p-3">{request.userId?.mobile || "—"}<span className="mt-1 block text-xs text-muted-foreground">{request.userId?.email || ""}</span></td><td className="p-3"><Badge variant={request.status === "closed" ? "secondary" : "default"}>{request.status}</Badge></td><td className="p-3"><div className="flex items-center gap-1"><Button size="sm" variant="ghost" onClick={() => { setIsRequestsDialogOpen(false); setSelectedRequest(request); }}><Eye className="mr-1 h-4 w-4" />Details</Button>{request.status === "pending" && <Button size="sm" variant="outline" onClick={() => setStatus(request.id, "contacted")}>Contacted</Button>}{request.status === "contacted" && <Button size="sm" variant="outline" onClick={() => setStatus(request.id, "closed")}>Close</Button>}</div></td></tr>)}</tbody></table></div>}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedRequest)} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Large quantity request details</DialogTitle></DialogHeader>
          {selectedRequest && <div className="grid gap-5 text-sm sm:grid-cols-2">
            <section className="rounded-lg border p-4"><h3 className="mb-3 font-semibold">Customer details</h3>
              <div className="space-y-2 text-muted-foreground"><p><span className="font-medium text-foreground">Name:</span> {selectedRequest.userId?.name || "Not available"}</p><p><span className="font-medium text-foreground">Mobile:</span> {selectedRequest.userId?.mobile || "Not available"}</p><p><span className="font-medium text-foreground">Email:</span> {selectedRequest.userId?.email || "Not available"}</p><p><span className="font-medium text-foreground">Area:</span> {[selectedRequest.userId?.cityId?.name, selectedRequest.userId?.zoneId?.name].filter(Boolean).join(", ") || "Not available"}</p><p><span className="font-medium text-foreground">Requested:</span> {new Date(selectedRequest.createdAt).toLocaleString()}</p></div>
            </section>
            <section className="rounded-lg border p-4"><h3 className="mb-3 font-semibold">Product details</h3>
              <div className="flex gap-3">{selectedRequest.productId?.image && <img src={`${API_BASE}${selectedRequest.productId.image}`} alt={selectedRequest.productId.name} className="h-16 w-16 rounded-md object-cover" />}<div className="space-y-2 text-muted-foreground"><p className="font-medium text-foreground">{selectedRequest.productId?.name || "Deleted product"}</p><p>SKU: {selectedRequest.productId?.sku || "—"}</p><p>Category: {selectedRequest.productId?.categoryId?.name || "—"}</p><p>Unit: {selectedRequest.productId?.unitValue || "—"} {selectedRequest.productId?.unit || ""}</p><p>Regular price: ₹{selectedRequest.productId?.sellingPrice ?? "—"}</p><p>Available stock: {selectedRequest.productId?.stock ?? "—"}</p></div></div>
              {selectedRequest.productId?.description && <p className="mt-3 text-muted-foreground">{selectedRequest.productId.description}</p>}<p className="mt-3 font-medium">Requested quantity: {selectedRequest.quantity}</p>
            </section>
          </div>}
        </DialogContent>
      </Dialog>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <OrdersTable
          orderType="bulk"
          searchPlaceholder="Search bulk orders..."
          emptyMessage="No bulk orders found"
        />
      </motion.div>
    </div>
  );
}
