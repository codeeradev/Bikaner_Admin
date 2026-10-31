import { get } from "@/api/apiClient";
import { ENDPOINTS } from "@/api/endpoints";
import { type Offer, type OfferPayload, offerService } from "@/api/services";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/hooks/use-alert";
import type { ColumnDef } from "@tanstack/react-table";
import { Gift, Pencil, Plus, RefreshCw, Tag, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type OfferForm = {
  name: string;
  description: string;
  offerType: string;
  discountValue: string;
  maxDiscountAmount: string;
  bogoConfig: {
    buyQuantity: string;
    getQuantity: string;
  };
  applicableOn: string;
  specificProducts: string[];
  minCartValue: string;
  startDate: string;
  endDate: string;
  priority: string;
  autoApply: boolean;
  isActive: boolean;
};

type ProductOption = {
  id: string;
  name: string;
  image: string | null;
  sellingPrice: number;
};

const emptyForm: OfferForm = {
  name: "",
  description: "",
  offerType: "flat_discount",
  discountValue: "",
  maxDiscountAmount: "",
  bogoConfig: {
    buyQuantity: "1",
    getQuantity: "1",
  },
  applicableOn: "cart",
  specificProducts: [],
  minCartValue: "0",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  priority: "1",
  autoApply: true,
  isActive: true,
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const toForm = (offer: Offer): OfferForm => ({
  name: offer.name,
  description: offer.description || "",
  offerType: offer.offerType,
  discountValue: String(offer.discountValue ?? ""),
  maxDiscountAmount: String(offer.maxDiscountAmount ?? ""),
  bogoConfig: {
    buyQuantity: String(offer.bogoConfig?.buyQuantity ?? 1),
    getQuantity: String(offer.bogoConfig?.getQuantity ?? 1),
  },
  applicableOn: offer.applicableOn,
  specificProducts: offer.specificProducts || [],
  minCartValue: String(offer.minCartValue ?? 0),
  startDate: offer.startDate.split("T")[0],
  endDate: offer.endDate ? offer.endDate.split("T")[0] : "",
  priority: String(offer.priority ?? 1),
  autoApply: offer.autoApply ?? true,
  isActive: offer.isActive,
});

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
};

const getOfferTypeBadge = (offerType: string) => {
  const types: Record<
    string,
    { label: string; variant: "default" | "secondary" | "outline" }
  > = {
    flat_discount: { label: "Flat Discount", variant: "default" },
    percentage_discount: { label: "Percentage Off", variant: "secondary" },
    bogo: { label: "BOGO", variant: "outline" },
  };

  const type = types[offerType] || {
    label: offerType,
    variant: "outline" as const,
  };
  return <Badge variant={type.variant}>{type.label}</Badge>;
};

export function OfferManagementPage() {
  const alert = useAlert();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [form, setForm] = useState<OfferForm>(emptyForm);

  // Product selection state
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductOption[]>([]);

  const loadOffers = useCallback(async () => {
    setIsLoading(true);
    try {
      setOffers(await offerService.getOffers());
    } catch (error) {
      alert.error(getErrorMessage(error, "Could not fetch offers."));
    } finally {
      setIsLoading(false);
    }
  }, [alert]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const loadProducts = async (): Promise<ProductOption[]> => {
    try {
      const response = await get<{
        success: boolean;
        data: ProductOption[];
      }>(ENDPOINTS.GET_PRODUCTS_SELECTION);

      if (response.success) {
        setProductOptions(response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      alert.error(getErrorMessage(error, "Could not load products."));
      return [];
    }
  };

  const openCreateDialog = async () => {
    setEditingOffer(null);
    setForm(emptyForm);
    setSelectedProducts([]);
    setSelectedProductId("");
    await loadProducts();
    setDialogOpen(true);
  };

  const openEditDialog = async (offer: Offer) => {
    setEditingOffer(offer);
    setSelectedProductId("");
    const products = await loadProducts();
    setForm(toForm(offer));

    // Load selected products if specific_products
    if (offer.applicableOn === "specific_products") {
      const selected = products.filter((p) =>
        offer.specificProducts?.includes(p.id),
      );

      setSelectedProducts(selected);
    } else {
      setSelectedProducts([]);
    }

    setDialogOpen(true);
  };

  const addProduct = (product: ProductOption) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
      setForm({
        ...form,
        specificProducts: [...form.specificProducts, product.id],
      });
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
    setForm({
      ...form,
      specificProducts: form.specificProducts.filter((id) => id !== productId),
    });
  };

  const handleSubmit = async () => {
    const name = form.name.trim();
    const discountValue = Number(form.discountValue);
    const minCartValue = Number(form.minCartValue || 0);
    const priority = Number(form.priority || 1);

    if (!name) {
      alert.error("Offer name is required.");
      return;
    }

    // Validate priority (must be at least 1)
    if (priority < 1) {
      alert.error("Priority must be at least 1.");
      return;
    }

    if (
      (form.offerType === "flat_discount" ||
        form.offerType === "percentage_discount") &&
      (!Number.isFinite(discountValue) || discountValue <= 0)
    ) {
      alert.error("Discount value must be a valid positive number.");
      return;
    }

    if (form.offerType === "percentage_discount" && discountValue > 100) {
      alert.error("Percentage discount cannot exceed 100%.");
      return;
    }

    // Validate BOGO config
    if (form.offerType === "bogo") {
      const buyQty = Number(form.bogoConfig.buyQuantity);
      const getQty = Number(form.bogoConfig.getQuantity);

      if (!Number.isFinite(buyQty) || buyQty < 1) {
        alert.error("Buy quantity must be at least 1.");
        return;
      }

      if (!Number.isFinite(getQty) || getQty < 1) {
        alert.error("Get quantity must be at least 1.");
        return;
      }

      // BOGO requires specific products
      if (form.applicableOn !== "specific_products") {
        alert.error("BOGO offers must be applied to specific products.");
        return;
      }
    }

    if (!Number.isFinite(minCartValue) || minCartValue < 0) {
      alert.error("Minimum cart value must be a valid positive number.");
      return;
    }

    if (!form.startDate) {
      alert.error("Start date is required.");
      return;
    }

    if (
      form.applicableOn === "specific_products" &&
      form.specificProducts.length === 0
    ) {
      alert.error("Please select at least one product.");
      return;
    }

    try {
      setIsSaving(true);
      const payload: OfferPayload = {
        name,
        description: form.description.trim(),
        offerType: form.offerType as any,
        discountValue:
          form.offerType === "flat_discount" ||
          form.offerType === "percentage_discount"
            ? discountValue
            : undefined,
        maxDiscountAmount: form.maxDiscountAmount
          ? Number(form.maxDiscountAmount)
          : undefined,
        bogoConfig:
          form.offerType === "bogo"
            ? {
                buyQuantity: Number(form.bogoConfig.buyQuantity),
                getQuantity: Number(form.bogoConfig.getQuantity),
              }
            : undefined,
        applicableOn: form.applicableOn as any,
        specificProducts:
          form.applicableOn === "specific_products"
            ? form.specificProducts
            : undefined,
        minCartValue,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        priority,
        autoApply: form.autoApply,
        isActive: form.isActive,
      };

      if (editingOffer) {
        await offerService.updateOffer(editingOffer.id, payload);
        alert.success("Offer updated.");
      } else {
        await offerService.createOffer(payload);
        alert.success("Offer created.");
      }

      setDialogOpen(false);
      await loadOffers();
    } catch (error) {
      alert.error(getErrorMessage(error, "Could not save offer."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!offerToDelete) return;
    setIsDeleting(true);
    try {
      await offerService.deleteOffer(offerToDelete.id);
      alert.success("Offer deleted.");
      setOfferToDelete(null);
      await loadOffers();
    } catch (error) {
      alert.error(getErrorMessage(error, "Could not delete offer."));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<Offer>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.description && (
            <div
              className="mt-0.5 max-w-[280px] truncate text-xs text-muted-foreground"
              title={row.original.description}
            >
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "offerType",
      header: "Application",
      cell: ({ row }) => getOfferTypeBadge(row.original.offerType),
    },
    {
      accessorKey: "discountValue",
      header: "Discount",
      cell: ({ row }) => {
        if (row.original.offerType === "percentage_discount") {
          return `${row.original.discountValue}%`;
        }
        if (row.original.offerType === "flat_discount") {
          return currency.format(row.original.discountValue || 0);
        }
        return "—";
      },
    },
    {
      accessorKey: "minCartValue",
      header: "Min Cart",
      cell: ({ row }) => currency.format(row.original.minCartValue || 0),
    },
    {
      accessorKey: "startDate",
      header: "Valid Period",
      cell: ({ row }) => {
        const start = new Date(row.original.startDate).toLocaleDateString();
        const end = row.original.endDate
          ? new Date(row.original.endDate).toLocaleDateString()
          : "No end";
        return (
          <div className="text-xs">
            <div>{start}</div>
            <div className="text-muted-foreground">to {end}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "autoApply",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.autoApply ? "secondary" : "outline"}>
          {row.original.autoApply ? "Auto Apply" : "Manual"}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => openEditDialog(row.original)}
            title="Edit offer"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setOfferToDelete(row.original)}
            title="Delete offer"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offer Management"
        description="Create and manage offers including coupons, discounts, and BOGO deals"
        className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-orange-50/80 to-amber-50 px-5 py-5 shadow-sm dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:px-6"
      >
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl border-rose-200 bg-white/80"
          onClick={loadOffers}
          disabled={isLoading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button
          type="button"
          className="h-10 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/15 hover:brightness-105"
          onClick={openCreateDialog}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Offer
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={offers}
        isLoading={isLoading}
        searchPlaceholder="Search offers..."
        emptyMessage="No offers found"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[1.75rem] border-rose-100 p-5 shadow-2xl shadow-rose-950/10 sm:max-w-3xl sm:p-7">
          <DialogHeader className="rounded-2xl border border-rose-100/80 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-4 pr-10 dark:border-border dark:from-rose-950/20 dark:via-orange-950/10 dark:to-card sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold tracking-tight">
                    {editingOffer ? "Edit offer" : "Create an offer"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-xs">
                    Configure the discount, eligible products, and validity.
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/80 bg-white/70 px-3 py-2 dark:border-border dark:bg-card/60">
                <Label htmlFor="isActive" className="text-sm font-medium">
                  {form.isActive ? "Active" : "Inactive"}
                </Label>
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, isActive: checked })
                  }
                />
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full pt-1">
            <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl border border-rose-100 bg-rose-50/70 p-1 dark:border-border dark:bg-muted/60">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
            </TabsList>

            <TabsContent
              value="basic"
              className="mt-4 space-y-5 rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Offer Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  placeholder="Brief description of the offer"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Offer Type *</Label>
                  <Select
                    value={form.offerType}
                    onValueChange={(value) =>
                      setForm({ ...form, offerType: value })
                    }
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat_discount">
                        Flat Discount
                      </SelectItem>
                      <SelectItem value="percentage_discount">
                        Percentage Discount
                      </SelectItem>
                      <SelectItem value="bogo">Buy One Get One</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Applicable On *</Label>
                  <Select
                    value={form.applicableOn}
                    onValueChange={(value) => {
                      setForm({
                        ...form,
                        applicableOn: value,
                        specificProducts: [],
                      });
                      setSelectedProducts([]);
                    }}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cart">Entire Cart</SelectItem>
                      <SelectItem value="specific_products">
                        Specific Products
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.applicableOn === "specific_products" && (
                <div className="space-y-2">
                  <Label>Select Products *</Label>
                  <Select
                    value={selectedProductId}
                    onValueChange={(value) => {
                      setSelectedProductId(value);

                      const product = productOptions.find(
                        (p) => p.id === value,
                      );

                      if (product) {
                        addProduct(product);
                      }
                    }}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl">
                      <SelectValue placeholder="Select Product" />
                    </SelectTrigger>

                    <SelectContent>
                      {productOptions.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ₹{product.sellingPrice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedProducts.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-xs">Selected Products:</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-1 rounded-lg border border-rose-100 bg-rose-50 px-2.5 py-1.5 text-xs text-rose-800 dark:border-border dark:bg-rose-950/30 dark:text-rose-200"
                          >
                            <span>{product.name}</span>
                            <button
                              type="button"
                              onClick={() => removeProduct(product.id)}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(form.offerType === "flat_discount" ||
                form.offerType === "percentage_discount") && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="discountValue">
                      {form.offerType === "percentage_discount"
                        ? "Discount (%)"
                        : "Discount Amount (₹)"}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      min={0}
                      max={
                        form.offerType === "percentage_discount"
                          ? 100
                          : undefined
                      }
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm({ ...form, discountValue: e.target.value })
                      }
                      placeholder={
                        form.offerType === "percentage_discount" ? "10" : "100"
                      }
                    />
                  </div>
                  {form.offerType === "percentage_discount" && (
                    <div className="space-y-2">
                      <Label htmlFor="maxDiscountAmount">
                        Max Discount (₹)
                      </Label>
                      <Input
                        id="maxDiscountAmount"
                        type="number"
                        min={0}
                        value={form.maxDiscountAmount}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            maxDiscountAmount: e.target.value,
                          })
                        }
                        placeholder="Optional cap"
                      />
                    </div>
                  )}
                </div>
              )}

              {form.offerType === "bogo" && (
                <div className="space-y-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/70 p-4 dark:border-amber-900 dark:from-amber-950/20 dark:to-orange-950/10">
                  <div className="font-medium">
                    Buy One Get One Configuration
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="buyQuantity">Buy Quantity</Label>
                      <Input
                        id="buyQuantity"
                        type="number"
                        min={1}
                        value={form.bogoConfig.buyQuantity}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            bogoConfig: {
                              ...form.bogoConfig,
                              buyQuantity: e.target.value,
                            },
                          })
                        }
                        placeholder="1"
                      />
                      <p className="text-xs text-muted-foreground">
                        Customer buys this many
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="getQuantity">Get Quantity (Free)</Label>
                      <Input
                        id="getQuantity"
                        type="number"
                        min={1}
                        value={form.bogoConfig.getQuantity}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            bogoConfig: {
                              ...form.bogoConfig,
                              getQuantity: e.target.value,
                            },
                          })
                        }
                        placeholder="1"
                      />
                      <p className="text-xs text-muted-foreground">
                        Customer gets this many free
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-white/80 p-3 text-sm text-muted-foreground dark:border-border dark:bg-card/70">
                    Example: Buy {form.bogoConfig.buyQuantity || "1"}, Get{" "}
                    {form.bogoConfig.getQuantity || "1"} Free
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="autoApply">Auto Apply</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically apply this offer when conditions are met
                  </p>
                </div>
                <Switch
                  id="autoApply"
                  checked={form.autoApply}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, autoApply: checked })
                  }
                />
              </div>
            </TabsContent>

            <TabsContent
              value="conditions"
              className="mt-4 space-y-5 rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5"
            >
              <div className="space-y-2">
                <Label htmlFor="minCartValue">Minimum Cart Value (₹)</Label>
                <Input
                  id="minCartValue"
                  type="number"
                  min={0}
                  value={form.minCartValue}
                  onChange={(e) =>
                    setForm({ ...form, minCartValue: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min={1}
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                  placeholder="1"
                />
                <p className="text-xs text-muted-foreground">
                  Higher priority offers are evaluated first (minimum: 1)
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl sm:w-auto"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/15 hover:brightness-105 sm:w-auto"
            >
              {isSaving ? "Saving..." : "Save Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!offerToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setOfferToDelete(null);
        }}
      >
        <AlertDialogContent className="rounded-3xl border-rose-100 p-6 shadow-2xl shadow-rose-950/10 sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold tracking-tight">
              Delete this offer?
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              The offer{" "}
              <span className="font-semibold text-foreground">
                {offerToDelete?.name}
              </span>{" "}
              will be removed and will no longer be available to customers. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={isDeleting}>
              Keep offer
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {isDeleting ? "Deleting…" : "Delete offer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
