import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface IngredientsInputProps {
  value?: string[];
  onChange: (value: string[]) => void;
}

export function IngredientsInput({
  value = [],
  onChange,
}: IngredientsInputProps) {
  const [ingredients, setIngredients] = useState<string[]>(value);

  useEffect(() => {
    if (value.length === 0 && ingredients.length === 0) {
      // Initialize with one empty entry
      setIngredients([""]);
    }
  }, [value, ingredients.length]);

  const handleAdd = () => {
    const newIngredients = [...ingredients, ""];
    setIngredients(newIngredients);
  };

  const handleRemove = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
    onChange(newIngredients.filter((ing) => ing.trim() !== ""));
  };

  const handleChange = (index: number, newValue: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = newValue;
    setIngredients(newIngredients);
    onChange(newIngredients.filter((ing) => ing.trim() !== ""));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium mb-2">Ingredients</label>

      {ingredients.map((ingredient, index) => (
        <div key={index} className="flex gap-2 items-start">
          <input
            type="text"
            placeholder="Ingredient name"
            value={ingredient}
            onChange={(e) => handleChange(index, e.target.value)}
            className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
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
        Add Ingredient
      </Button>
    </div>
  );
}
