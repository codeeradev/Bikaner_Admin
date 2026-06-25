import { DataTable } from "@/components/DataTable";
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/FormComponents";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type ProductFormData, productSchema } from "@/lib/validations";
import { useCategoryStore, useProductStore, useUIStore } from "@/store";
import type { Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

export function ProductsPage() {
  const {
    products: _products,
    addProduct,
    updateProduct,
    deleteProduct,
    setSearchQuery,
    setStatusFilter,
    setCategoryFilter,
    getFilteredProducts,
  } = useProductStore();
  const { categories } = useCategoryStore();
  const { showDialog } = useUIStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });
  const { handleSubmit, reset } = methods;

  const openAddModal = () => {
    setEditingProduct(null);
    reset({
      name: "",
      sku: "",
      categoryId: "",
      description: "",
      userPrice: 0,
      franchisePrice: 0,
      bulkPrice: 0,
      minOrder: 1,
      maxOrder: 100,
      status: "active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      description: product.description,
      userPrice: product.userPrice,
      franchisePrice: product.franchisePrice,
      bulkPrice: product.bulkPrice,
      minOrder: product.minOrder,
      maxOrder: product.maxOrder,
      status: product.status,
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: ProductFormData) => {
    const category = categories.find((c) => c.id === data.categoryId);
    const productData = { ...data, categoryName: category?.name || "" };
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setIsModalOpen(false);
    reset();
  };

  const handleDelete = (product: Product) => {
    showDialog({
      title: "Delete Product",
      description: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
      onConfirm: () => deleteProduct(product.id),
    });
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.sku}
            </div>
          </div>
        </div>
      ),
    },
    { accessorKey: "categoryName", header: "Category" },
    {
      accessorKey: "userPrice",
      header: "User Price",
      cell: ({ row }) => `$${Number(row.getValue("userPrice")).toFixed(2)}`,
    },
    {
      accessorKey: "franchisePrice",
      header: "Franchise Price",
      cell: ({ row }) =>
        `$${Number(row.getValue("franchisePrice")).toFixed(2)}`,
    },
    {
      accessorKey: "bulkPrice",
      header: "Bulk Price",
      cell: ({ row }) => `$${Number(row.getValue("bulkPrice")).toFixed(2)}`,
    },
    { accessorKey: "minOrder", header: "Min Order" },
    { accessorKey: "maxOrder", header: "Max Order" },
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
            data-ocid={`product.edit_button.${row.index + 1}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original)}
            data-ocid={`product.delete_button.${row.index + 1}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
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
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        action={{ label: "Add Product", icon: Plus, onClick: openAddModal }}
      />

      <div className="flex items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Search products..."
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          data-ocid="product.search_input"
        />
        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          data-ocid="product.status_filter"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          data-ocid="product.category_filter"
        >
          <option value="all">All Categories</option>
          {categoryOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filteredProducts}
        emptyMessage="No products found"
      />

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
                <FormInput
                  name="userPrice"
                  label="User Price"
                  type="number"
                  step="0.01"
                />
                <FormInput
                  name="franchisePrice"
                  label="Franchise Price"
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
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  name="minOrder"
                  label="Minimum Order"
                  type="number"
                />
                <FormInput
                  name="maxOrder"
                  label="Maximum Order"
                  type="number"
                />
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
                >
                  Cancel
                </Button>
                <Button type="submit" data-ocid="product.submit_button">
                  {editingProduct ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}
