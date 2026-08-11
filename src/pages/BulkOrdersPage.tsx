import { PageHeader } from "@/components/PageHeader";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { bulkOrderRequestService, type BulkOrderRequest, type BulkRequestStatus } from "@/api/services/bulkOrderRequestService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAlert } from "@/hooks/use-alert";
import { PhoneCall } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function BulkOrdersPage() {
  const [requests, setRequests] = useState<BulkOrderRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
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
        <div className="mb-4 flex items-center gap-2">
          <PhoneCall className="h-5 w-5 text-primary" />
          <div><h2 className="font-semibold">Large quantity requests</h2><p className="text-sm text-muted-foreground">Requests submitted directly by customers for a quotation or callback.</p></div>
        </div>
        {loadingRequests ? <p className="text-sm text-muted-foreground">Loading requests...</p> : requests.length === 0 ? <p className="text-sm text-muted-foreground">No large quantity requests yet.</p> : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{request.productId?.name || "Deleted product"} <span className="text-muted-foreground">× {request.quantity}</span></p>
                  <p className="text-sm text-muted-foreground">{request.userId?.name || "Customer"}{request.userId?.phone ? ` · ${request.userId.phone}` : ""}{request.userId?.email ? ` · ${request.userId.email}` : ""}</p>
                </div>
                <div className="flex items-center gap-2"><Badge variant={request.status === "closed" ? "secondary" : "default"}>{request.status}</Badge>
                  {request.status === "pending" && <Button size="sm" variant="outline" onClick={() => setStatus(request.id, "contacted")}>Mark contacted</Button>}
                  {request.status === "contacted" && <Button size="sm" variant="outline" onClick={() => setStatus(request.id, "closed")}>Close</Button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
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
