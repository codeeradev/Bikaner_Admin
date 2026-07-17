import { type Coupon, couponService } from "@/api/services";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/hooks/use-alert";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, RefreshCw, TicketPercent, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type CouponForm = {
  code: string;
  type: "percentage" | "flat";
  value: string;
  minOrderAmount: string;
  description: string;
  isActive: boolean;
};

const emptyForm: CouponForm = {
  code: "",
  type: "percentage",
  value: "",
  minOrderAmount: "0",
  description: "",
  isActive: true,
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const toForm = (coupon: Coupon): CouponForm => ({
  code: coupon.code,
  type: coupon.type,
  value: String(coupon.value ?? ""),
  minOrderAmount: String(coupon.minOrderAmount ?? 0),
  description: coupon.description || "",
  isActive: coupon.isActive,
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

export function CouponManagementPage() {
  const alert = useAlert();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);

  const loadCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      setCoupons(await couponService.getCoupons());
    } catch (error) {
      alert.error(getErrorMessage(error, "Could not fetch coupons."));
    } finally {
      setIsLoading(false);
    }
  }, [alert]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const openCreateDialog = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm(toForm(coupon));
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const code = form.code.trim().toUpperCase();
    const value = Number(form.value);
    const minOrderAmount = Number(form.minOrderAmount || 0);

    if (!code) {
      alert.error("Coupon code is required.");
      return;
    }

    if (!Number.isFinite(value) || value < 0) {
      alert.error("Coupon value must be a valid positive number.");
      return;
    }

    if (form.type === "percentage" && value > 100) {
      alert.error("Percentage discount cannot exceed 100%.");
      return;
    }

    if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
      alert.error("Minimum order amount must be a valid positive number.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        code,
        type: form.type,
        value,
        minOrderAmount,
        description: form.description.trim(),
        isActive: form.isActive,
      };

      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon.id, payload);
        alert.success("Coupon updated.");
      } else {
        await couponService.createCoupon(payload);
        alert.success("Coupon created.");
      }

      setDialogOpen(false);
      await loadCoupons();
    } catch (error) {
      alert.error(getErrorMessage(error, "Could not save coupon."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;

    try {
      await couponService.deleteCoupon(coupon.id);
      alert.success("Coupon deleted.");
      await loadCoupons();
    } catch (error) {
      alert.error(getErrorMessage(error, "Could not delete coupon."));
    }
  };

  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) =>
        row.original.type === "percentage"
          ? `${row.original.value}%`
          : currency.format(row.original.value),
    },
    {
      accessorKey: "minOrderAmount",
      header: "Min Order",
      cell: ({ row }) => currency.format(row.original.minOrderAmount || 0),
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
            title="Edit coupon"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleDelete(row.original)}
            title="Delete coupon"
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
        title="Coupon Management"
        description="Create and manage simple discount coupons"
      />

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadCoupons}
          disabled={isLoading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button type="button" size="sm" onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={coupons}
        isLoading={isLoading}
        searchPlaceholder="Search coupons..."
        emptyMessage="No coupons found"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TicketPercent className="h-5 w-5" />
              {editingCoupon ? "Edit Coupon" : "Add Coupon"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    code: event.target.value.toUpperCase(),
                  }))
                }
                placeholder="SAVE10"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value: "percentage" | "flat") =>
                    setForm((current) => ({ ...current, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  min={0}
                  max={form.type === "percentage" ? 100 : undefined}
                  value={form.value}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      value: event.target.value,
                    }))
                  }
                  placeholder={form.type === "percentage" ? "10" : "100"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderAmount">Minimum Order Amount</Label>
              <Input
                id="minOrderAmount"
                type="number"
                min={0}
                value={form.minOrderAmount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    minOrderAmount: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, isActive: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
