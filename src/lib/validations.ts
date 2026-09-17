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
  maxQuantity: z.coerce.number().int().min(1, "Max quantity must be at least 1").optional().nullable(),
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

export const franchiseSchema = z.object({
  name: z
    .string()
    .min(1, "Store name is required")
    .max(150, "Name must be less than 150 characters"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(300, "Address must be less than 300 characters"),
  cityId: z.string().min(1, "City is required"),
  zoneId: z.string().min(1, "Zone is required"),
  lat: z
    .string()
    .min(1, "Latitude is required")
    .refine((v) => !Number.isNaN(Number(v)), "Latitude must be a number")
    .refine(
      (v) => Number(v) >= -90 && Number(v) <= 90,
      "Latitude must be between -90 and 90",
    ),
  lng: z
    .string()
    .min(1, "Longitude is required")
    .refine((v) => !Number.isNaN(Number(v)), "Longitude must be a number")
    .refine(
      (v) => Number(v) >= -180 && Number(v) <= 180,
      "Longitude must be between -180 and 180",
    ),
  managerName: z
    .string()
    .min(1, "Manager name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().min(1, "Manager email is required").email("Invalid email address"),
  // Required only when creating a store, or when resetting the password
  // on an existing one — both conditional on UI state the schema can't
  // see, so RegisteredFranchisePage enforces that half of the rule
  // itself (via setError) before calling the API.
  password: z
    .string()
    .refine((v) => v === "" || v.length >= 6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  // 10-digit mobile number, no country code — this is also the number
  // the store manager signs in with via OTP in the mobile app, so it
  // has to match that format exactly.
  phone: z
    .string()
    .min(1, "Manager phone is required")
    .regex(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"),
  status: z.enum(["active", "inactive"]),
});

export type FranchiseFormData = z.infer<typeof franchiseSchema>;

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
