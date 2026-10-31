import { PageHeader } from "@/components/PageHeader";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { motion } from "motion/react";

export function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Manage all customer and franchise order activity."
        className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-orange-50/80 to-amber-50 px-5 py-5 shadow-sm dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:px-6"
      />
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
