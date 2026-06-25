import { del, get, upload } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug?: string;
  description?: string;
  sku?: string;
  image?: string;
  gallery?: string[];
  weight?: number;
  unit?: string;
  mrp?: number;
  sellingPrice?: number;
  bulkPrice?: number;
  stock?: number;
  minBulkQty?: number;
  isFeatured?: boolean;
  status: "active" | "inactive";
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
  slug?: string;
  description?: string;
  sku?: string;
  image?: File;
  gallery?: File[];
  weight?: number;
  unit?: string;
  mrp?: number;
  sellingPrice?: number;
  bulkPrice?: number;
  stock?: number;
  minBulkQty?: number;
  isFeatured?: boolean;
  status?: "active" | "inactive";
}

export interface UpdateProductDto {
  categoryId?: string;
  name?: string;
  slug?: string;
  description?: string;
  sku?: string;
  image?: File;
  gallery?: File[];
  weight?: number;
  unit?: string;
  mrp?: number;
  sellingPrice?: number;
  bulkPrice?: number;
  stock?: number;
  minBulkQty?: number;
  isFeatured?: boolean;
  status?: "active" | "inactive";
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
    
    if (data.slug) formData.append("slug", data.slug);
    if (data.description) formData.append("description", data.description);
    if (data.sku) formData.append("sku", data.sku);
    if (data.weight) formData.append("weight", data.weight.toString());
    if (data.unit) formData.append("unit", data.unit);
    if (data.mrp) formData.append("mrp", data.mrp.toString());
    if (data.sellingPrice) formData.append("sellingPrice", data.sellingPrice.toString());
    if (data.bulkPrice) formData.append("bulkPrice", data.bulkPrice.toString());
    if (data.stock) formData.append("stock", data.stock.toString());
    if (data.minBulkQty) formData.append("minBulkQty", data.minBulkQty.toString());
    if (data.isFeatured !== undefined) formData.append("isFeatured", data.isFeatured.toString());
    
    // Convert status to isActive
    if (data.status) {
      formData.append("isActive", (data.status === 'active').toString());
    }
    
    // Add image file
    if (data.image) {
      formData.append("image", data.image);
    }
    
    // Add gallery files
    if (data.gallery && data.gallery.length > 0) {
      data.gallery.forEach(file => {
        formData.append("gallery", file);
      });
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
    if (data.slug) formData.append("slug", data.slug);
    if (data.description) formData.append("description", data.description);
    if (data.sku) formData.append("sku", data.sku);
    if (data.weight) formData.append("weight", data.weight.toString());
    if (data.unit) formData.append("unit", data.unit);
    if (data.mrp) formData.append("mrp", data.mrp.toString());
    if (data.sellingPrice) formData.append("sellingPrice", data.sellingPrice.toString());
    if (data.bulkPrice) formData.append("bulkPrice", data.bulkPrice.toString());
    if (data.stock !== undefined) formData.append("stock", data.stock.toString());
    if (data.minBulkQty !== undefined) formData.append("minBulkQty", data.minBulkQty.toString());
    if (data.isFeatured !== undefined) formData.append("isFeatured", data.isFeatured.toString());
    
    // Convert status to isActive
    if (data.status) {
      formData.append("isActive", (data.status === 'active').toString());
    }
    
    // Add image file if provided
    if (data.image) {
      formData.append("image", data.image);
    }
    
    // Add gallery files if provided
    if (data.gallery && data.gallery.length > 0) {
      data.gallery.forEach(file => {
        formData.append("gallery", file);
      });
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
