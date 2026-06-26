import type { Category } from "@/api";
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
import { type CategoryFormData, categorySchema } from "@/lib/validations";
import { useCategoryStore, useUIStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

export function CategoriesPage() {
  const {
    isLoading,
    error,
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

  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });
  const { handleSubmit, reset } = methods;

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Show error alert when error changes
  useEffect(() => {
    if (error) {
      alert.error(error);
    }
  }, [error, alert]);

  const openAddModal = () => {
    setEditingCategory(null);
    reset({ name: "", slug: "", description: "", status: "active" });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description,
      status: category.status,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: CategoryFormData) => {
    console.log("🟢 CategoriesPage: Form submitted with data:", data);
    setIsSubmitting(true);
    const loadingId = alert.loading(
      editingCategory ? "Updating category..." : "Creating category...",
    );

    try {
      if (editingCategory) {
        console.log(
          "🟡 CategoriesPage: Updating category:",
          editingCategory.id,
        );
        await updateCategory(editingCategory.id, data);
        alert.removeAlert(loadingId);
        alert.success("Category updated successfully");
      } else {
        console.log("🟡 CategoriesPage: Creating new category");
        await addCategory(data);
        alert.removeAlert(loadingId);
        alert.success("Category created successfully");
      }
      console.log("✅ CategoriesPage: Operation completed successfully");
      setIsModalOpen(false);
      reset();
    } catch (err) {
      console.error("❌ CategoriesPage: Operation failed:", err);
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
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.slug}
            </div>
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
    { accessorKey: "productCount", header: "Products" },
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
          <PermissionGuard permission={PERMISSIONS.CATEGORIES_EDIT} hideOnDenied>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditModal(row.original)}
              data-ocid={`category.edit_button.${row.index + 1}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.CATEGORIES_DELETE} hideOnDenied>
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
      <PageHeader
        title="Categories"
        description="Manage product categories"
      >
        <PermissionGuard permission={PERMISSIONS.CATEGORIES_CREATE} hideOnDenied>
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </PermissionGuard>
      </PageHeader>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search categories..."
          onChange={(e) => {
            setSearchQuery(e.target.value);
            fetchCategories();
          }}
          className="max-w-sm h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          data-ocid="category.search_input"
        />
        <select
          onChange={(e) => {
            setStatusFilter(e.target.value);
            fetchCategories();
          }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          data-ocid="category.status_filter"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading categories...</div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredCategories}
          emptyMessage="No categories found"
        />
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormInput
                name="name"
                label="Category Name"
                placeholder="Enter category name"
              />
              <FormInput name="slug" label="Slug" placeholder="category-slug" />
              <FormTextarea
                name="description"
                label="Description"
                placeholder="Enter description"
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
                <Button
                  type="submit"
                  data-ocid="category.submit_button"
                  disabled={isSubmitting}
                >
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
