import { type ApiError, type Zone, zoneService } from "@/api";
import { DataTable } from "@/components/DataTable";
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/FormComponents";
import { PageHeader } from "@/components/PageHeader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAlert } from "@/hooks/use-alert";
import { useToast } from "@/hooks/use-toast";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface ZoneFormData {
  name: string;
  description?: string;
  deliveryCharge: string;
  minOrderAmount: string;
  status: "active" | "inactive";
}

export function ZonesPage() {
  const alert = useAlert();
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ZoneFormData>({
    defaultValues: {
      name: "",
      description: "",
      deliveryCharge: "",
      minOrderAmount: "",
      status: "active",
    },
  });
  const { handleSubmit, reset } = methods;

  // Fetch zones on mount
  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await zoneService.getZones({ page: 1, pageSize: 100 });
      setZones(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to fetch zones");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingZone(null);
    reset({
      name: "",
      description: "",
      deliveryCharge: "",
      minOrderAmount: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (zone: Zone) => {
    setEditingZone(zone);
    reset({
      name: zone.name,
      description: zone.description || "",
      deliveryCharge: zone.deliveryCharge.toString(),
      minOrderAmount: zone.minOrderAmount.toString(),
      status: zone.status,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ZoneFormData) => {
    setIsSubmitting(true);
    try {
      const zoneData = {
        name: data.name,
        description: data.description,
        deliveryCharge: Number.parseFloat(data.deliveryCharge),
        minOrderAmount: Number.parseFloat(data.minOrderAmount),
        status: data.status,
      };

      if (editingZone) {
        await zoneService.updateZone(editingZone.id, zoneData);
        alert.success("Zone updated successfully");
      } else {
        await zoneService.createZone(zoneData);
        alert.success("Zone created successfully");
      }
      setIsModalOpen(false);
      reset();
      await fetchZones();
    } catch (err) {
      alert.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (zone: Zone) => {
    if (!confirm(`Are you sure you want to delete "${zone.name}"?`)) return;

    try {
      await zoneService.deleteZone(zone.id);
      alert.success("Zone deleted successfully");
      await fetchZones();
    } catch (err) {
      alert.error(err instanceof Error ? err.message : "Failed to delete zone");
    }
  };

  const columns: ColumnDef<Zone>[] = [
    {
      accessorKey: "name",
      header: "Zone",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            {row.original.description && (
              <div className="text-xs text-muted-foreground">
                {row.original.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "deliveryCharge",
      header: "Delivery",
      cell: ({ row }) => (
        <span className="text-sm">₹{row.getValue("deliveryCharge")}</span>
      ),
    },
    {
      accessorKey: "minOrderAmount",
      header: "Min Order",
      cell: ({ row }) => (
        <span className="text-sm">₹{row.getValue("minOrderAmount")}</span>
      ),
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
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditModal(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery Zones"
        description="Manage delivery zones and charges"
        action={{ label: "Add Zone", icon: Plus, onClick: openAddModal }}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading zones...</div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={zones}
          emptyMessage="No zones found"
        />
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingZone ? "Edit Zone" : "Add Zone"}</DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormInput
                name="name"
                label="Zone Name"
                placeholder="Enter zone name"
              />
              <FormTextarea
                name="description"
                label="Description"
                placeholder="Enter description (optional)"
              />
              <FormInput
                name="deliveryCharge"
                label="Delivery Charge (₹)"
                placeholder="Enter delivery charge"
                type="number"
              />
              <FormInput
                name="minOrderAmount"
                label="Minimum Order Amount (₹)"
                placeholder="Enter minimum order amount"
                type="number"
              />
              <FormSelect
                name="status"
                label="Status"
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving..."
                    : editingZone
                      ? "Update"
                      : "Create"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
