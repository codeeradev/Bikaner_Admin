import { type ApiError, type City, cityService } from "@/api";
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
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface CityFormData {
  name: string;
  status: "active" | "inactive";
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
    });
    setIsModalOpen(true);
  };

  const openEditModal = (city: City) => {
    setEditingCity(city);
    reset({
      name: city.name,
      status: city.status,
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
        });
        alert.removeAlert(loadingId);
        alert.success("City updated successfully");
      } else {
        await cityService.createCity({
          name: data.name,
          status: data.status,
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
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
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
        description="Manage cities"
      >
        <PermissionGuard permission={PERMISSIONS.CITIES_CREATE} hideOnDenied>
          <Button onClick={openAddModal}>
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
        <DataTable
          columns={columns}
          data={cities}
          emptyMessage="No cities found"
        />
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCity ? "Edit City" : "Add City"}</DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
