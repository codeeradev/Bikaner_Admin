import type { Banner } from "@/api/services/bannerService";
import { bannerService } from "@/api/services/bannerService";
import { productService } from "@/api/services/productService";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { useAlert } from "@/hooks/use-alert";
import { PERMISSIONS } from "@/lib/permissions";
import { useUIStore } from "@/store";
import type { ColumnDef } from "@tanstack/react-table";
import { ImageIcon, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
}

export function BannersPage() {
  const alert = useAlert();
  const { showDialog } = useUIStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    image: null as File | null,
    productId: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bannersRes, productsRes] = await Promise.all([
        bannerService.getBanners(),
        productService.getProducts({ pageSize: 1000 }),
      ]);

      if (bannersRes.success) {
        setBanners(bannersRes.data);
      }

      if (productsRes?.data) {
        setProducts(productsRes.data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      alert.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingBanner(null);
    setFormData({ title: "", image: null, productId: "", isActive: true });
    setImagePreview("");
    setErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      image: null,
      productId: banner.productId || "",
      isActive: banner.isActive,
    });
    setImagePreview(
      banner.image ? `${import.meta.env.VITE_API_BASE_URL}${banner.image}` : "",
    );
    setErrors({});
    setIsDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Banner title is required";
    }

    if (!editingBanner && !formData.image) {
      newErrors.image = "Banner image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    const loadingId = alert.loading(
      editingBanner ? "Updating banner..." : "Creating banner...",
    );

    try {
      if (editingBanner) {
        const updateData: any = {
          title: formData.title,
          productId: formData.productId || undefined,
          isActive: formData.isActive,
        };

        if (formData.image) {
          updateData.image = formData.image;
        }

        await bannerService.updateBanner(editingBanner.id, updateData);
        alert.success("Banner updated successfully");
      } else {
        if (!formData.image) return;

        await bannerService.createBanner({
          title: formData.title,
          image: formData.image,
          productId: formData.productId || undefined,
          isActive: formData.isActive,
        });
        alert.success("Banner created successfully");
      }

      alert.removeAlert(loadingId);
      setIsDialogOpen(false);
      setFormData({ title: "", image: null, productId: "", isActive: true });
      setImagePreview("");
      await loadData();
    } catch (error: any) {
      alert.removeAlert(loadingId);
      alert.error(error?.message || "Failed to save banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (banner: Banner) => {
    showDialog({
      title: "Delete Banner",
      description: `Are you sure you want to delete "${banner.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        const loadingId = alert.loading("Deleting banner...");
        try {
          await bannerService.deleteBanner(banner.id);
          alert.removeAlert(loadingId);
          alert.success("Banner deleted successfully");
          await loadData();
        } catch (error: any) {
          alert.removeAlert(loadingId);
          alert.error(error?.message || "Failed to delete banner");
        }
      },
    });
  };

  const handleImageChange = (file: File | null) => {
    if (!file) return;

    setFormData({ ...formData, image: file });
    setImagePreview(URL.createObjectURL(file));
    setErrors({ ...errors, image: "" });
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const columns: ColumnDef<Banner>[] = [
    {
      accessorKey: "title",
      header: "Banner",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg overflow-hidden border">
            {row.original.image ? (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL}${row.original.image}`}
                alt={row.original.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{row.original.title}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "product",
      header: "Linked Product",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.product?.name || (
            <span className="text-muted-foreground">None</span>
          )}
        </span>
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
        <div className="flex items-center gap-2 justify-end">
          <PermissionGuard permission={PERMISSIONS.BANNERS_EDIT} hideOnDenied>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditDialog(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.BANNERS_DELETE} hideOnDenied>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteBanner(row.original)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        description="Manage promotional banners for your store"
      >
        <PermissionGuard permission={PERMISSIONS.BANNERS_CREATE} hideOnDenied>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Banner
          </Button>
        </PermissionGuard>
      </PageHeader>

      <DataTable
        columns={columns}
        data={banners}
        emptyMessage="No banners found"
      />

      {/* Create/Edit Banner Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "Edit Banner" : "Add New Banner"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">
                Banner Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter banner title"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-xs text-destructive mt-1">{errors.title}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>
                Banner Image{" "}
                {!editingBanner && <span className="text-destructive">*</span>}
              </Label>
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
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
                    id="banner-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageChange(file);
                    }}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("banner-image")?.click()
                    }
                  >
                    Choose Image
                  </Button>

                  <p className="mt-2 text-xs text-muted-foreground">
                    JPG, PNG or WEBP (Recommended: 1200x400px)
                  </p>
                </div>
              </div>
              {errors.image && (
                <p className="text-xs text-destructive">{errors.image}</p>
              )}
            </div>

            <div>
              <Label htmlFor="productId">Linked Product (Optional)</Label>
              <Select
                value={formData.productId || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    productId: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="isActive">Status</Label>
              <Select
                value={formData.isActive ? "active" : "inactive"}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value === "active" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{editingBanner ? "Update" : "Create"} Banner</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
