import type { Product } from "@/api";
import { BulkPricingInput } from "@/components/BulkPricingInput";
import { DataTable } from "@/components/DataTable";
import {
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/FormComponents";
import { IngredientsInput } from "@/components/IngredientsInput";
import { NutritionValuesInput } from "@/components/NutritionValuesInput";
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
import { type ProductFormData, productSchema } from "@/lib/validations";
import { useCategoryStore, useProductStore, useUIStore } from "@/store";
import { productService } from "@/api/services/productService";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { Copy, FileSpreadsheet, ImageIcon, Info, Package, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:9020";

export function ProductsPage() {
  const {
    isLoading,
    error,
    searchQuery,
    statusFilter,
    categoryFilter,
    total,
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
  const [imagePreview, setImagePreview] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [csvImages, setCsvImages] = useState<File[]>([]);
  const [uploadedImagePaths, setUploadedImagePaths] = useState<string[]>([]);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const methods = useForm({
    resolver: zodResolver(productSchema) as any,
    mode: "onChange",
  });

  const { handleSubmit, reset } = methods;

  // Fetch categories once, and debounce API-backed product filters.
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timer = window.setTimeout(() => void fetchProducts(), 300);
    return () => window.clearTimeout(timer);
  }, [fetchProducts, statusFilter, categoryFilter]);

  // Show error alert when error changes
  useEffect(() => {
    if (error) {
      alert.error(error);
    }
  }, [error, alert]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const openAddModal = () => {
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview("");
    reset({
      name: "",
      categoryId: "",
      description: "",
      sku: "",
      unitValue: 0,
      unit: "kg",
      mrp: 0,
      sellingPrice: 0,
      bulkPricing: [],
      stock: 0,
      maxQuantity: null,
      isFeatured: false,
      status: "active",
      nutritionValues: {},
      ingredients: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setImageFile(null);
    setImagePreview(
      product.image
        ? /^https?:\/\//.test(product.image)
          ? product.image
          : `${API_BASE}${product.image}`
        : "",
    );
    
    // Extract categoryId - handle both string and object formats
    let categoryId = product.categoryId;
    if (typeof categoryId === "object" && categoryId !== null) {
      categoryId = (categoryId as any)._id || (categoryId as any).id || "";
    }
    
    // Handle both bulkPricing and bulkPrice field names from backend
    const bulkPricingData = product.bulkPricing || (product as any).bulkPrice || [];
    
    reset({
      name: product.name,
      categoryId: categoryId as string,
      description: product.description,
      sku: product.sku,
      unitValue: product.unitValue,
      unit: product.unit,
      mrp: product.mrp,
      sellingPrice: product.sellingPrice,
      bulkPricing: bulkPricingData,
      stock: product.stock,
      maxQuantity: product.maxQuantity || null,
      isFeatured: product.isFeatured,
      status: product.status,
      nutritionValues: product.nutritionValues || {},
      ingredients: product.ingredients || [],
    } as ProductFormData);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
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
      setImagePreview("");
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
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const importCsv = async () => {
    if (!csvFile) return alert.error("Choose a CSV file first");
    setIsImporting(true);
    try {
      const result = await productService.importProductsCsv(csvFile);
      await fetchProducts();
      setIsCsvDialogOpen(false);
      setCsvFile(null);
      if (result.errors.length) {
        alert.error(`${result.created} products imported. ${result.errors.length} row(s) need attention.`);
      } else {
        alert.success(`${result.created} products imported successfully`);
      }
    } catch (err) {
      alert.error(err instanceof Error ? err.message : "CSV import failed");
    } finally {
      setIsImporting(false);
    }
  };

  const uploadCsvImages = async () => {
    if (!csvImages.length) return alert.error("Choose one or more images first");
    setIsUploadingImages(true);
    try {
      const images = await productService.uploadProductImages(csvImages);
      setUploadedImagePaths(images.map((image) => image.path));
      setCsvImages([]);
      alert.success(`${images.length} image(s) uploaded. Copy a path into your CSV.`);
    } catch (err) {
      alert.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const copyImagePaths = async () => {
    await navigator.clipboard.writeText(uploadedImagePaths.join("\n"));
    alert.success("Image paths copied");
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
      cell: ({ row }) => {
        const category = row.original.category || row.original.categoryId;
        if (typeof category === "object" && category !== null) {
          return category.name || "N/A";
        }
        return "N/A";
      },
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
        <div className="flex items-center justify-end gap-2">
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
      <ManagementPageHeader
        icon={Package}
        title="Products"
        description="Keep product details, pricing, stock, and storefront visibility in one place."
      >
        <PermissionGuard permission={PERMISSIONS.PRODUCTS_CREATE} hideOnDenied>
          <Button variant="outline" className="rounded-xl border-rose-200 bg-white/70 hover:bg-rose-50 dark:bg-background/70" onClick={() => setIsHowItWorksOpen(true)}>
            <Info className="h-4 w-4 mr-2" />
            How it works
          </Button>
          <Button variant="outline" className="rounded-xl border-rose-200 bg-white/70 hover:bg-rose-50 dark:bg-background/70" onClick={() => setIsCsvDialogOpen(true)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" className="rounded-xl border-rose-200 bg-white/70 hover:bg-rose-50 dark:bg-background/70" onClick={() => setIsImageUploadOpen(true)}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Upload CSV Images
          </Button>
          <Button onClick={openAddModal} className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/15 hover:brightness-105">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </PermissionGuard>
      </ManagementPageHeader>

      <DataTable
        columns={columns}
        data={filteredProducts}
        isLoading={isLoading}
        searchPlaceholder="Search by product name, SKU, or category..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        resultCount={searchQuery ? undefined : total}
        emptyMessage="No products match these filters"
        toolbarContent={
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Filter products by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Filter products by category"
            >
              <option value="all">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[1.75rem] border-rose-100 p-5 shadow-2xl shadow-rose-950/10 sm:max-w-3xl sm:p-7">
          <DialogHeader className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4 pr-10 dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight">{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                <p className="mt-1 text-xs text-muted-foreground">Set the product details, pricing, stock, and ingredients.</p>
              </div>
            </div>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
              <section className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
                <div>
                  <h3 className="text-sm font-semibold">Product information</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Add the name, category, and description customers will see.</p>
                </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
              </section>
              <section className="space-y-4 rounded-2xl border border-orange-100 bg-orange-50/25 p-4 dark:border-border dark:bg-muted/15 sm:p-5">
                <div>
                  <h3 className="text-sm font-semibold">Pricing and stock</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Keep the selling price and available quantities up to date.</p>
                </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput name="mrp" label="MRP" type="number" step="0.01" />
                <FormInput
                  name="sellingPrice"
                  label="Selling Price"
                  type="number"
                  step="0.01"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
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
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput 
                  name="maxQuantity" 
                  label="Max Quantity Per Order (Optional)" 
                  type="number"
                  placeholder="Leave empty for no limit"
                />
                <div className="flex items-end">
                  <p className="text-xs text-muted-foreground pb-2">
                    Set maximum quantity a normal user can order. Sellers are not affected.
                  </p>
                </div>
              </div>
              <Controller
                name="bulkPricing"
                control={methods.control}
                render={({ field }) => (
                  <BulkPricingInput
                    value={field.value || []}
                    onChange={field.onChange}
                  />
                )}
              />
              </section>
              <section className="space-y-4 rounded-2xl border border-dashed border-rose-200 bg-rose-50/25 p-4 dark:border-border dark:bg-muted/15 sm:p-5">
                <div>
                  <label className="block text-sm font-semibold">Product image</label>
                  <p className="mt-1 text-xs text-muted-foreground">Choose a clear image to help customers recognize the product.</p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-border/70 bg-background shadow-sm">
                  {imagePreview ? <img src={imagePreview} alt="Product preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-7 w-7 text-muted-foreground" />}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-xl border border-rose-200 bg-background px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-rose-100 file:px-3 file:py-1.5 file:font-medium file:text-rose-900 hover:file:bg-rose-200 dark:border-border dark:file:bg-muted dark:file:text-foreground"
                />
                </div>
              </section>
              <section className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
                <div>
                  <h3 className="text-sm font-semibold">Store settings</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Choose product visibility and featured placement.</p>
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
              </section>
              <section className="space-y-4 rounded-2xl border border-rose-100 bg-rose-50/30 p-4 dark:border-border dark:bg-muted/15 sm:p-5">
                <div>
                  <h3 className="text-sm font-semibold">Nutrition and ingredients</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Optional product information for your catalog.</p>
                </div>

                <Controller
                  name="nutritionValues"
                  control={methods.control}
                  render={({ field }) => (
                    <NutritionValuesInput
                      value={field.value as Record<string, { value: number; unit: string }> | undefined}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Controller
                  name="ingredients"
                  control={methods.control}
                  render={({ field }) => (
                    <IngredientsInput
                      value={field.value as string[] | undefined}
                      onChange={field.onChange}
                    />
                  )}
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
                <Button type="submit" disabled={isSubmitting} className="min-w-28 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20 hover:brightness-105">
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

      <Dialog open={isCsvDialogOpen} onOpenChange={setIsCsvDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Import products from CSV</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Upload a .csv file. Image columns should contain an existing public image URL or an `/assets/uploads/...` path.</p>
          <input type="file" accept=".csv,text/csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} className="w-full rounded-md border border-input p-2 text-sm" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCsvDialogOpen(false)}>Cancel</Button>
            <Button onClick={importCsv} disabled={isImporting || !csvFile}><Upload className="h-4 w-4 mr-2" />{isImporting ? "Importing..." : "Import products"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>How CSV product import works</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Step 1: Upload your product photos.</strong> Click <strong>Upload CSV Images</strong> and select all photos together. Keep simple names such as <code>image1.png</code> and <code>image2.png</code>.</p>
            <p><strong>Step 2: Fill your Excel/CSV file.</strong> One row means one product. In the <code>image</code> column, write the photo name only—for example <code>image1.png</code>.</p>
            <p><strong>Step 3: Add bulk price, if needed.</strong> If a product has different prices for different quantities, add its quantity-price details in the <code>bulkPricing</code> column. If there is no bulk price, leave this column empty.</p>
            <p><strong>Step 4: Choose the product category.</strong> Every product needs a category. Copy its category ID from the Categories page and paste it in the <code>categoryId</code> column.</p>
            <p><strong>Step 5: Import the file.</strong> Click <strong>Import CSV</strong>, select your file and press Import. Correct products will be added. If any row has a problem, the rest will still be added and you will see how many rows need fixing.</p>
            <details className="rounded-md border p-3"><summary className="cursor-pointer font-medium text-foreground">CSV columns and bulk-price example (for advanced users)</summary><div className="mt-3 space-y-2 text-xs"><code className="block break-all">name,categoryId,description,sku,image,unitValue,unit,mrp,sellingPrice,stock,maxQuantity,bulkPricing,isFeatured,isActive</code><p>Bulk price example: <code>{'"[{""minQty"":10,""maxQty"":49,""price"":90}]"'}</code></p></div></details>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isImageUploadOpen} onOpenChange={setIsImageUploadOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Upload images for CSV</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Select multiple images. Filenames are preserved and must be unique (for example, image1.png, image2.png).</p>
          <input type="file" accept="image/*" multiple onChange={(e) => setCsvImages(Array.from(e.target.files || []))} className="w-full rounded-md border border-input p-2 text-sm" />
          {csvImages.length > 0 && <p className="text-xs text-muted-foreground">Selected: {csvImages.map((file) => file.name).join(", ")}</p>}
          {uploadedImagePaths.length > 0 && <div className="rounded-md bg-muted p-3"><div className="mb-2 flex items-center justify-between"><p className="text-sm font-medium">Use these paths in CSV</p><Button size="sm" variant="ghost" onClick={copyImagePaths}><Copy className="mr-1 h-3.5 w-3.5" />Copy</Button></div><pre className="whitespace-pre-wrap break-all text-xs text-muted-foreground">{uploadedImagePaths.join("\n")}</pre></div>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsImageUploadOpen(false)}>Done</Button><Button onClick={uploadCsvImages} disabled={isUploadingImages || !csvImages.length}><Upload className="mr-2 h-4 w-4" />{isUploadingImages ? "Uploading..." : "Upload images"}</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
