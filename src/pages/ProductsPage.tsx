import type { Product } from "@/api";
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
import { type ProductFormData, productSchema } from "@/lib/validations";
import { useCategoryStore, useProductStore, useUIStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:9020";

export function ProductsPage() {
  const {
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    setSearchQuery,
    setStatusFilter,
    setCategoryFilter,
    getFilteredProducts,
    fetchProducts,
  } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { showDialog } = useUIStore();
  const alert = useAlert();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const methods = useForm({
    resolver: zodResolver(productSchema),
  });

  const { handleSubmit, reset } = methods;

  // Fetch products and categories on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Show error alert when error changes
  useEffect(() => {
    if (error) {
      alert.error(error);
    }
  }, [error, alert]);

  const openAddModal = () => {
    setEditingProduct(null);
    setImageFile(null);
    reset({
      name: "",
      categoryId: "",
      description: "",
      sku: "",
      unitValue: 0,
      unit: "kg",
      mrp: 0,
      sellingPrice: 0,
      bulkPrice: 0,
      stock: 0,
      minBulkQty: 0,
      isFeatured: false,
      status: "active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setImageFile(null);
    reset({
      name: product.name,
      categoryId: product.categoryId,
      description: product.description,
      sku: product.sku,
      unitValue: product.unitValue,
      unit: product.unit,
      mrp: product.mrp,
      sellingPrice: product.sellingPrice,
      bulkPrice: product.bulkPrice,
      stock: product.stock,
      minBulkQty: product.minBulkQty,
      isFeatured: product.isFeatured,
      status: product.status,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    const loadingId = alert.loading(
      editingProduct ? "Updating product..." : "Creating product...",
    );

    try {
      const productData: any = {
        ...data,
        image: imageFile,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        alert.removeAlert(loadingId);
        alert.success("Product updated successfully");
      } else {
        await addProduct(productData);
        alert.removeAlert(loadingId);
        alert.success("Product created successfully");
      }
      setIsModalOpen(false);
      reset();
      setImageFile(null);
    } catch (err) {
      alert.removeAlert(loadingId);
      alert.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (product: Product) => {
    showDialog({
      title: "Delete Product",
      description: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        const loadingId = alert.loading("Deleting product...");
        try {
          await deleteProduct(product.id);
          alert.removeAlert(loadingId);
          alert.success("Product deleted successfully");
        } catch (err) {
          alert.removeAlert(loadingId);
          alert.error(
            err instanceof Error ? err.message : "Failed to delete product",
          );
        }
      },
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            {row.original.image ? (
              <img
                src={`${API_BASE}${row.original.image}`}
                alt={row.original.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.sku || "No SKU"}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.original.category?.name || "N/A",
    },
    {
      accessorKey: "mrp",
      header: "MRP",
      cell: ({ row }) => (row.original.mrp ? `₹${row.original.mrp}` : "N/A"),
    },
    {
      accessorKey: "sellingPrice",
      header: "Selling Price",
      cell: ({ row }) =>
        row.original.sellingPrice ? `₹${row.original.sellingPrice}` : "N/A",
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => row.original.stock ?? "N/A",
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
          <PermissionGuard permission={PERMISSIONS.PRODUCTS_EDIT} hideOnDenied>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditModal(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard
            permission={PERMISSIONS.PRODUCTS_DELETE}
            hideOnDenied
          >
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

  const filteredProducts = getFilteredProducts();
  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Manage your product catalog">
        <PermissionGuard permission={PERMISSIONS.PRODUCTS_CREATE} hideOnDenied>
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </PermissionGuard>
      </PageHeader>

      <div className="flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search products..."
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Categories</option>
          {categoryOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={() => fetchProducts()}>
          Search
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading products...</div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredProducts}
          emptyMessage="No products found"
        />
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  name="name"
                  label="Product Name"
                  placeholder="Enter product name"
                />
                <FormInput name="sku" label="SKU" placeholder="PROD-001" />
              </div>
              <FormSelect
                name="categoryId"
                label="Category"
                options={categoryOptions}
                placeholder="Select category"
              />
              <FormTextarea
                name="description"
                label="Description"
                placeholder="Enter product description"
              />
              <div className="grid grid-cols-3 gap-4">
                <FormInput name="mrp" label="MRP" type="number" step="0.01" />
                <FormInput
                  name="sellingPrice"
                  label="Selling Price"
                  type="number"
                  step="0.01"
                />
                <FormInput
                  name="bulkPrice"
                  label="Bulk Price"
                  type="number"
                  step="0.01"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormInput
                  name="unitValue"
                  label="Unit Value"
                  type="number"
                  step="0.01"
                />
                <FormInput
                  name="unit"
                  label="Unit"
                  placeholder="kg, ltr, pcs"
                />
                <FormInput name="stock" label="Stock" type="number" />
              </div>
              <FormInput
                name="minBulkQty"
                label="Minimum Bulk Quantity"
                type="number"
              />
              <div>
                <label className="block text-sm font-medium mb-2">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                {editingProduct?.image && !imageFile && (
                  <div className="mt-2">
                    <img
                      src={`${API_BASE}${editingProduct.image}`}
                      alt="Current"
                      className="h-20 w-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...methods.register("isFeatured")}
                  className="h-4 w-4"
                />
                <label className="text-sm">Featured Product</label>
              </div>
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
                    : editingProduct
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
