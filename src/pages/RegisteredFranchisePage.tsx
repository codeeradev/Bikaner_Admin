import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockRecentFranchiseRequests } from "@/mock-data";
import type { FranchiseRequest } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, PauseCircle, PlayCircle } from "lucide-react";
import { motion } from "motion/react";

const registered = mockRecentFranchiseRequests
  .filter((r) => r.status === "approved")
  .map((r) => ({
    ...r,
    walletBalance: Math.floor(Math.random() * 50000) + 5000,
    ownerName: r.applicantName,
  }));

interface RegisteredFranchise {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  walletBalance: number;
  status: string;
}

const columns: ColumnDef<RegisteredFranchise>[] = [
  { accessorKey: "businessName", header: "Franchise Name" },
  { accessorKey: "ownerName", header: "Owner" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "address", header: "Address" },
  {
    accessorKey: "walletBalance",
    header: "Wallet Balance",
    cell: ({ row }) =>
      `$${Number(row.getValue("walletBalance")).toLocaleString()}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          data-ocid={`registered_franchise.view_button.${row.index + 1}`}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          data-ocid={`registered_franchise.suspend_button.${row.index + 1}`}
        >
          <PauseCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          data-ocid={`registered_franchise.activate_button.${row.index + 1}`}
        >
          <PlayCircle className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export function RegisteredFranchisePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Registered Franchise"
        description="Active and suspended franchise partners"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <DataTable
          columns={columns}
          data={registered}
          searchPlaceholder="Search registered franchise..."
        />
      </motion.div>
    </div>
  );
}
