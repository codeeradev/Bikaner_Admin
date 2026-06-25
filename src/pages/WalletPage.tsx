import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockDashboardStats } from "@/mock-data";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";

interface Transaction {
  id: string;
  user: string;
  amount: number;
  type: "credit" | "debit";
  status: "completed" | "pending" | "failed";
  date: string;
}

const transactions: Transaction[] = [
  {
    id: "TXN-001",
    user: "John Smith",
    amount: 2500,
    type: "credit",
    status: "completed",
    date: "2024-06-18T10:30:00Z",
  },
  {
    id: "TXN-002",
    user: "Lisa Anderson",
    amount: 1200,
    type: "debit",
    status: "completed",
    date: "2024-06-18T09:15:00Z",
  },
  {
    id: "TXN-003",
    user: "Robert Taylor",
    amount: 5000,
    type: "credit",
    status: "pending",
    date: "2024-06-17T16:45:00Z",
  },
  {
    id: "TXN-004",
    user: "Maria Garcia",
    amount: 800,
    type: "debit",
    status: "failed",
    date: "2024-06-17T14:20:00Z",
  },
  {
    id: "TXN-005",
    user: "David Brown",
    amount: 3500,
    type: "credit",
    status: "completed",
    date: "2024-06-16T11:00:00Z",
  },
  {
    id: "TXN-006",
    user: "Jennifer Lee",
    amount: 1500,
    type: "debit",
    status: "completed",
    date: "2024-06-16T08:30:00Z",
  },
  {
    id: "TXN-007",
    user: "Christopher Martinez",
    amount: 4200,
    type: "credit",
    status: "completed",
    date: "2024-06-15T15:00:00Z",
  },
  {
    id: "TXN-008",
    user: "Amanda White",
    amount: 900,
    type: "debit",
    status: "pending",
    date: "2024-06-15T10:45:00Z",
  },
];

const transactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "Transaction ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.getValue("id")}</span>
    ),
  },
  { accessorKey: "user", header: "User" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const amount = Number(row.getValue("amount"));
      return (
        <span
          className={type === "credit" ? "text-success" : "text-destructive"}
        >
          {type === "credit" ? "+" : "-"}${amount.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant={type === "credit" ? "default" : "secondary"}>
          {type === "credit" ? (
            <ArrowDownLeft className="mr-1 h-3 w-3" />
          ) : (
            <ArrowUpRight className="mr-1 h-3 w-3" />
          )}
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants: Record<
        string,
        "default" | "secondary" | "destructive" | "outline"
      > = {
        completed: "default",
        pending: "secondary",
        failed: "destructive",
      };
      return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString(),
  },
];

export function WalletPage() {
  const stats = [
    {
      title: "Total Balance",
      value: `$${mockDashboardStats.walletBalance.toLocaleString()}`,
      icon: Wallet,
      description: "Available credit",
    },
    {
      title: "Total Credits",
      value: "$67,200",
      icon: CreditCard,
      trend: { value: 15.3, label: "from last month" },
    },
    {
      title: "Total Debits",
      value: "$21,970",
      icon: TrendingUp,
      trend: { value: -5.2, label: "from last month" },
    },
    {
      title: "Net Flow",
      value: "$45,230",
      icon: DollarSign,
      trend: { value: 8.7, label: "from last month" },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet"
        description="Manage wallet balances and transactions"
        action={{
          label: "Add Credit",
          icon: ArrowDownLeft,
          onClick: () => {},
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex justify-end gap-2"
      >
        <Button variant="outline" data-ocid="wallet.add_credit_button">
          <ArrowDownLeft className="mr-2 h-4 w-4" />
          Add Credit
        </Button>
        <Button variant="outline" data-ocid="wallet.add_debit_button">
          <ArrowUpRight className="mr-2 h-4 w-4" />
          Add Debit
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold mb-4">Transactions</h3>
        <DataTable
          columns={transactionColumns}
          data={transactions}
          searchPlaceholder="Search transactions..."
        />
      </motion.div>
    </div>
  );
}
