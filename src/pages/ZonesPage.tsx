import {
  type ApiError,
  type City,
  type Zone,
  cityService,
  zoneService,
} from "@/api";
import { DataTable } from "@/components/DataTable";
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/FormComponents";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAlert } from "@/hooks/use-alert";
import { PERMISSIONS } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";
import { ZoneLocationPicker } from "@/components/ZoneLocationPicker";
import type { ColumnDef } from "@tanstack/react-table";
import { LocateFixed, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface ZoneFormData {
  name: string;
  description?: string;
  deliveryCharge: string;
  minimumOrderAmount: string;
  status: "active" | "inactive";
  cityId: string;
  lat: number | null;
  lng: number | null;
  locationLabel: string;
}

export function ZonesPage() {
  const alert = useAlert();
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);

  const methods = useForm<ZoneFormData>({
    defaultValues: {
      name: "",
      description: "",
      deliveryCharge: "",
      minimumOrderAmount: "",
      status: "active",
      cityId: "",
      lat: null,
      lng: null,
      locationLabel: "",
    },
  });
  const { handleSubmit, reset } = methods;

  // Fetch zones on mount
  useEffect(() => {
    fetchZones();
  }, []);

  // Fetch cities (used to populate the City dropdown) on mount
  useEffect(() => {
    fetchCities();
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

  const fetchCities = async () => {
    setIsCitiesLoading(true);

    try {
      const response = await cityService.getCities({ page: 1, pageSize: 100 });
      setCities(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      alert.error(apiError.message || "Failed to fetch cities");
    } finally {
      setIsCitiesLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingZone(null);
    reset({
      name: "",
      description: "",
      deliveryCharge: "",
      minimumOrderAmount: "",
      status: "active",
      cityId: "",
      lat: null,
      lng: null,
      locationLabel: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (zone: Zone) => {
    setEditingZone(zone);
    reset({
      name: zone.name,
      description: zone.description || "",
      deliveryCharge: zone.deliveryCharge.toString(),
      minimumOrderAmount: zone.minimumOrderAmount.toString(),
      status: zone.status,
      cityId: zone.cityId?._id ?? "",
      lat: zone.lat ?? null,
      lng: zone.lng ?? null,
      locationLabel: zone.locationLabel ?? "",
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ZoneFormData) => {
    if (
      data.lat == null || data.lng == null ||
      !Number.isFinite(data.lat) || !Number.isFinite(data.lng) ||
      data.lat < -90 || data.lat > 90 || data.lng < -180 || data.lng > 180
    ) {
      alert.error("Choose a valid zone location on the map or enter its coordinates.");
      return;
    }

    setIsSubmitting(true);
    try {
      const zoneData = {
        name: data.name,
        description: data.description,
        deliveryCharge: Number.parseFloat(data.deliveryCharge),
        minimumOrderAmount: Number.parseFloat(data.minimumOrderAmount),
        status: data.status,
        cityId: data.cityId || null,
        lat: data.lat,
        lng: data.lng,
        locationLabel: data.locationLabel,
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
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-2 text-sm">
          <MapPin className="h-3.5 w-3.5 text-rose-500" />
          {row.original.cityId?.name ?? "-"}
        </span>
      ),
    },
    {
      accessorKey: "locationLabel",
      header: "Map location",
      cell: ({ row }) => (
        <div className="max-w-56">
          <p className="truncate text-sm font-medium">{row.original.locationLabel || "Pinned location"}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {row.original.lat != null && row.original.lng != null
              ? `${row.original.lat.toFixed(5)}, ${row.original.lng.toFixed(5)}`
              : "Coordinates not set"}
          </p>
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
      accessorKey: "minimumOrderAmount",
      header: "Min Order",
      cell: ({ row }) => (
        <span className="text-sm">₹{row.getValue("minimumOrderAmount")}</span>
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
        <div className="flex items-center justify-end gap-2">
          <PermissionGuard permission={PERMISSIONS.ZONES_EDIT} hideOnDenied>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditModal(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.ZONES_DELETE} hideOnDenied>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(row.original)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery Zones"
        description="Set delivery areas, map pins, and charges for your customers."
        className="rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 px-5 py-5 shadow-sm dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card"
      >
        <PermissionGuard permission={PERMISSIONS.ZONES_CREATE} hideOnDenied>
          <Button onClick={openAddModal} className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm hover:brightness-105">
            <Plus className="h-4 w-4 mr-2" />
            Add Zone
          </Button>
        </PermissionGuard>
      </PageHeader>

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
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[1.75rem] border-rose-100 p-5 shadow-2xl shadow-rose-950/10 sm:max-w-3xl sm:p-7">
          <DialogHeader className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4 pr-10 dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20">
                <LocateFixed className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight">{editingZone ? "Edit delivery zone" : "Add delivery zone"}</DialogTitle>
                <p className="mt-1 text-xs text-muted-foreground">Set the service area, charges, and exact map pin.</p>
              </div>
            </div>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
              <section className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
                <div>
                  <h3 className="text-sm font-semibold">Zone details</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Name the area and select its city.</p>
                </div>
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
              <FormSelect
                name="cityId"
                label="City"
                options={cities.map((city) => ({
                  value: city.id,
                  label: city.name,
                }))}
                placeholder={
                  isCitiesLoading ? "Loading cities..." : "Select a city"
                }
              />
              </section>
              <section className="space-y-4 rounded-2xl border border-orange-100 bg-orange-50/25 p-4 dark:border-border dark:bg-muted/10 sm:p-5">
                <div>
                  <h3 className="text-sm font-semibold">Delivery charges</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Set the fee and minimum order amount for this zone.</p>
                </div>
              <FormInput
                name="deliveryCharge"
                label="Delivery Charge (₹)"
                placeholder="Enter delivery charge"
                type="number"
              />
              <FormInput
                name="minimumOrderAmount"
                label="Minimum Order Amount (₹)"
                placeholder="Enter minimum order amount"
                type="number"
              />
              </section>
              <ZoneLocationPicker cities={cities} />
              <section className="rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
              <FormSelect
                name="status"
                label="Status"
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
              </section>
              <div className="flex justify-end gap-2 border-t border-border/70 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-28 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm hover:brightness-105">
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
