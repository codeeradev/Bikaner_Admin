import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Mobile number is required")
    .min(10, "Mobile number must be at least 10 digits")
    .regex(/^\d+$/, "Please enter only numbers (no spaces or special characters)"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  image: z.instanceof(File).optional(),
  status: z.enum(["active", "inactive"]),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

const nutritionEntrySchema = z.object({
  value: z.coerce.number().min(0, "Value must be 0 or greater"),
  unit: z.string().min(1, "Unit is required"),
});

const bulkPriceTierSchema = z.object({
  minQty: z.coerce.number().min(0, "Min quantity must be 0 or greater"),
  maxQty: z.coerce.number().min(0, "Max quantity must be 0 or greater"),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
});

export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Name must be less than 200 characters"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  sku: z.string().optional(),
  unitValue: z.coerce.number().min(0, "UnitValue must be 0 or greater").optional(),
  unit: z.string().optional(),
  mrp: z.coerce.number().min(0, "MRP must be 0 or greater").optional(),
  sellingPrice: z.coerce.number().min(0, "Selling price must be 0 or greater").optional(),
  bulkPricing: z.array(bulkPriceTierSchema).optional(),
  stock: z.coerce.number().int().min(0, "Stock must be 0 or greater").optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["active", "inactive"]),
  image: z.any().optional(),
  nutritionValues: z.record(nutritionEntrySchema).optional(),
  ingredients: z.array(z.string().min(1, "Ingredient cannot be empty")).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const roleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters"),
});

export type RoleFormData = z.infer<typeof roleSchema>;

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^\+?[\d\s-()]+$/, "Invalid phone number"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const settingsSchema = z.object({
  siteName: z
    .string()
    .min(1, "Site name is required")
    .max(100, "Site name must be less than 100 characters"),
  siteDescription: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  contactEmail: z
    .string()
    .min(1, "Contact email is required")
    .email("Invalid email address"),
  contactPhone: z
    .string()
    .min(1, "Contact phone is required")
    .regex(/^\+?[\d\s-()]+$/, "Invalid phone number"),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
