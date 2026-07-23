import { del, get, upload } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export interface NutritionEntry {
  value: number;
  unit: string;
}

export type NutritionValues = Record<string, NutritionEntry>;

export interface BulkPriceTier {
  minQty: number;
  maxQty: number;
  price: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  sku?: string;
  image?: string;
  unitValue?: number;
  unit?: string;
  mrp?: number;
  sellingPrice?: number;
  bulkPricing?: BulkPriceTier[];
  stock?: number;
  isFeatured?: boolean;
  status: "active" | "inactive";
  nutritionValues?: NutritionValues;
  ingredients?: string[];
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface CreateProductDto {
  categoryId: string;
  name: string;
  description?: string;
  sku?: string;
  image?: File;
  unitValue?: number;
  unit?: string;
  mrp?: number;
  sellingPrice?: number;
  bulkPricing?: BulkPriceTier[];
  stock?: number;
  isFeatured?: boolean;
  status?: "active" | "inactive";
  nutritionValues?: NutritionValues;
  ingredients?: string[];
}

export interface UpdateProductDto {
  categoryId?: string;
  name?: string;
  description?: string;
  sku?: string;
  image?: File;
  unitValue?: number;
  unit?: string;
  mrp?: number;
  sellingPrice?: number;
  bulkPricing?: BulkPriceTier[];
  stock?: number;
  isFeatured?: boolean;
  status?: "active" | "inactive";
  nutritionValues?: NutritionValues;
  ingredients?: string[];
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export const productService = {
  /**
   * Get all products with pagination
   */
  async getProducts(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: string;
    status?: "active" | "inactive";
    isFeatured?: boolean;
  }): Promise<ProductListResponse> {
    return get<ProductListResponse>(ENDPOINTS.GET_PRODUCTS, params);
  },

  /**
   * Get a single product by ID
   */
  async getProduct(id: string): Promise<Product> {
    return get<Product>(ENDPOINTS.GET_PRODUCT(id));
  },

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductDto): Promise<Product> {
    const formData = new FormData();
    
    // Add text fields
    formData.append("name", data.name);
    formData.append("categoryId", data.categoryId);
    
    if (data.description !== undefined) formData.append("description", data.description);
    if (data.sku !== undefined ) formData.append("sku", data.sku);
    if (data.unitValue !== undefined) formData.append("unitValue", data.unitValue.toString());
    if (data.unit !== undefined) formData.append("unit", data.unit);
    if (data.mrp !== undefined) formData.append("mrp", data.mrp.toString());
    if (data.sellingPrice !== undefined) formData.append("sellingPrice", data.sellingPrice.toString());
    if (data.stock !== undefined) formData.append("stock", data.stock.toString());
    if (data.isFeatured !== undefined) formData.append("isFeatured", data.isFeatured.toString());
    
    // Convert status to isActive
    if (data.status) {
      formData.append("isActive", (data.status === 'active').toString());
    }
    
    // Add image file
    if (data.image) {
      formData.append("image", data.image);
    }
    
    // Add nutritionValues as JSON string
    if (data.nutritionValues && Object.keys(data.nutritionValues).length > 0) {
      formData.append("nutritionValues", JSON.stringify(data.nutritionValues));
    }
    
    // Add ingredients as JSON string
    if (data.ingredients && data.ingredients.length > 0) {
      formData.append("ingredients", JSON.stringify(data.ingredients));
    }
    
    // Add bulkPricing as JSON string
    if (data.bulkPricing && data.bulkPricing.length > 0) {
      formData.append("bulkPricing", JSON.stringify(data.bulkPricing));
    }
    
    return upload<Product>(ENDPOINTS.CREATE_PRODUCT, formData);
  },

  /**
   * Update an existing product
   */
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const formData = new FormData();
    
    // Add text fields
    if (data.name) formData.append("name", data.name);
    if (data.categoryId) formData.append("categoryId", data.categoryId);
    if (data.description) formData.append("description", data.description);
    if (data.sku) formData.append("sku", data.sku);
    if (data.unitValue) formData.append("unitValue", data.unitValue.toString());
    if (data.unit) formData.append("unit", data.unit);
    if (data.mrp !== undefined) formData.append("mrp", data.mrp.toString());
    if (data.sellingPrice !== undefined) formData.append("sellingPrice", data.sellingPrice.toString());
    if (data.stock !== undefined) formData.append("stock", data.stock.toString());
    if (data.isFeatured !== undefined) formData.append("isFeatured", data.isFeatured.toString());
    
    // Convert status to isActive
    if (data.status) {
      formData.append("isActive", (data.status === 'active').toString());
    }
    
    // Add image file if provided
    if (data.image) {
      formData.append("image", data.image);
    }
    
    // Add nutritionValues as JSON string
    if (data.nutritionValues !== undefined) {
      formData.append("nutritionValues", JSON.stringify(data.nutritionValues));
    }
    
    // Add ingredients as JSON string
    if (data.ingredients !== undefined) {
      formData.append("ingredients", JSON.stringify(data.ingredients));
    }
    
    // Add bulkPricing as JSON string
    if (data.bulkPricing !== undefined) {
      formData.append("bulkPricing", JSON.stringify(data.bulkPricing));
    }
    
    return upload<Product>(ENDPOINTS.UPDATE_PRODUCT(id), formData, undefined, 'PUT');
  },

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<void> {
    return del<void>(ENDPOINTS.DELETE_PRODUCT(id));
  },
};
