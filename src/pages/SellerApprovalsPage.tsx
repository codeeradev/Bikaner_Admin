import {
  type SellerApplication,
  type SellerApplicationStatus,
  sellerApplicationService,
} from "@/api/services";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERMISSIONS } from "@/lib/permissions";
import { useUIStore } from "@/store";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, RefreshCw, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const statusVariants: Record<
  SellerApplicationStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

export function SellerApprovalsPage() {
  const { addToast } = useUIStore();
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<SellerApplicationStatus | "all">(
    "pending",
  );
  const [selectedApplication, setSelectedApplication] =
    useState<SellerApplication | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await sellerApplicationService.getApplications({
        status,
        limit: 100,
      });
      setApplications(response.data);
    } catch (error: any) {
      addToast({
        title: "Applications load failed",
        description: error.message || "Could not fetch seller applications.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast, status]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleConfirm = async () => {
    if (!selectedApplication || !action) return;

    setIsSubmitting(true);
    try {
      if (action === "approve") {
        await sellerApplicationService.approveApplication(
          selectedApplication.id,
        );
      } else {
        await sellerApplicationService.rejectApplication(
          selectedApplication.id,
          "Rejected by admin",
        );
      }

      addToast({
        title:
          action === "approve"
            ? "Seller approved"
            : "Seller application rejected",
        description: `${selectedApplication.name}'s application was updated.`,
        variant: "success",
      });
      setSelectedApplication(null);
      setAction(null);
      await loadApplications();
    } catch (error: any) {
      addToast({
        title: "Action failed",
        description: error.message || "Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<SellerApplication>[] = [
    {
      accessorKey: "name",
      header: "Applicant",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.mobile}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || "—",
    },
    {
      accessorKey: "gst",
      header: "GST",
      cell: ({ row }) => row.original.gst || "—",
    },
    {
      accessorKey: "cityId.name",
      header: "City",
      cell: ({ row }) => row.original.cityId?.name || "—",
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <span className="line-clamp-2">{row.original.address}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={statusVariants[row.original.status] || "secondary"}
          className="capitalize"
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Applied",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) =>
        row.original.status === "pending" ? (
          <PermissionGuard
            permission={PERMISSIONS.SELLER_APPROVALS_MANAGE}
            hideOnDenied
          >
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedApplication(row.original);
                  setAction("reject");
                }}
              >
                <X className="mr-1 h-4 w-4" />
                Reject
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setSelectedApplication(row.original);
                  setAction("approve");
                }}
              >
                <Check className="mr-1 h-4 w-4" />
                Approve
              </Button>
            </div>
          </PermissionGuard>
        ) : (
          <span className="text-sm text-muted-foreground">Reviewed</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seller Approvals"
        description="Review seller applications from the mobile app"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Select
            value={status}
            onValueChange={(value: SellerApplicationStatus | "all") =>
              setStatus(value)
            }
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadApplications}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={applications}
          isLoading={isLoading}
          searchPlaceholder="Search seller applications..."
          emptyMessage="No seller applications found"
        />
      </motion.div>

      <ConfirmDialog
        open={!!selectedApplication && !!action}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            setSelectedApplication(null);
            setAction(null);
          }
        }}
        title={
          action === "approve"
            ? "Approve seller application"
            : "Reject seller application"
        }
        description={
          action === "approve"
            ? `Approve ${selectedApplication?.name} as a seller?`
            : `Reject ${selectedApplication?.name}'s seller application?`
        }
        onConfirm={handleConfirm}
      />
    </div>
  );
}
