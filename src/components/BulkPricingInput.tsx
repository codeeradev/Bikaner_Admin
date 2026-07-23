import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export interface BulkPriceTier {
  minQty: number;
  maxQty: number;
  price: number;
}

interface BulkPricingInputProps {
  value: BulkPriceTier[];
  onChange: (value: BulkPriceTier[]) => void;
}

export function BulkPricingInput({ value = [], onChange }: BulkPricingInputProps) {
  const addTier = () => {
    const newTier: BulkPriceTier = {
      minQty: 0,
      maxQty: 0,
      price: 0,
    };
    onChange([...value, newTier]);
  };

  const removeTier = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const updateTier = (index: number, field: keyof BulkPriceTier, fieldValue: number) => {
    const newValue = [...value];
    newValue[index] = {
      ...newValue[index],
      [field]: fieldValue,
    };
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Bulk Pricing Tiers</label>
        <Button type="button" variant="outline" size="sm" onClick={addTier}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tier
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md text-center">
          No bulk pricing tiers added. Click "Add Tier" to create quantity-based pricing.
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((tier, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border rounded-md bg-muted/30"
            >
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Min Qty
                  </label>
                  <input
                    type="number"
                    value={tier.minQty}
                    onChange={(e) =>
                      updateTier(index, "minQty", Number(e.target.value))
                    }
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    placeholder="10"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Max Qty
                  </label>
                  <input
                    type="number"
                    value={tier.maxQty}
                    onChange={(e) =>
                      updateTier(index, "maxQty", Number(e.target.value))
                    }
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    placeholder="20"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={tier.price}
                    onChange={(e) =>
                      updateTier(index, "price", Number(e.target.value))
                    }
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    placeholder="100.00"
                    min="0"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTier(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
