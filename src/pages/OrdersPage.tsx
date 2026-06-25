import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockRecentOrders } from "@/mock-data";
import type { Order } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { motion } from "motion/react";

const orderColumns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.getValue("id")}</span>
    ),
  },
  { accessorKey: "customerName", header: "Customer" },
  { accessorKey: "productCount", header: "Products" },
  { accessorKey: "quantity", header: "Quantity" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => `$${Number(row.getValue("amount")).toFixed(2)}`,
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const variants: Record<
        string,
        "default" | "secondary" | "destructive" | "outline"
      > = {
        paid: "default",
        pending: "secondary",
        failed: "destructive",
        refunded: "outline",
      };
      return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "orderStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("orderStatus") as string;
      const variants: Record<
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
      return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <Button variant="ghost" size="icon" data-ocid="orders.view_button">
        <Eye className="h-4 w-4" />
      </Button>
    ),
  },
];

export function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Manage all orders" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <DataTable
          columns={orderColumns}
          data={mockRecentOrders}
          searchPlaceholder="Search orders..."
        />
      </motion.div>
    </div>
  );
}
