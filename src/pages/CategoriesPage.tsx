import type { Category } from "@/api";
import { DataTable } from "@/components/DataTable";
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/FormComponents";
import { ManagementPageHeader } from "@/components/ManagementPageHeader";
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
import { type CategoryFormData, categorySchema } from "@/lib/validations";
import { useCategoryStore, useUIStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { ImageIcon, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export function CategoriesPage() {
  const {
    isLoading,
    error,
    searchQuery,
    statusFilter,
    total,
    addCategory,
    updateCategory,
    deleteCategory,
    setSearchQuery,
    setStatusFilter,
    getFilteredCategories,
    fetchCategories,
  } = useCategoryStore();
  const { showDialog } = useUIStore();
  const alert = useAlert();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });
  const { handleSubmit, reset } = methods;

  // Keep list filtering on the API, with a short pause while the user types.
  useEffect(() => {
    const timer = window.setTimeout(() => void fetchCategories(), 300);
    return () => window.clearTimeout(timer);
  }, [fetchCategories, statusFilter]);

  const { error: showError } = useAlert();

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const openAddModal = () => {
    setEditingCategory(null);
    setImagePreview("");
    reset({ name: "", description: "", status: "active" });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);

    reset({
      name: category.name,
      description: category.description,
      status: category.status,
    });

    setImagePreview(
      category.image
        ? /^https?:\/\//.test(category.image)
          ? category.image
          : `${API_BASE}${category.image}`
        : "",
    );
    setIsModalOpen(true);
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);

    const loadingId = alert.loading(
      editingCategory ? "Updating category..." : "Creating category...",
    );

    try {
      const payload = {
        name: data.name,
        description: data.description,
        status: data.status,
        image: data.image,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        alert.success("Category updated successfully");
      } else {
        await addCategory(payload);
        alert.success("Category created successfully");
      }

      alert.removeAlert(loadingId);

      setIsModalOpen(false);
      reset();
      setImagePreview("");
    } catch (err) {
      alert.removeAlert(loadingId);
      alert.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (category: Category) => {
    showDialog({
      title: "Delete Category",
      description: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        const loadingId = alert.loading("Deleting category...");
        try {
          await deleteCategory(category.id);
          alert.removeAlert(loadingId);
          alert.success("Category deleted successfully");
        } catch (err) {
          alert.removeAlert(loadingId);
          alert.error(
            err instanceof Error ? err.message : "Failed to delete category",
          );
        }
      },
    });
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Category",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg overflow-hidden border">
            {row.original.image ? (
              <img
                src={/^https?:\/\//.test(row.original.image) ? row.original.image : `${API_BASE}${row.original.image}`}
                alt={row.original.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground max-w-xs truncate">
          {row.getValue("description")}
        </span>
      ),
    },
    // Products count column hidden for now. Uncomment to show it again.
    // { accessorKey: "productCount", header: "Products" },
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
          <PermissionGuard
            permission={PERMISSIONS.CATEGORIES_EDIT}
            hideOnDenied
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditModal(row.original)}
              data-ocid={`category.edit_button.${row.index + 1}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard
            permission={PERMISSIONS.CATEGORIES_DELETE}
            hideOnDenied
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(row.original)}
              data-ocid={`category.delete_button.${row.index + 1}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  const filteredCategories = getFilteredCategories();

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        icon={Layers}
        title="Categories"
        description="Group your bakery products into clear, easy-to-browse collections."
      >
        <PermissionGuard
          permission={PERMISSIONS.CATEGORIES_CREATE}
          hideOnDenied
        >
          <Button onClick={openAddModal} className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/15 hover:brightness-105">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </PermissionGuard>
      </ManagementPageHeader>

      <DataTable
        columns={columns}
        data={filteredCategories}
        isLoading={isLoading}
        searchPlaceholder="Search categories by name or description..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        resultCount={searchQuery ? undefined : total}
        emptyMessage="No categories match these filters"
        toolbarContent={
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Filter categories by status"
            data-ocid="category.status_filter"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        }
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[1.75rem] border-rose-100 p-5 shadow-2xl shadow-rose-950/10 sm:max-w-xl sm:p-7">
          <DialogHeader className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4 pr-10 dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </DialogTitle>
                <p className="mt-1 text-xs text-muted-foreground">Organize products with a clear name, image, and visibility.</p>
              </div>
            </div>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
              <div className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
                <div>
                  <p className="text-sm font-semibold">Category details</p>
                  <p className="mt-1 text-xs text-muted-foreground">These details appear across the product catalog.</p>
                </div>
              <FormInput
                name="name"
                label="Category Name"
                placeholder="Enter category name"
              />
              <FormTextarea
                name="description"
                label="Description"
                placeholder="Enter description"
              />
              <div className="space-y-3 rounded-xl border border-dashed border-rose-200 bg-rose-50/40 p-4 dark:border-border dark:bg-muted/20">
                <label className="text-sm font-semibold">Category image</label>

                <div className="flex items-center gap-4">
                  <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        className="h-full w-full object-cover"
                        alt="Preview"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      id="category-image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        methods.setValue("image", file);

                        setImagePreview(URL.createObjectURL(file));
                      }}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl border-rose-200 bg-background hover:bg-rose-50"
                      onClick={() =>
                        document.getElementById("category-image")?.click()
                      }
                    >
                      Choose Image
                    </Button>

                    <p className="mt-2 text-xs text-muted-foreground">
                      JPG, PNG, or WEBP. Square images look best.
                    </p>
                  </div>
                </div>
              </div>
              <FormSelect
                name="status"
                label="Status"
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isSubmitting} className="min-w-28 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-md shadow-orange-500/20 hover:brightness-105">
                  {isSubmitting
                    ? "Saving..."
                    : editingCategory
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
