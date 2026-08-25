import { PageHeader } from "@/components/PageHeader";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { motion } from "motion/react";

export function NormalOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Orders"
        description="Customer purchase orders"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <OrdersTable
          orderType="normal"
          searchPlaceholder="Search customer orders..."
          emptyMessage="No customer orders found"
        />
      </motion.div>
    </div>
  );
}
