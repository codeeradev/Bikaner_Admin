import {
  type OrderListItem,
  type OrderStatus,
  type OrderType,
  orderService,
} from "@/api/services";
import { DataTable } from "@/components/DataTable";
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
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/hooks/use-alert";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, RefreshCw } from "lucide-react";
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

export function OrdersTable({
  orderType,
  searchPlaceholder,
  emptyMessage,
}: OrdersTableProps) {
  const alert = useAlert();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

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

  // Define columns with actions
  const orderColumns: ColumnDef<OrderListItem>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.getValue("orderNumber")}</span>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div>
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
        <Badge variant="outline" className="capitalize">
          {row.getValue("orderType")}
        </Badge>
      ),
    },
    { accessorKey: "productCount", header: "Products" },
    { accessorKey: "quantity", header: "Qty" },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) =>
        new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(Number(row.getValue("amount"))),
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus") as string;
        return (
          <Badge variant={paymentVariants[status] || "secondary"}>
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
          <Badge variant={orderVariants[status] || "secondary"}>
            {statusLabels[status] || status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) =>
        row.getValue("date")
          ? new Date(row.getValue("date")).toLocaleDateString()
          : "—",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const status = row.getValue("orderStatus") as OrderStatus;
        const isTerminal = status === "delivered" || status === "cancelled";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isTerminal || isUpdating}
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
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadOrders}
          disabled={isLoading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      <DataTable
        columns={orderColumns}
        data={orders}
        isLoading={isLoading}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
      />

      {/* Confirmation Dialog for Accept/Delivered */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status of order{" "}
              <span className="font-mono font-semibold">
                {confirmDialog.orderNumber}
              </span>{" "}
              to{" "}
              <span className="font-semibold">{confirmDialog.newStatus}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isUpdating}
              onClick={() =>
                setConfirmDialog({ ...confirmDialog, open: false })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmStatusChange} disabled={isUpdating}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling order{" "}
              <span className="font-mono font-semibold">
                {cancelDialog.orderNumber}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isUpdating}
              onClick={() =>
                setCancelDialog({ ...cancelDialog, open: false, reason: "" })
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isUpdating}
            >
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
