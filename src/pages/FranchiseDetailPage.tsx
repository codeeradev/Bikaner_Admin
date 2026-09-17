import {
  type AddFranchiseProductDto,
  type Category,
  type FranchiseDetail,
  type FranchiseInventoryItem,
  type FranchiseOrderHistoryItem,
  type Product,
  type UpdateFranchiseProductDto,
  categoryService,
  franchiseService,
  productService,
} from "@/api";
import { DataTable } from "@/components/DataTable";
import {
  FormCheckbox,
  FormInput,
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
import { Label } from "@/components/ui/label";
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
import { useNavigate, useParams } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

/** Local shape of the add/edit-product form — react-hook-form needs
 *  string-typed number inputs before they're parsed for the API call,
 *  same pattern as RegisteredFranchisePage's lat/lng fields. `productId`
 *  is submitted; `categoryId` is a UI-only filter (kept out of the
 *  form, see selectedCategoryId below) so it never gets sent as-is. */
interface ProductFormData {
  productId: string;
  stock: string;
  mrp: string;
  sellingPrice: string;
  isVisible: boolean;
}

const EMPTY_PRODUCT_FORM_VALUES: ProductFormData = {
  productId: "",
  stock: "0",
  mrp: "",
  sellingPrice: "",
  isVisible: true,
};

export function FranchiseDetailPage() {
  // strict: false lets this compile independent of route-registration
  // order. The URL param is the store's slug, not its _id — see
  // franchiseDetailRoute in router.tsx.
  const { slug } = useParams({ strict: false }) as { slug: string };
  const navigate = useNavigate();
  const alert = useAlert();

  const [franchise, setFranchise] = useState<FranchiseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // -- Add Product modal: category → product cascade ----------------------
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // -- Add/Edit product modal ---------------------------------------------
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FranchiseInventoryItem | null>(
    null,
  );
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  const productMethods = useForm<ProductFormData>({
    defaultValues: EMPTY_PRODUCT_FORM_VALUES,
  });
  const {
    handleSubmit: handleProductSubmit,
    reset: resetProductForm,
    setValue: setProductFormValue,
  } = productMethods;

  useEffect(() => {
    if (slug) fetchFranchiseDetail(slug);
  }, [slug]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Re-fetch the product dropdown's options every time the chosen
  // category changes. No category selected yet → leave the product
  // list empty rather than showing every product in the catalog.
  useEffect(() => {
    if (selectedCategoryId) {
      fetchCategoryProducts(selectedCategoryId);
    } else {
      setCategoryProducts([]);
    }
  }, [selectedCategoryId]);

  async function fetchFranchiseDetail(franchiseSlug: string) {
    setIsLoading(true);
    try {
      const response = await franchiseService.getFranchiseBySlug(
        franchiseSlug,
      );
      setFranchise(response.data);
    } catch (err) {
      alert.error(
        err instanceof Error ? err.message : "Failed to fetch store details",
      );
    } finally {
      setIsLoading(false);
    }
  }

  /** Loads active categories once, used for the "Add Product" modal's
   *  category filter. */
  async function fetchCategories() {
    try {
      const response = await categoryService.getCategories({
        page: 1,
        pageSize: 100,
        status: "active",
      });
      setCategories(response.data);
    } catch (err) {
      alert.error(
        err instanceof Error ? err.message : "Failed to fetch categories",
      );
    }
  }

  /** Loads active products for the chosen category — this is what
   *  narrows the product dropdown once an admin picks a category. */
  async function fetchCategoryProducts(categoryId: string) {
    setIsLoadingProducts(true);
    try {
      const response = await productService.getProducts({
        categoryId,
        status: "active",
        pageSize: 200,
      });
      setCategoryProducts(response.data);
    } catch (err) {
      alert.error(
        err instanceof Error ? err.message : "Failed to fetch products",
      );
    } finally {
      setIsLoadingProducts(false);
    }
  }

  function resolveProductId(
    productId: FranchiseInventoryItem["productId"],
  ): string {
    // The API client transforms every Mongo `_id` (including inside
    // populated fields) into `id` before this ever reaches component
    // code — see transformMongoResponse in apiClient.ts. So a populated
    // productId arrives as { id, name, sku, image }, never `_id`.
    return typeof productId === "string" ? productId : productId.id;
  }

  function openAddProductModal() {
    setEditingItem(null);
    setSelectedCategoryId("");
    setCategoryProducts([]);
    resetProductForm(EMPTY_PRODUCT_FORM_VALUES);
    setIsProductModalOpen(true);
  }

  function openEditProductModal(item: FranchiseInventoryItem) {
    setEditingItem(item);
    setSelectedCategoryId("");
    setCategoryProducts([]);
    resetProductForm({
      productId: resolveProductId(item.productId),
      stock: item.stock.toString(),
      mrp: item.mrp.toString(),
      sellingPrice: item.sellingPrice.toString(),
      isVisible: item.isVisible,
    });
    setIsProductModalOpen(true);
  }

  function handleCategoryChange(categoryId: string) {
    setSelectedCategoryId(categoryId);
    // The previously-picked product almost certainly doesn't belong to
    // the new category — clear it so an admin can't accidentally submit
    // a stale selection that's no longer visible in the dropdown.
    setProductFormValue("productId", "");
  }

  function handleProductChange(productId: string) {
    setProductFormValue("productId", productId, { shouldValidate: true });
    // Pre-fill MRP/selling price from the catalog product as a starting
    // point — the admin can still override them per store below.
    const product = categoryProducts.find((p) => p.id === productId);
    if (product) {
      if (product.mrp !== undefined) {
        setProductFormValue("mrp", product.mrp.toString());
      }
      if (product.sellingPrice !== undefined) {
        setProductFormValue("sellingPrice", product.sellingPrice.toString());
      }
    }
  }

  async function onSubmitProduct(data: ProductFormData) {
    if (!franchise) return;
    setIsSubmittingProduct(true);
    try {
      if (editingItem) {
        const updateData: UpdateFranchiseProductDto = {
          stock: Number.parseInt(data.stock, 10) || 0,
          mrp: Number.parseFloat(data.mrp),
          sellingPrice: Number.parseFloat(data.sellingPrice),
          isVisible: data.isVisible,
        };
        await franchiseService.updateFranchiseProduct(
          franchise.id,
          resolveProductId(editingItem.productId),
          updateData,
        );
        alert.success("Product updated successfully");
      } else {
        if (!data.productId) {
          alert.error("Please select a product to add");
          setIsSubmittingProduct(false);
          return;
        }
        const addData: AddFranchiseProductDto = {
          productId: data.productId,
          stock: Number.parseInt(data.stock, 10) || 0,
          mrp: Number.parseFloat(data.mrp),
          sellingPrice: Number.parseFloat(data.sellingPrice),
          isVisible: data.isVisible,
        };
        await franchiseService.addFranchiseProduct(franchise.id, addData);
        alert.success("Product added to store successfully");
      }
      setIsProductModalOpen(false);
      resetProductForm(EMPTY_PRODUCT_FORM_VALUES);
      await fetchFranchiseDetail(franchise.slug);
    } catch (err) {
      alert.error(
        err instanceof Error ? err.message : "Failed to save store product",
      );
    } finally {
      setIsSubmittingProduct(false);
    }
  }

  async function handleRemoveProduct(item: FranchiseInventoryItem) {
    if (!franchise) return;
    const product = item.productId;
    const name = typeof product === "string" ? product : product.name;
    const confirmed = confirm(
      `Remove "${name}" from this store's catalog? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await franchiseService.removeFranchiseProduct(
        franchise.id,
        resolveProductId(item.productId),
      );
      alert.success("Product removed from store");
      await fetchFranchiseDetail(franchise.slug);
    } catch (err) {
      alert.error(
        err instanceof Error ? err.message : "Failed to remove store product",
      );
    }
  }

  // Products not yet in this store's catalog — only these are offered
  // when adding a new one, so admins can't accidentally create a
  // duplicate (franchiseId, productId) row.
  const existingProductIds = new Set(
    (franchise?.inventory ?? []).map((item) => resolveProductId(item.productId)),
  );
  const availableProducts = categoryProducts.filter(
    (product) => !existingProductIds.has(product.id),
  );

  const inventoryColumns: ColumnDef<FranchiseInventoryItem>[] = [
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original.productId;
        const name = typeof product === "string" ? product : product.name;
        const sku = typeof product === "string" ? "-" : product.sku;
        return (
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">SKU: {sku}</div>
          </div>
        );
      },
    },
    { accessorKey: "stock", header: "Stock" },
    {
      accessorKey: "mrp",
      header: "MRP",
      cell: ({ row }) => <span>₹{row.getValue("mrp")}</span>,
    },
    {
      accessorKey: "sellingPrice",
      header: "Selling Price",
      cell: ({ row }) => <span>₹{row.getValue("sellingPrice")}</span>,
    },
    {
      accessorKey: "isVisible",
      header: "Visible",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isVisible") ? "default" : "secondary"}>
          {row.getValue("isVisible") ? "Visible" : "Hidden"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <PermissionGuard permission={PERMISSIONS.FRANCHISE_EDIT} hideOnDenied>
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-ocid={`franchise_detail.edit_product_button.${row.index + 1}`}
                  onClick={() => openEditProductModal(row.original)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit product</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-ocid={`franchise_detail.remove_product_button.${row.index + 1}`}
                  onClick={() => handleRemoveProduct(row.original)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove from store</TooltipContent>
            </Tooltip>
          </div>
        </PermissionGuard>
      ),
    },
  ];

  const orderHistoryColumns: ColumnDef<FranchiseOrderHistoryItem>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.getValue("orderNumber") ?? row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "grandTotal",
      header: "Total",
      cell: ({ row }) => <span>₹{row.getValue("grandTotal")}</span>,
    },
    { accessorKey: "orderStatus", header: "Order Status" },
    {
      id: "assignmentStatus",
      header: "Assignment",
      cell: ({ row }) => {
        const status = row.original.franchiseAssignment.status;
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
          accepted: "default",
          pending: "secondary",
          rejected: "destructive",
        };
        return <Badge variant={variants[status] ?? "secondary"}>{status}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) =>
        new Date(row.getValue("createdAt")).toLocaleDateString(),
    },
  ];

  if (isLoading || !franchise) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading store details...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={franchise.name} description={franchise.address}>
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/franchise/registered" })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to list
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DetailStat label="Manager" value={franchise.managerName} />
        <DetailStat label="Email" value={franchise.email} />
        <DetailStat label="Phone" value={franchise.phone} />
        <DetailStat
          label="Status"
          value={
            <Badge variant={franchise.status === "active" ? "default" : "secondary"}>
              {franchise.status}
            </Badge>
          }
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Inventory</h2>
          <PermissionGuard permission={PERMISSIONS.FRANCHISE_EDIT} hideOnDenied>
            <Button
              onClick={openAddProductModal}
              data-ocid="franchise_detail.add_product_button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </PermissionGuard>
        </div>
        <DataTable
          columns={inventoryColumns}
          data={franchise.inventory}
          searchPlaceholder="Search products..."
          emptyMessage="No inventory records for this store yet"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Order History</h2>
        <DataTable
          columns={orderHistoryColumns}
          data={franchise.orderHistory}
          searchPlaceholder="Search orders..."
          emptyMessage="No orders assigned to this store yet"
        />
      </div>

      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Store Product" : "Add Product to Store"}
            </DialogTitle>
          </DialogHeader>
          <FormProvider {...productMethods}>
            <form
              onSubmit={handleProductSubmit(onSubmitProduct)}
              className="space-y-4"
            >
              {editingItem ? (
                // The product itself can't be changed once added — only
                // its per-store stock/pricing/visibility can. Swapping
                // the linked product would really be "remove + add".
                <div className="rounded-lg border border-border p-3">
                  <div className="text-xs text-muted-foreground">Product</div>
                  <div className="font-medium">
                    {typeof editingItem.productId === "string"
                      ? editingItem.productId
                      : editingItem.productId.name}
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1: pick a category — this is what narrows the
                      product list below to something browsable instead
                      of the entire catalog. Not submitted to the API;
                      it's a client-side filter only. */}
                  <div className="space-y-2">
                    <Label htmlFor="category-filter">Category</Label>
                    <Select
                      value={selectedCategoryId}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger id="category-filter">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Step 2: pick a product from that category. Kept as
                      a plain controlled Select (not FormSelect) so its
                      displayed value updates immediately when the
                      category — and therefore the option list —
                      changes. */}
                  <div className="space-y-2">
                    <Label htmlFor="product-filter">Product</Label>
                    <Select
                      value={productMethods.watch("productId")}
                      onValueChange={handleProductChange}
                      disabled={!selectedCategoryId || isLoadingProducts}
                    >
                      <SelectTrigger id="product-filter">
                        <SelectValue
                          placeholder={
                            !selectedCategoryId
                              ? "Select a category first"
                              : isLoadingProducts
                                ? "Loading products..."
                                : availableProducts.length === 0
                                  ? "No products available in this category"
                                  : "Select a product"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.sku
                              ? `${product.name} (${product.sku})`
                              : product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="grid grid-cols-3 gap-4">
                <FormInput name="stock" label="Stock" type="number" min="0" />
                <FormInput name="mrp" label="MRP" type="number" min="0" step="0.01" />
                <FormInput
                  name="sellingPrice"
                  label="Selling Price"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>

              <FormCheckbox
                name="isVisible"
                label="Visible in store"
                description="Uncheck to hide this product from the store's catalog without removing its pricing/stock record"
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProductModalOpen(false)}
                  disabled={isSubmittingProduct}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmittingProduct ||
                    (!editingItem && !productMethods.watch("productId"))
                  }
                >
                  {isSubmittingProduct
                    ? "Saving..."
                    : editingItem
                      ? "Update"
                      : "Add Product"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Small read-only key/value tile used for the profile summary row. */
function DetailStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
