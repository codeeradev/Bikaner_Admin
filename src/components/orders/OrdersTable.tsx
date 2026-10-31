import {
  type Franchise,
  type OrderListItem,
  type OrderStatus,
  type OrderType,
  franchiseService,
  orderService,
} from "@/api/services";
import { DataTable } from "@/components/DataTable";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/hooks/use-alert";
import { PERMISSIONS } from "@/lib/permissions";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Download, Eye, RefreshCw, Store } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const paymentVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  paid: "default",
  pending: "secondary",
  failed: "destructive",
  refunded: "outline",
};

const orderVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  accepted: "secondary",
  delivered: "default",
  cancelled: "destructive",
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// Badge color for a store's response to an assignment — distinct from
// orderVariants above, since this tracks the franchiseAssignment
// sub-document's status, not the order's own orderStatus.
const franchiseAssignmentVariants: Record<
  string,
  "default" | "secondary" | "destructive"
> = {
  pending: "secondary",
  accepted: "default",
  rejected: "destructive",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
};

interface OrdersTableProps {
  orderType?: OrderType;
  searchPlaceholder: string;
  emptyMessage: string;
}

type OrderStatusFilter = "all" | "pending" | "completed" | "cancelled";

function matchesStatusFilter(
  orderStatus: OrderStatus,
  filter: OrderStatusFilter,
) {
  switch (filter) {
    case "pending":
      // Accepted orders are still being processed and are not complete yet.
      return orderStatus === "pending" || orderStatus === "accepted";
    case "completed":
      return orderStatus === "delivered";
    case "cancelled":
      return orderStatus === "cancelled";
    default:
      return true;
  }
}

export function OrdersTable({
  orderType,
  searchPlaceholder,
  emptyMessage,
}: OrdersTableProps) {
  const alert = useAlert();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<
    string | null
  >(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderListItem | null>(
    null,
  );

  // Stores available for the "Assign to Franchise" dialog below.
  const [activeFranchises, setActiveFranchises] = useState<Franchise[]>([]);

  // Status change dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    orderId: string;
    orderNumber: string;
    newStatus: Exclude<OrderStatus, "pending">;
  }>({ open: false, orderId: "", orderNumber: "", newStatus: "accepted" });

  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    orderId: string;
    orderNumber: string;
    reason: string;
  }>({ open: false, orderId: "", orderNumber: "", reason: "" });

  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    orderId: string;
    orderNumber: string;
    selectedFranchiseId: string;
  }>({ open: false, orderId: "", orderNumber: "", selectedFranchiseId: "" });

  const selectedAssignment = selectedOrder?.franchiseAssignment;
  const selectedFranchiseRef = selectedAssignment?.franchiseId;
  const selectedFranchiseId =
    typeof selectedFranchiseRef === "string"
      ? selectedFranchiseRef
      : (selectedFranchiseRef?.id ?? selectedFranchiseRef?._id);
  const selectedFranchise =
    typeof selectedFranchiseRef === "object" && selectedFranchiseRef
      ? selectedFranchiseRef
      : activeFranchises.find((item) => item.id === selectedFranchiseId);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await orderService.getOrders({
        limit: 100,
        ...(orderType ? { orderType } : {}),
      });
      setOrders(response.orders);
    } catch (error) {
      alert.error(
        getErrorMessage(error, "Something went wrong while loading orders."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [alert, orderType]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadActiveFranchises();
  }, []);

  /** Loads the stores an order can be assigned to — only active ones,
   *  since an inactive store's manager can't log in to respond. */
  async function loadActiveFranchises() {
    try {
      const response = await franchiseService.getFranchises({
        status: "active",
        limit: 100,
      });
      setActiveFranchises(response.data);
    } catch (error) {
      alert.error(getErrorMessage(error, "Failed to load franchise stores."));
    }
  }

  // Handle status change click
  const handleStatusClick = (
    orderId: string,
    orderNumber: string,
    newStatus: Exclude<OrderStatus, "pending">,
  ) => {
    if (newStatus === "cancelled") {
      setCancelDialog({
        open: true,
        orderId,
        orderNumber,
        reason: "",
      });
    } else {
      setConfirmDialog({
        open: true,
        orderId,
        orderNumber,
        newStatus,
      });
    }
  };

  // Confirm status change (for accepted/delivered)
  const handleConfirmStatusChange = async () => {
    try {
      setIsUpdating(true);
      const response = await orderService.updateOrderStatus(
        confirmDialog.orderId,
        confirmDialog.newStatus,
      );

      alert.success(
        response.message ||
          `Order ${confirmDialog.orderNumber} marked ${statusLabels[confirmDialog.newStatus]}.`,
      );

      setConfirmDialog({ ...confirmDialog, open: false });
      await loadOrders();
    } catch (error) {
      alert.error(
        getErrorMessage(
          error,
          "Something went wrong while updating order status.",
        ),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadInvoice = async (order: OrderListItem) => {
    try {
      setDownloadingInvoiceId(order.id);
      const invoiceHtml = await orderService.generateInvoice(order.id);
      const blob = new Blob([invoiceHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order.orderNumber || order.id}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      alert.success(`Invoice ${order.orderNumber} downloaded.`);
    } catch (error) {
      alert.error(getErrorMessage(error, "Could not download invoice."));
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  // Handle cancel with reason
  const handleCancelOrder = async () => {
    if (!cancelDialog.reason.trim()) {
      alert.error("Please provide a cancel reason.");
      return;
    }

    try {
      setIsUpdating(true);
      const response = await orderService.updateOrderStatus(
        cancelDialog.orderId,
        "cancelled",
        cancelDialog.reason,
      );

      alert.success(
        response.message ||
          `Order ${cancelDialog.orderNumber} cancelled successfully.`,
      );

      setCancelDialog({ ...cancelDialog, open: false, reason: "" });
      await loadOrders();
    } catch (error) {
      alert.error(
        getErrorMessage(error, "Something went wrong while cancelling order."),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  /** Opens the store picker for a fresh assignment OR a reassignment
   *  after a rejection — same dialog handles both. */
  function openAssignDialog(order: OrderListItem) {
    setAssignDialog({
      open: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      selectedFranchiseId: "",
    });
  }

  async function handleConfirmAssign() {
    if (!assignDialog.selectedFranchiseId) {
      alert.error("Please select a store to assign this order to.");
      return;
    }

    try {
      setIsUpdating(true);
      const response = await franchiseService.assignOrderToFranchise(
        assignDialog.orderId,
        assignDialog.selectedFranchiseId,
      );
      alert.success(
        response.message ||
          `Order ${assignDialog.orderNumber} assigned to store successfully.`,
      );
      setAssignDialog({ ...assignDialog, open: false });
      await loadOrders();
    } catch (error) {
      alert.error(
        getErrorMessage(
          error,
          "Something went wrong while assigning the store.",
        ),
      );
    } finally {
      setIsUpdating(false);
    }
  }

  // Define columns with actions
  const orderColumns: ColumnDef<OrderListItem>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order",
      cell: ({ row }) => (
        <span className="font-mono text-xs whitespace-nowrap">
          {row.getValue("orderNumber")}
        </span>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div className="min-w-[150px]">
          <div className="font-medium">{row.original.customerName}</div>
          {row.original.customerMobile && (
            <div className="text-xs text-muted-foreground">
              {row.original.customerMobile}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "orderType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize whitespace-nowrap">
          {row.getValue("orderType")}
        </Badge>
      ),
    },
    {
      accessorKey: "productCount",
      header: "Products",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {row.getValue("productCount")}
        </span>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{row.getValue("quantity")}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(Number(row.getValue("amount")))}
        </span>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus") as string;
        return (
          <Badge
            variant={paymentVariants[status] || "secondary"}
            className="whitespace-nowrap"
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "orderStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("orderStatus") as OrderStatus;
        return (
          <div className="space-y-1">
            <Badge
              variant={orderVariants[status] || "secondary"}
              className="whitespace-nowrap"
            >
              {statusLabels[status] || status}
            </Badge>
            {status === "cancelled" && row.original.cancelReason && (
              <p
                className="max-w-[220px] truncate text-xs text-muted-foreground"
                title={row.original.cancelReason}
              >
                {row.original.cancelReason}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: "franchiseAssignment",
      header: "Franchise",
      cell: ({ row }) => {
        const assignment = row.original.franchiseAssignment;
        if (!assignment || !assignment.franchiseId) {
          return (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Not assigned
            </span>
          );
        }
        const franchiseId =
          typeof assignment.franchiseId === "string"
            ? assignment.franchiseId
            : (assignment.franchiseId.id ?? assignment.franchiseId._id);
        const franchise =
          typeof assignment.franchiseId === "string"
            ? activeFranchises.find((item) => item.id === franchiseId)
            : assignment.franchiseId;
        const storeName = franchise?.name || "Franchise unavailable";
        return (
          <div className="min-w-[140px]">
            <div className="text-sm font-medium truncate">{storeName}</div>
            <Badge
              variant={
                franchiseAssignmentVariants[assignment.status] ?? "secondary"
              }
              className="mt-1"
            >
              {assignment.status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {row.getValue("date")
            ? new Date(row.getValue("date")).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const status = row.getValue("orderStatus") as OrderStatus;
        const isTerminal = status === "delivered" || status === "cancelled";
        const assignedToFranchise =
          Boolean(row.original.franchiseAssignment?.franchiseId) &&
          row.original.franchiseAssignment?.status !== "rejected";

        return (
          <div className="flex items-center justify-end gap-2 min-w-[280px]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedOrder(row.original)}
            >
              <Eye className="mr-1 h-4 w-4" />
              View
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Download invoice"
              disabled={downloadingInvoiceId === row.original.id}
              onClick={() => handleDownloadInvoice(row.original)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <PermissionGuard
              permission={PERMISSIONS.ORDERS_ASSIGN_FRANCHISE}
              hideOnDenied
            >
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Assign to franchise store"
                disabled={isTerminal}
                onClick={() => openAssignDialog(row.original)}
              >
                <Store className="h-4 w-4" />
              </Button>
            </PermissionGuard>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isTerminal || isUpdating || assignedToFranchise}
                  title={
                    assignedToFranchise
                      ? "The assigned franchise manages this order’s status"
                      : undefined
                  }
                  className="whitespace-nowrap"
                >
                  Change Status
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={status === "accepted"}
                  onClick={() =>
                    handleStatusClick(
                      row.original.id,
                      row.original.orderNumber,
                      "accepted",
                    )
                  }
                >
                  Accept
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={status === "delivered"}
                  onClick={() =>
                    handleStatusClick(
                      row.original.id,
                      row.original.orderNumber,
                      "delivered",
                    )
                  }
                >
                  Mark Delivered
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={status === "cancelled"}
                  onClick={() =>
                    handleStatusClick(
                      row.original.id,
                      row.original.orderNumber,
                      "cancelled",
                    )
                  }
                  className="text-destructive"
                >
                  Cancel Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const statusCounts: Record<OrderStatusFilter, number> = {
    all: orders.length,
    pending: orders.filter((order) =>
      matchesStatusFilter(order.orderStatus, "pending"),
    ).length,
    completed: orders.filter((order) =>
      matchesStatusFilter(order.orderStatus, "completed"),
    ).length,
    cancelled: orders.filter((order) =>
      matchesStatusFilter(order.orderStatus, "cancelled"),
    ).length,
  };

  const filteredOrders = orders.filter((order) =>
    matchesStatusFilter(order.orderStatus, statusFilter),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-end gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadOrders}
          disabled={isLoading}
          className="h-10 rounded-xl bg-card shadow-sm sm:w-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      <Tabs
        value={statusFilter}
        onValueChange={(value) => setStatusFilter(value as OrderStatusFilter)}
      >
        <TabsList className="h-auto max-w-full justify-start gap-1 overflow-x-auto rounded-2xl border border-rose-100/80 bg-rose-50/70 p-1 dark:border-border dark:bg-muted/60">
          {(
            [
              ["all", "All"],
              ["pending", "Pending"],
              ["completed", "Completed"],
              ["cancelled", "Cancelled"],
            ] as const
          ).map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="gap-2 rounded-xl px-3 data-[state=active]:bg-white data-[state=active]:text-rose-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-card dark:data-[state=active]:text-rose-300 sm:px-4"
            >
              {label}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground">
                {statusCounts[value]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="overflow-x-auto">
        <DataTable
          columns={orderColumns}
          data={filteredOrders}
          isLoading={isLoading}
          searchPlaceholder={searchPlaceholder}
          emptyMessage={emptyMessage}
        />
      </div>

      <Dialog
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[1.75rem] border-rose-100 p-5 shadow-2xl shadow-rose-950/10 sm:max-w-3xl sm:p-7">
          <DialogHeader className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4 pr-10 dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:p-5">
            <DialogTitle className="text-lg font-bold tracking-tight">
              Order details{" "}
              {selectedOrder ? `— ${selectedOrder.orderNumber}` : ""}
            </DialogTitle>
            <DialogDescription>
              Customer, products, fulfillment, and payment details for this
              order.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-4 pt-1 text-sm sm:grid-cols-2">
              <section className="rounded-2xl border border-border/70 bg-card/70 p-4">
                <h3 className="mb-3 font-semibold">Customer details</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Name:</span>{" "}
                    {selectedOrder.customerName}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Mobile:</span>{" "}
                    {selectedOrder.customerMobile || "Not available"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Email:</span>{" "}
                    {selectedOrder.customerEmail || "Not available"}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      Address:
                    </span>{" "}
                    {selectedOrder.deliveryAddress || "Not available"}
                  </p>
                </div>
              </section>
              <section className="rounded-2xl border border-border/70 bg-card/70 p-4">
                <h3 className="mb-3 font-semibold">Order summary</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Type:</span>{" "}
                    {selectedOrder.orderType}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      Quantity:
                    </span>{" "}
                    {selectedOrder.quantity}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Amount:</span>{" "}
                    ₹{selectedOrder.amount.toLocaleString("en-IN")}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Status:</span>{" "}
                    {statusLabels[selectedOrder.orderStatus]}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Notes:</span>{" "}
                    {selectedOrder.notes || "—"}
                  </p>
                  {selectedOrder.orderStatus === "cancelled" && (
                    <>
                      <p>
                        <span className="font-medium text-foreground">
                          Cancelled by:
                        </span>{" "}
                        {selectedOrder.cancelledBy || "Unknown"}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">
                          Cancellation reason:
                        </span>{" "}
                        {selectedOrder.cancelReason || "No reason provided"}
                      </p>
                    </>
                  )}
                </div>
              </section>
              {selectedAssignment && selectedFranchiseId && (
                <section className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 to-orange-50/70 p-4 dark:border-border dark:from-rose-950/15 dark:to-orange-950/10 sm:col-span-2">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">Franchise assignment</h3>
                    <Badge
                      variant={
                        franchiseAssignmentVariants[
                          selectedAssignment.status
                        ] ?? "secondary"
                      }
                    >
                      {selectedAssignment.status}
                    </Badge>
                  </div>
                  <div className="grid gap-2 text-muted-foreground sm:grid-cols-2">
                    <p>
                      <span className="font-medium text-foreground">
                        Store:
                      </span>{" "}
                      {selectedFranchise?.name || "Franchise unavailable"}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        Manager:
                      </span>{" "}
                      {selectedFranchise?.managerName || "Not available"}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        Phone:
                      </span>{" "}
                      {selectedFranchise?.phone || "Not available"}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        Email:
                      </span>{" "}
                      {selectedFranchise?.email || "Not available"}
                    </p>
                    {selectedFranchise?.address && (
                      <p className="sm:col-span-2">
                        <span className="font-medium text-foreground">
                          Address:
                        </span>{" "}
                        {selectedFranchise.address}
                      </p>
                    )}
                    <p>
                      <span className="font-medium text-foreground">
                        Assigned:
                      </span>{" "}
                      {selectedAssignment.assignedAt
                        ? new Date(
                            selectedAssignment.assignedAt,
                          ).toLocaleString()
                        : "Not available"}
                    </p>
                  </div>
                </section>
              )}
              <section className="rounded-2xl border border-border/70 bg-card/70 p-4 sm:col-span-2">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-semibold">Products</h3>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    {selectedOrder.items.length} line items
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 last:border-border/60"
                    >
                      <span>{item.name || `Product ${index + 1}`}</span>
                      <span className="whitespace-nowrap text-muted-foreground">
                        {item.quantity} × ₹{item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Accept/Delivered */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <DialogContent className="rounded-[1.75rem] border-rose-100 p-5 shadow-2xl shadow-rose-950/10 sm:max-w-lg sm:p-7">
          <DialogHeader className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4 pr-10 dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card">
            <DialogTitle className="text-lg font-bold tracking-tight">
              Confirm Status Change
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status of order{" "}
              <span className="font-mono font-semibold">
                {confirmDialog.orderNumber}
              </span>{" "}
              to{" "}
              <span className="font-semibold">{confirmDialog.newStatus}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row">
            <Button
              variant="outline"
              disabled={isUpdating}
              onClick={() =>
                setConfirmDialog({ ...confirmDialog, open: false })
              }
              className="w-full rounded-xl sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatusChange}
              disabled={isUpdating}
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:brightness-105 sm:w-auto"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog with Reason */}
      <Dialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog({ ...cancelDialog, open })}
      >
        <DialogContent className="rounded-[1.75rem] border-rose-100 p-5 shadow-2xl shadow-rose-950/10 sm:max-w-lg sm:p-7">
          <DialogHeader className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4 pr-10 dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card">
            <DialogTitle className="text-lg font-bold tracking-tight">
              Cancel Order
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling order{" "}
              <span className="font-mono font-semibold">
                {cancelDialog.orderNumber}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Cancel Reason*</Label>
              <Textarea
                id="cancelReason"
                placeholder="Enter reason for cancellation..."
                value={cancelDialog.reason}
                onChange={(e) =>
                  setCancelDialog({ ...cancelDialog, reason: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row">
            <Button
              variant="outline"
              disabled={isUpdating}
              onClick={() =>
                setCancelDialog({ ...cancelDialog, open: false, reason: "" })
              }
              className="w-full rounded-xl sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isUpdating}
              className="w-full rounded-xl sm:w-auto"
            >
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign / Reassign to Franchise Store */}
      <Dialog
        open={assignDialog.open}
        onOpenChange={(open) => setAssignDialog({ ...assignDialog, open })}
      >
        <DialogContent className="rounded-[1.75rem] border-rose-100 p-5 shadow-2xl shadow-rose-950/10 sm:max-w-lg sm:p-7">
          <DialogHeader className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4 pr-10 dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card">
            <DialogTitle className="text-lg font-bold tracking-tight">
              Assign to Franchise Store
            </DialogTitle>
            <DialogDescription>
              Choose a store to fulfill order{" "}
              <span className="font-mono font-semibold">
                {assignDialog.orderNumber}
              </span>
              . If this order was already assigned and rejected, this hands it
              to a different store instead.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-2xl border border-border/70 bg-card/70 p-4">
            <Label htmlFor="franchiseSelect">Store</Label>
            <Select
              value={assignDialog.selectedFranchiseId}
              onValueChange={(value) =>
                setAssignDialog({ ...assignDialog, selectedFranchiseId: value })
              }
            >
              <SelectTrigger
                id="franchiseSelect"
                className="h-11 w-full rounded-xl"
              >
                <SelectValue placeholder="Select a store" />
              </SelectTrigger>
              <SelectContent>
                {activeFranchises.map((franchise) => (
                  <SelectItem key={franchise.id} value={franchise.id}>
                    {franchise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row">
            <Button
              variant="outline"
              disabled={isUpdating}
              onClick={() => setAssignDialog({ ...assignDialog, open: false })}
              className="w-full rounded-xl sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAssign}
              disabled={isUpdating}
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:brightness-105 sm:w-auto"
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
