import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockRecentFranchiseRequests } from "@/mock-data";
import type { FranchiseRequest } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Eye, XCircle } from "lucide-react";
import { motion } from "motion/react";

const requests = mockRecentFranchiseRequests.filter(
  (r) => r.status === "pending",
);

const columns: ColumnDef<FranchiseRequest>[] = [
  { accessorKey: "applicantName", header: "Applicant Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "address", header: "Address" },
  { accessorKey: "businessName", header: "Business Name" },
  {
    accessorKey: "requestDate",
    header: "Request Date",
    cell: ({ row }) =>
      new Date(row.getValue("requestDate")).toLocaleDateString(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <Badge variant="secondary">{status}</Badge>;
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
          data-ocid={`franchise_requests.view_button.${row.index + 1}`}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-success"
          data-ocid={`franchise_requests.approve_button.${row.index + 1}`}
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive"
          data-ocid={`franchise_requests.reject_button.${row.index + 1}`}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export function FranchiseRequestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Franchise Requests"
        description="Pending franchise applications awaiting approval"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <DataTable
          columns={columns}
          data={requests}
          searchPlaceholder="Search requests..."
        />
      </motion.div>
    </div>
  );
}
