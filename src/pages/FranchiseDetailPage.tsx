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
import { FormCheckbox, FormInput } from "@/components/FormComponents";
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
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { PERMISSIONS } from "@/lib/permissions";
import { useNavigate, useParams } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft,
  Mail,
  MapPin,
  PackagePlus,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Store,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const fetchSequence = useRef(0);
  useEffect(
    () => () => {
      fetchSequence.current++;
    },
    [],
  );

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

  useLiveRefresh(async () => {
    if (slug) await fetchFranchiseDetail(slug, true);
  });

  async function fetchFranchiseDetail(franchiseSlug: string, quiet = false) {
    const sequence = ++fetchSequence.current;
    if (!quiet) setIsLoading(true);
    try {
      const response = await franchiseService.getFranchiseBySlug(franchiseSlug);
      if (sequence === fetchSequence.current) setFranchise(response.data);
    } catch (err) {
      if (!quiet && sequence === fetchSequence.current)
        alert.error(
          err instanceof Error ? err.message : "Failed to fetch store details",
        );
    } finally {
      if (sequence === fetchSequence.current) setIsLoading(false);
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
    (franchise?.inventory ?? []).map((item) =>
      resolveProductId(item.productId),
    ),
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
        const variants: Record<
          string,
          "default" | "secondary" | "destructive"
        > = {
          accepted: "default",
          pending: "secondary",
          rejected: "destructive",
        };
        return (
          <Badge variant={variants[status] ?? "secondary"}>{status}</Badge>
        );
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
      <PageHeader
        title={franchise.name}
        description={franchise.address}
        className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-orange-50/80 to-amber-50 px-5 py-5 shadow-sm dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:px-6"
      >
        <Button
          variant="outline"
          className="rounded-xl border-rose-200 bg-white/80 shadow-sm"
          onClick={() => navigate({ to: "/franchise/registered" })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to list
        </Button>
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetailStat
          icon={Store}
          label="Store manager"
          value={franchise.managerName}
        />
        <DetailStat icon={Mail} label="Manager email" value={franchise.email} />
        <DetailStat
          icon={Phone}
          label="Contact number"
          value={franchise.phone}
        />
        <DetailStat
          icon={ShieldCheck}
          label="Status"
          value={
            <Badge
              variant={franchise.status === "active" ? "default" : "secondary"}
            >
              {franchise.status}
            </Badge>
          }
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-300">
              Store catalog
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight">Inventory</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage this store’s products, stock levels, and selling prices.
            </p>
          </div>
          <PermissionGuard permission={PERMISSIONS.FRANCHISE_EDIT} hideOnDenied>
            <Button
              onClick={openAddProductModal}
              data-ocid="franchise_detail.add_product_button"
              className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/15 hover:brightness-105"
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

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-300">
            Store activity
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight">
            Order History
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Orders routed to this franchise and their assignment progress.
          </p>
        </div>
        <DataTable
          columns={orderHistoryColumns}
          data={franchise.orderHistory}
          searchPlaceholder="Search orders..."
          emptyMessage="No orders assigned to this store yet"
        />
      </div>

      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[1.75rem] border-rose-100 p-5 shadow-2xl shadow-rose-950/10 sm:max-w-2xl sm:p-7">
          <DialogHeader className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4 pr-10 dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20">
                <PackagePlus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight">
                  {editingItem ? "Edit store product" : "Add product to store"}
                </DialogTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Set this franchise’s stock, price, and product visibility.
                </p>
              </div>
            </div>
          </DialogHeader>
          <FormProvider {...productMethods}>
            <form
              onSubmit={handleProductSubmit(onSubmitProduct)}
              className="space-y-5 pt-1"
            >
              <section className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
                {editingItem ? (
                  // The product itself can't be changed once added — only
                  // its per-store stock/pricing/visibility can. Swapping
                  // the linked product would really be "remove + add".
                  <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3 dark:border-border dark:bg-muted/30">
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
                    <div className="grid gap-4 sm:grid-cols-2">
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
                    </div>
                  </>
                )}
              </section>

              <section className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
                <div>
                  <h3 className="text-sm font-semibold">Stock and pricing</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    These values apply only to {franchise.name}.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormInput name="stock" label="Stock" type="number" min="0" />
                  <FormInput
                    name="mrp"
                    label="MRP"
                    type="number"
                    min="0"
                    step="0.01"
                  />
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
              </section>

              <div className="flex justify-end gap-2 border-t border-border/70 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsProductModalOpen(false)}
                  disabled={isSubmittingProduct}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-w-28 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/15 hover:brightness-105"
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
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Store;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-rose-100/80 bg-card/90 p-4 shadow-sm dark:border-border">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-100 to-orange-100 text-rose-600 dark:from-rose-950/60 dark:to-orange-950/30 dark:text-rose-300">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="mt-1 truncate font-semibold">{value}</div>
      </div>
    </div>
  );
}
