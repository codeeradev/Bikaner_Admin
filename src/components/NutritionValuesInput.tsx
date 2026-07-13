import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface NutritionValuesInputProps {
  value?: Record<string, { value: number; unit: string }>;
  onChange: (value: Record<string, { value: number; unit: string }>) => void;
}

export function NutritionValuesInput({
  value = {},
  onChange,
}: NutritionValuesInputProps) {
  const [entries, setEntries] = useState<
    Array<{
      key: string;
      value: string;
      unit: string;
    }>
  >(() => {
    return Object.entries(value).map(([key, data]) => ({
      key,
      value: data.value.toString(),
      unit: data.unit,
    }));
  });

  useEffect(() => {
    if (Object.keys(value).length === 0 && entries.length === 0) {
      // Initialize with one empty entry
      setEntries([{ key: "", value: "", unit: "" }]);
    }
  }, [value, entries.length]);

  const handleAdd = () => {
    setEntries([...entries, { key: "", value: "", unit: "" }]);
  };

  const handleRemove = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
    updateParent(newEntries);
  };

  const handleChange = (
    index: number,
    field: "key" | "value" | "unit",
    newValue: string,
  ) => {
    const newEntries = [...entries];
    newEntries[index][field] = newValue;
    setEntries(newEntries);
    updateParent(newEntries);
  };

  const updateParent = (
    currentEntries: Array<{ key: string; value: string; unit: string }>,
  ) => {
    const result: Record<string, { value: number; unit: string }> = {};

    currentEntries.forEach((entry) => {
      if (entry.key && entry.value && entry.unit) {
        result[entry.key] = {
          value: parseFloat(entry.value),
          unit: entry.unit,
        };
      }
    });

    onChange(result);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium mb-2">Nutrition Values</label>

      {entries.map((entry, index) => (
        <div key={index} className="flex gap-2 items-start">
          <input
            type="text"
            placeholder="Field name (e.g., Calories)"
            value={entry.key}
            onChange={(e) => handleChange(index, "key", e.target.value)}
            className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Value"
            value={entry.value}
            onChange={(e) => handleChange(index, "value", e.target.value)}
            className="w-24 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Unit"
            value={entry.unit}
            onChange={(e) => handleChange(index, "unit", e.target.value)}
            className="w-20 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleRemove(index)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Add Nutrition Entry
      </Button>
    </div>
  );
}
