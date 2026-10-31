import {
  type City,
  type CreateFranchiseDto,
  type Franchise,
  type Zone,
  cityService,
  franchiseService,
  zoneService,
} from "@/api";
import { DataTable } from "@/components/DataTable";
import { FormInput, FormSelect } from "@/components/FormComponents";
import { FranchisePassword } from "@/components/FranchisePassword";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGuard } from "@/components/PermissionGuard";
import { ZoneLocationPicker } from "@/components/ZoneLocationPicker";
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
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { PERMISSIONS } from "@/lib/permissions";
import { type FranchiseFormData, franchiseSchema } from "@/lib/validations";
import { useAuthStore } from "@/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  LocateFixed,
  MapPin,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  Store,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const fetchSequence = useRef(0);
  useEffect(
    () => () => {
      fetchSequence.current++;
    },
    [],
  );
  const isSuperAdmin = useAuthStore((state) => state.user?.role === "Admin");
  const navigate = useNavigate();

  // -- Table data --------------------------------------------------------
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // -- Lookups for the City/Zone columns + form dropdowns -----------------
  const [cities, setCities] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);

  // -- Add/Edit modal ------------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // `fetchFranchises` reads this filter when constructing the API query.
  // biome-ignore lint/correctness/useExhaustiveDependencies: statusFilter changes the query loaded by fetchFranchises
  useEffect(() => {
    fetchFranchises();
  }, [statusFilter]);

  useEffect(() => {
    fetchLookups();
  }, []);

  /** Loads the store list, scoped to the current status filter. */
  useLiveRefresh(() => fetchFranchises(true));

  async function fetchFranchises(quiet = false) {
    const sequence = ++fetchSequence.current;
    if (!quiet) setIsLoading(true);
    try {
      const response = await franchiseService.getFranchises({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 100, // list is small enough to load in one page; DataTable's
        // built-in search box handles free-text filtering client-side
      });
      if (sequence === fetchSequence.current) setFranchises(response.data);
    } catch (err) {
      if (!quiet && sequence === fetchSequence.current)
        alert.error(
          err instanceof Error
            ? err.message
            : "Failed to fetch franchise stores",
        );
    } finally {
      if (sequence === fetchSequence.current) setIsLoading(false);
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

  function getZoneCityId(zone: Zone): string | undefined {
    const cityId = zone.cityId as
      | { id?: string; _id?: string }
      | string
      | null
      | undefined;
    return typeof cityId === "string" ? cityId : (cityId?.id ?? cityId?._id);
  }

  function handleZoneChange(zoneId: string) {
    const selectedZone = zones.find((zone) => zone.id === zoneId);
    if (!selectedZone) return;

    // Use the zone's configured map pin as the initial franchise pin.
    // The franchise can still fine-tune the location on the map afterward.
    if (selectedZone.lat != null && selectedZone.lng != null) {
      methods.setValue("lat", String(selectedZone.lat), {
        shouldDirty: true,
        shouldValidate: true,
      });
      methods.setValue("lng", String(selectedZone.lng), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    methods.setValue(
      "address",
      selectedZone.locationLabel?.trim() || selectedZone.name,
      { shouldDirty: true, shouldValidate: true },
    );
  }

  const selectedCityId = methods.watch("cityId");
  const cityZones = zones.filter((zone) => {
    const zoneCityId = getZoneCityId(zone);
    // Older zones may not have a city association; keep them selectable.
    return !zoneCityId || !selectedCityId || zoneCityId === selectedCityId;
  });

  function openAddModal() {
    setEditingFranchise(null);
    reset(EMPTY_FORM_VALUES);
    setIsModalOpen(true);
  }

  function openEditModal(franchise: Franchise) {
    setEditingFranchise(franchise);
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
    const passwordRequired = !editingFranchise;
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
    ...(isSuperAdmin
      ? [
          {
            id: "password",
            header: "Password",
            cell: ({ row }: { row: { original: Franchise } }) => (
              <FranchisePassword franchiseId={row.original.id} />
            ),
          },
        ]
      : []),
    {
      id: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="max-w-56">
          <p className="text-xs font-medium text-muted-foreground">
            {resolveCityName(row.original.cityId)}
          </p>
          <p className="truncate text-sm font-medium">{row.original.address}</p>
          <p className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 text-rose-500" />
            {row.original.lat.toFixed(5)}, {row.original.lng.toFixed(5)}
          </p>
        </div>
      ),
    },
    {
      id: "inventory",
      header: "Inventory",
      cell: ({ row }) => (
        <div className="min-w-24 space-y-1">
          <p className="font-semibold">
            {row.original.totalStock ?? 0}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              packs
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.productCount ?? 0} product types
          </p>
        </div>
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
          <PermissionGuard
            permission={PERMISSIONS.FRANCHISE_DELETE}
            hideOnDenied
          >
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
        description="Manage franchise stores, manager access, and delivery locations."
        className="rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 px-5 py-5 shadow-sm dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card"
      >
        <PermissionGuard permission={PERMISSIONS.FRANCHISE_CREATE} hideOnDenied>
          <Button
            onClick={openAddModal}
            data-ocid="registered_franchise.add_button"
            className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/15 hover:brightness-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Franchise
          </Button>
        </PermissionGuard>
      </PageHeader>

      <DataTable
        columns={columns}
        data={franchises}
        isLoading={isLoading}
        searchPlaceholder="Search by store, manager, or email..."
        emptyMessage="No franchise stores found"
        toolbarContent={
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | "active" | "inactive")
            }
          >
            <SelectTrigger className="h-10 w-44 rounded-xl bg-background">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[1.75rem] border-rose-100 p-5 shadow-2xl shadow-rose-950/10 sm:max-w-3xl sm:p-7">
          <DialogHeader className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4 pr-10 dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20">
                <LocateFixed className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight">
                  {editingFranchise
                    ? "Edit franchise store"
                    : "Add franchise store"}
                </DialogTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add store details, pin its delivery location, and enter the
                  manager's login details.
                </p>
              </div>
            </div>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
              <section className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
                <div>
                  <h3 className="text-sm font-semibold">Store details</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Choose the city and delivery zone for this store.
                  </p>
                </div>
                <FormInput
                  name="name"
                  label="Store Name"
                  placeholder="e.g. Sector 15 Store"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormSelect
                    name="cityId"
                    label="City"
                    options={cities.map((city) => ({
                      value: city.id,
                      label: city.name,
                    }))}
                    placeholder="Select a city"
                    triggerClassName="h-11 rounded-xl"
                    onValueChange={() =>
                      methods.setValue("zoneId", "", { shouldDirty: true })
                    }
                  />
                  <FormSelect
                    name="zoneId"
                    label="Zone"
                    options={cityZones.map((zone) => ({
                      value: zone.id,
                      label: zone.name,
                    }))}
                    placeholder="Select a zone"
                    triggerClassName="h-11 rounded-xl"
                    onValueChange={handleZoneChange}
                  />
                </div>
              </section>
              <ZoneLocationPicker cities={cities} locationMode="franchise" />

              <section className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
                <div>
                  <h3 className="text-sm font-semibold">Manager account</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter the contact and sign-in details for the franchise
                    manager.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput name="managerName" label="Manager Name" />
                  <FormInput name="phone" label="Manager Phone" />
                  <FormInput name="email" label="Manager Email" type="email" />
                  {!editingFranchise && (
                    <FormInput
                      name="password"
                      label="Password"
                      type="password"
                    />
                  )}
                </div>
              </section>
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
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-28 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/15 hover:brightness-105"
                >
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
        <AlertDialogContent className="rounded-3xl border-rose-100 p-6 shadow-2xl shadow-rose-950/10 sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold tracking-tight">
              Permanently delete franchise store?
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              You're about to permanently delete{" "}
              <span className="font-medium text-foreground">
                "{deletingFranchise?.name}"
              </span>
              . This will remove the store, its manager login, and its entire
              product catalog and notification history from the database.{" "}
              <span className="font-medium text-foreground">
                You will lose all of this store's data and this cannot be
                undone.
              </span>{" "}
              Past orders placed through this store will be kept for reporting,
              but will no longer show this store's details.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // keep the dialog open until the API call resolves
                handleDeleteFranchise();
              }}
              disabled={isDeleting}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
