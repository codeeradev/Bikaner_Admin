import {
  type City,
  type CreateFranchiseDto,
  type Franchise,
  type Zone,
  cityService,
  franchiseService,
  zoneService,
} from "@/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/DataTable";
import {
  FormCheckbox,
  FormInput,
  FormSelect,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAlert } from "@/hooks/use-alert";
import { PERMISSIONS } from "@/lib/permissions";
import { type FranchiseFormData, franchiseSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, PauseCircle, Pencil, PlayCircle, Plus, Store, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

const EMPTY_FORM_VALUES: FranchiseFormData = {
  name: "",
  address: "",
  cityId: "",
  zoneId: "",
  lat: "",
  lng: "",
  managerName: "",
  email: "",
  password: "",
  phone: "",
  status: "active",
};

export function RegisteredFranchisePage() {
  const alert = useAlert();
  const navigate = useNavigate();

  // -- Table data --------------------------------------------------------
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all",
  );

  // -- Lookups for the City/Zone columns + form dropdowns -----------------
  const [cities, setCities] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  // -- Add/Edit modal ------------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Edit mode hides the password field behind this toggle so a blank
  // field can never accidentally wipe the manager's login (see B2's
  // UpdateFranchiseDto note) — it's local UI state, not form data.
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // -- Delete confirmation ---------------------------------------------
  // Holding the franchise itself (not just an id) lets the confirmation
  // dialog show the store's name without a second lookup.
  const [deletingFranchise, setDeletingFranchise] = useState<Franchise | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const methods = useForm<FranchiseFormData>({
    resolver: zodResolver(franchiseSchema),
    defaultValues: EMPTY_FORM_VALUES,
  });
  const { handleSubmit, reset, setError } = methods;

  useEffect(() => {
    fetchFranchises();
  }, [statusFilter]);

  useEffect(() => {
    fetchLookups();
  }, []);

  /** Loads the store list, scoped to the current status filter. */
  async function fetchFranchises() {
    setIsLoading(true);
    try {
      const response = await franchiseService.getFranchises({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 100, // list is small enough to load in one page; DataTable's
        // built-in search box handles free-text filtering client-side
      });
      setFranchises(response.data);
    } catch (err) {
      alert.error(
        err instanceof Error ? err.message : "Failed to fetch franchise stores",
      );
    } finally {
      setIsLoading(false);
    }
  }

  /** Loads cities + zones once, used for both the City column and the
   *  Add/Edit form's dropdowns. */
  async function fetchLookups() {
    try {
      const [cityRes, zoneRes] = await Promise.all([
        cityService.getCities({ page: 1, pageSize: 100 }),
        zoneService.getZones({ page: 1, pageSize: 100 }),
      ]);
      setCities(cityRes.data);
      setZones(zoneRes.data);
    } catch (err) {
      alert.error(
        err instanceof Error ? err.message : "Failed to fetch cities/zones",
      );
    }
  }

  function resolveCityName(cityId: Franchise["cityId"]): string {
    const id = typeof cityId === "string" ? cityId : cityId?._id;
    return cities.find((city) => city.id === id)?.name ?? "-";
  }

  function openAddModal() {
    setEditingFranchise(null);
    setIsResettingPassword(false);
    reset(EMPTY_FORM_VALUES);
    setIsModalOpen(true);
  }

  function openEditModal(franchise: Franchise) {
    setEditingFranchise(franchise);
    setIsResettingPassword(false);
    reset({
      name: franchise.name,
      address: franchise.address,
      cityId:
        typeof franchise.cityId === "string"
          ? franchise.cityId
          : franchise.cityId._id,
      zoneId:
        typeof franchise.zoneId === "string"
          ? franchise.zoneId
          : franchise.zoneId._id,
      lat: franchise.lat.toString(),
      lng: franchise.lng.toString(),
      managerName: franchise.managerName,
      email: franchise.email,
      password: "",
      phone: franchise.phone,
      status: franchise.status,
    });
    setIsModalOpen(true);
  }

  async function onSubmit(data: FranchiseFormData) {
    // Password is only required when creating a new store, or when the
    // admin has explicitly opted into resetting an existing manager's
    // login — both are UI toggles the zod schema has no visibility
    // into, so that half of the "required" rule is enforced here.
    const passwordRequired = !editingFranchise || isResettingPassword;
    if (passwordRequired && !data.password) {
      setError("password", { type: "manual", message: "Password is required" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingFranchise) {
        await franchiseService.updateFranchise(editingFranchise.id, {
          name: data.name,
          address: data.address,
          cityId: data.cityId,
          zoneId: data.zoneId,
          lat: Number.parseFloat(data.lat),
          lng: Number.parseFloat(data.lng),
          managerName: data.managerName,
          email: data.email,
          phone: data.phone,
          // Only send a password when the admin explicitly opted in —
          // an empty field must never reach the API.
          ...(isResettingPassword && data.password
            ? { password: data.password }
            : {}),
        });
        alert.success("Franchise store updated successfully");
      } else {
        const createData: CreateFranchiseDto = {
          name: data.name,
          address: data.address,
          cityId: data.cityId,
          zoneId: data.zoneId,
          lat: Number.parseFloat(data.lat),
          lng: Number.parseFloat(data.lng),
          managerName: data.managerName,
          email: data.email,
          // Non-empty guaranteed by the passwordRequired check above —
          // the fallback only satisfies TypeScript, it never actually runs.
          password: data.password ?? "",
          phone: data.phone,
        };
        await franchiseService.createFranchise(createData);
        alert.success("Franchise store created successfully");
      }
      setIsModalOpen(false);
      reset(EMPTY_FORM_VALUES);
      await fetchFranchises();
    } catch (err) {
      alert.error(
        err instanceof Error ? err.message : "Failed to save franchise store",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /** Toggles a store between active/inactive without removing it —
   *  distinct from the actual Delete action below. */
  async function handleToggleStatus(franchise: Franchise) {
    const nextStatus = franchise.status === "active" ? "inactive" : "active";
    const confirmed = confirm(
      `Are you sure you want to mark "${franchise.name}" as ${nextStatus}?`,
    );
    if (!confirmed) return;

    try {
      await franchiseService.setFranchiseStatus(franchise.id, nextStatus);
      alert.success(`Store marked as ${nextStatus}`);
      await fetchFranchises();
    } catch (err) {
      alert.error(
        err instanceof Error ? err.message : "Failed to update store status",
      );
    }
  }

  /** Confirms + permanently deletes a store. The backend hard-deletes
   *  the franchise document along with its inventory and notification
   *  history — this cannot be undone, which is why the confirmation
   *  dialog spells that out before this ever fires. */
  async function handleDeleteFranchise() {
    if (!deletingFranchise) return;
    setIsDeleting(true);
    try {
      await franchiseService.deleteFranchise(deletingFranchise.id);
      alert.success(`"${deletingFranchise.name}" was deleted`);
      setDeletingFranchise(null);
      await fetchFranchises();
    } catch (err) {
      alert.error(
        err instanceof Error ? err.message : "Failed to delete franchise store",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: ColumnDef<Franchise>[] = [
    {
      accessorKey: "name",
      header: "Store",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Store className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.email}
            </div>
          </div>
        </div>
      ),
    },
    { accessorKey: "managerName", header: "Manager" },
    {
      id: "city",
      header: "City",
      cell: ({ row }) => <span>{resolveCityName(row.original.cityId)}</span>,
    },
    {
      accessorKey: "productCount",
      header: "Products",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.productCount ?? 0}</span>
      ),
    },
    {
      accessorKey: "pendingOrders",
      header: "Pending Orders",
      cell: ({ row }) => {
        const pending = row.original.pendingOrders ?? 0;
        return (
          <Badge variant={pending > 0 ? "default" : "secondary"}>
            {pending}
          </Badge>
        );
      },
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
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-ocid={`registered_franchise.view_button.${row.index + 1}`}
                onClick={() =>
                  navigate({
                    to: "/franchise/$slug",
                    params: { slug: row.original.slug },
                  })
                }
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View store</TooltipContent>
          </Tooltip>
          <PermissionGuard permission={PERMISSIONS.FRANCHISE_EDIT} hideOnDenied>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-ocid={`registered_franchise.edit_button.${row.index + 1}`}
                  onClick={() => openEditModal(row.original)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit store</TooltipContent>
            </Tooltip>
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.FRANCHISE_EDIT} hideOnDenied>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-ocid={`registered_franchise.toggle_status_button.${row.index + 1}`}
                  onClick={() => handleToggleStatus(row.original)}
                >
                  {row.original.status === "active" ? (
                    <PauseCircle className="h-4 w-4" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {row.original.status === "active"
                  ? "Deactivate store"
                  : "Activate store"}
              </TooltipContent>
            </Tooltip>
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.FRANCHISE_DELETE} hideOnDenied>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-ocid={`registered_franchise.delete_button.${row.index + 1}`}
                  onClick={() => setDeletingFranchise(row.original)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete store</TooltipContent>
            </Tooltip>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registered Franchise"
        description="Active and suspended franchise store partners"
      >
        <PermissionGuard permission={PERMISSIONS.FRANCHISE_CREATE} hideOnDenied>
          <Button onClick={openAddModal} data-ocid="registered_franchise.add_button">
            <Plus className="h-4 w-4 mr-2" />
            Add Franchise
          </Button>
        </PermissionGuard>
      </PageHeader>

      <Select
        value={statusFilter}
        onValueChange={(value) =>
          setStatusFilter(value as "all" | "active" | "inactive")
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <DataTable
        columns={columns}
        data={franchises}
        isLoading={isLoading}
        searchPlaceholder="Search by store, manager, or email..."
        emptyMessage="No franchise stores found"
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFranchise ? "Edit Franchise Store" : "Add Franchise Store"}
            </DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormInput name="name" label="Store Name" placeholder="e.g. Sector 15 Store" />
              <FormInput name="address" label="Address" placeholder="Full store address" />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  name="cityId"
                  label="City"
                  options={cities.map((city) => ({ value: city.id, label: city.name }))}
                  placeholder="Select a city"
                />
                <FormSelect
                  name="zoneId"
                  label="Zone"
                  options={zones.map((zone) => ({ value: zone.id, label: zone.name }))}
                  placeholder="Select a zone"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput name="lat" label="Latitude" type="number" step="any" />
                <FormInput name="lng" label="Longitude" type="number" step="any" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInput name="managerName" label="Manager Name" />
                <FormInput name="phone" label="Manager Phone" />
              </div>
              <FormInput name="email" label="Manager Email" type="email" />

              {editingFranchise ? (
                <>
                  <FormCheckbox
                    name="__resetPasswordToggle__"
                    label="Reset manager password"
                    description="Leave unchecked to keep the current password"
                  />
                  {/* FormCheckbox is wired to react-hook-form, but we only
                      need its on/off state locally — mirror it here rather
                      than submit a throwaway field. */}
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isResettingPassword}
                    onChange={(e) => setIsResettingPassword(e.target.checked)}
                    ref={() => {}}
                  />
                  {isResettingPassword && (
                    <FormInput name="password" label="New Password" type="password" />
                  )}
                </>
              ) : (
                <FormInput name="password" label="Password" type="password" />
              )}

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
                    : editingFranchise
                      ? "Update"
                      : "Create"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingFranchise}
        onOpenChange={(open) => {
          if (!open) setDeletingFranchise(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete franchise store?</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to permanently delete{" "}
              <span className="font-medium text-foreground">
                "{deletingFranchise?.name}"
              </span>
              . This will remove the store, its manager login, and its
              entire product catalog and notification history from the
              database. <span className="font-medium text-foreground">
                You will lose all of this store's data and this cannot
                be undone.
              </span>{" "}
              Past orders placed through this store will be kept for
              reporting, but will no longer show this store's details.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // keep the dialog open until the API call resolves
                handleDeleteFranchise();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
