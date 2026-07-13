import { PageHeader } from "@/components/PageHeader";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { motion } from "motion/react";

export function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Manage all orders" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <OrdersTable
          searchPlaceholder="Search orders..."
          emptyMessage="No orders found"
        />
      </motion.div>
    </div>
  );
}
