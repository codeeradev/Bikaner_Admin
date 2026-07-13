import {
  type OrderListItem,
  type OrderType,
  orderService,
} from "@/api/services";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store";
import type { ColumnDef } from "@tanstack/react-table";
import { RefreshCw } from "lucide-react";
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
  delivered: "default",
  shipped: "default",
  confirmed: "secondary",
  processing: "secondary",
  packed: "outline",
  pending: "outline",
  cancelled: "destructive",
};

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
        <Badge variant={paymentVariants[status] || "secondary"}>{status}</Badge>
      );
    },
  },
  {
    accessorKey: "orderStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("orderStatus") as string;
      return (
        <Badge variant={orderVariants[status] || "secondary"}>{status}</Badge>
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
];

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
  const { addToast } = useUIStore();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await orderService.getOrders({
        limit: 100,
        ...(orderType ? { orderType } : {}),
      });
      setOrders(response.orders);
    } catch (error: any) {
      addToast({
        title: "Orders load failed",
        description: error.message || "Could not fetch orders.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast, orderType]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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
    </div>
  );
}
