import {
  type AddFranchiseProductDto,
  type FranchiseDetail,
  type FranchiseInventoryItem,
  type FranchiseOrderHistoryItem,
  type Product,
  type UpdateFranchiseProductDto,
  franchiseService,
  productService,
} from "@/api";
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
 *  same pattern as RegisteredFranchisePage's lat/lng fields. */
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
  // strict: false lets this compile before the /franchise/$id route is
  // registered in the router (Task 5) — see the note in Task 3.
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const alert = useAlert();

  const [franchise, setFranchise] = useState<FranchiseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // -- Catalog lookup, used by the Add Product dropdown -------------------
  const [allProducts, setAllProducts] = useState<Product[]>([]);

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
  } = productMethods;

  useEffect(() => {
    if (id) fetchFranchiseDetail(id);
  }, [id]);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  async function fetchFranchiseDetail(franchiseId: string) {
    setIsLoading(true);
    try {
      const response = await franchiseService.getFranchise(franchiseId);
      setFranchise(response.data);
    } catch (err) {
      alert.error(
        err instanceof Error ? err.message : "Failed to fetch store details",
      );
    } finally {
      setIsLoading(false);
    }
  }

  /** Loads the full product catalog once, used for the "Add Product"
   *  dropdown. 200 is comfortably above most catalogs; if that stops
   *  being true, swap this for a searchable async select instead. */
  async function fetchAllProducts() {
    try {
      const response = await productService.getProducts({
        page: 1,
        pageSize: 200,
        status: "active",
      });
      setAllProducts(response.data);
    } catch (err) {
      alert.error(
        err instanceof Error ? err.message : "Failed to fetch product catalog",
      );
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
    resetProductForm(EMPTY_PRODUCT_FORM_VALUES);
    setIsProductModalOpen(true);
  }

  function openEditProductModal(item: FranchiseInventoryItem) {
    setEditingItem(item);
    resetProductForm({
      productId: resolveProductId(item.productId),
      stock: item.stock.toString(),
      mrp: item.mrp.toString(),
      sellingPrice: item.sellingPrice.toString(),
      isVisible: item.isVisible,
    });
    setIsProductModalOpen(true);
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
      await fetchFranchiseDetail(franchise.id);
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
      await fetchFranchiseDetail(franchise.id);
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
  const availableProducts = allProducts.filter(
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
                <FormSelect
                  name="productId"
                  label="Product"
                  placeholder={
                    availableProducts.length === 0
                      ? "All products already added"
                      : "Select a product"
                  }
                  options={availableProducts.map((product) => ({
                    value: product.id,
                    label: product.sku
                      ? `${product.name} (${product.sku})`
                      : product.name,
                  }))}
                />
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
                    (!editingItem && availableProducts.length === 0)
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
