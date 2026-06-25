import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockRecentFranchiseRequests } from "@/mock-data";
import type { FranchiseRequest } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Eye, XCircle } from "lucide-react";
import { motion } from "motion/react";

const franchiseColumns: ColumnDef<FranchiseRequest>[] = [
  { accessorKey: "applicantName", header: "Applicant" },
  { accessorKey: "businessName", header: "Business" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone" },
  {
    accessorKey: "requestDate",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.getValue("requestDate")).toLocaleDateString(),
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
        approved: "default",
        pending: "secondary",
        rejected: "destructive",
      };
      return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            data-ocid={`franchise.view_button.${row.index + 1}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-success"
                data-ocid={`franchise.approve_button.${row.index + 1}`}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                data-ocid={`franchise.reject_button.${row.index + 1}`}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      );
    },
  },
];

export function FranchisePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Franchise"
        description="Manage franchise registrations and requests"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <DataTable
          columns={franchiseColumns}
          data={mockRecentFranchiseRequests}
          searchPlaceholder="Search franchise..."
        />
      </motion.div>
    </div>
  );
}
