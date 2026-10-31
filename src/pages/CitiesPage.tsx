import { type ApiError, type City, cityService } from "@/api";
import { CityLocationPicker } from "@/components/CityLocationPicker";
import { DataTable } from "@/components/DataTable";
import { FormInput, FormSelect } from "@/components/FormComponents";
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
import type { ColumnDef } from "@tanstack/react-table";
import { Building2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface CityFormData {
  name: string;
  status: "active" | "inactive";
  lat: number | null;
  lng: number | null;
}

export function CitiesPage() {
  const alert = useAlert();
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<CityFormData>({
    defaultValues: {
      name: "",
      status: "active",
      lat: null,
      lng: null,
    },
  });
  const { handleSubmit, reset } = methods;

  // Fetch cities on mount
  useEffect(() => {
    fetchCities();
  }, []);

  // Show error alert when error changes
  useEffect(() => {
    if (error) {
      alert.error(error);
    }
  }, [error, alert]);

  const fetchCities = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await cityService.getCities({ page: 1, pageSize: 100 });
      setCities(response.data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to fetch cities");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCity(null);
    reset({
      name: "",
      status: "active",
      lat: null,
      lng: null,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (city: City) => {
    setEditingCity(city);
    reset({
      name: city.name,
      status: city.status,
      lat: city.lat ?? null,
      lng: city.lng ?? null,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: CityFormData) => {
    setIsSubmitting(true);
    const loadingId = alert.loading(
      editingCity ? "Updating city..." : "Creating city...",
    );

    try {
      if (editingCity) {
        await cityService.updateCity(editingCity.id, {
          name: data.name,
          status: data.status,
          lat: data.lat,
          lng: data.lng,
        });
        alert.removeAlert(loadingId);
        alert.success("City updated successfully");
      } else {
        await cityService.createCity({
          name: data.name,
          status: data.status,
          lat: data.lat,
          lng: data.lng,
        });
        alert.removeAlert(loadingId);
        alert.success("City created successfully");
      }
      setIsModalOpen(false);
      reset();
      await fetchCities();
    } catch (err) {
      alert.removeAlert(loadingId);
      alert.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (city: City) => {
    if (!city || !city.id) {
      alert.error("Cannot delete: Invalid city data (missing ID)");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${city.name}"?`)) return;

    const loadingId = alert.loading("Deleting city...");

    try {
      await cityService.deleteCity(city.id);
      alert.removeAlert(loadingId);
      alert.success("City deleted successfully");
      await fetchCities();
    } catch (err) {
      alert.removeAlert(loadingId);
      alert.error(err instanceof Error ? err.message : "Failed to delete city");
    }
  };

  const columns: ColumnDef<City>[] = [
    {
      accessorKey: "name",
      header: "City",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
          </div>
        </div>
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
      accessorKey: "coordinates",
      header: "Map center",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-rose-500" />
          {row.original.lat != null && row.original.lng != null
            ? `${row.original.lat.toFixed(5)}, ${row.original.lng.toFixed(5)}`
            : "Not set"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <PermissionGuard permission={PERMISSIONS.CITIES_EDIT} hideOnDenied>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditModal(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.CITIES_DELETE} hideOnDenied>
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
        title="Cities"
        description="Manage service cities and their map centers."
        className="rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 px-5 py-5 shadow-sm dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card"
      >
        <PermissionGuard permission={PERMISSIONS.CITIES_CREATE} hideOnDenied>
          <Button onClick={openAddModal} className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm hover:brightness-105">
            <Plus className="h-4 w-4 mr-2" />
            Add City
          </Button>
        </PermissionGuard>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading cities...</div>
        </div>
      ) : (
        <div>
          <DataTable
            columns={columns}
            data={cities}
            emptyMessage="No cities found"
          />
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[1.75rem] border-rose-100 p-5 shadow-2xl shadow-rose-950/10 sm:max-w-3xl sm:p-7">
          <DialogHeader className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4 pr-10 dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight">{editingCity ? "Edit city" : "Add city"}</DialogTitle>
                <p className="mt-1 text-xs text-muted-foreground">Choose the city center on the map so delivery zones can use it.</p>
              </div>
            </div>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
              <section className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
                <div>
                  <h3 className="text-sm font-semibold">City details</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Set its display name and whether it is available for delivery.</p>
                </div>
              <FormInput
                name="name"
                label="City Name"
                placeholder="Enter city name"
              />
              <FormSelect
                name="status"
                label="Status"
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
              </section>
              <section className="space-y-3 rounded-2xl border border-orange-100 bg-orange-50/25 p-4 dark:border-border dark:bg-muted/10 sm:p-5">
                <div>
                  <h3 className="text-sm font-semibold">City map center</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Search for the city or move the pin to its center.</p>
                </div>
              <CityLocationPicker />
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
                    : editingCity
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
