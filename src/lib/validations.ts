import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
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
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters"),
  image: z.string().min(0),
  status: z.enum(["active", "inactive"]),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const productSchema = z
  .object({
    name: z
      .string()
      .min(1, "Product name is required")
      .max(200, "Name must be less than 200 characters"),
    sku: z
      .string()
      .min(1, "SKU is required")
      .max(50, "SKU must be less than 50 characters"),
    categoryId: z.string().min(1, "Category is required"),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters"),
    image: z.string().min(0),
    userPrice: z.number().min(0, "Price must be 0 or greater"),
    franchisePrice: z.number().min(0, "Franchise price must be 0 or greater"),
    bulkPrice: z.number().min(0, "Bulk price must be 0 or greater"),
    minOrder: z.number().int().min(1, "Minimum order must be at least 1"),
    maxOrder: z.number().int().min(1, "Maximum order must be at least 1"),
    status: z.enum(["active", "inactive"]),
  })
  .refine((data) => data.maxOrder >= data.minOrder, {
    message: "Maximum order must be greater than or equal to minimum order",
    path: ["maxOrder"],
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
