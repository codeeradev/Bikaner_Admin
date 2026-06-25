import { del, get, post, put, upload } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  status: "active" | "inactive";
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  image?: File | string;
  status?: "active" | "inactive";
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  image?: File | string;
  status?: "active" | "inactive";
}

export interface CategoryListResponse {
  data: Category[];
  total: number;
  page: number;
  pageSize: number;
}

export const categoryService = {
  /**
   * Get all categories with pagination
   */
  async getCategories(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: "active" | "inactive";
  }): Promise<CategoryListResponse> {
    console.log("🔵 Fetching categories with params:", params);
    console.log("🔵 Endpoint:", ENDPOINTS.GET_CATEGORIES);

    try {
      const response = await get<CategoryListResponse>(
        ENDPOINTS.GET_CATEGORIES,
        params,
      );
      console.log("✅ Categories fetched successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      throw error;
    }
  },

  /**
   * Get a single category by ID
   */
  async getCategory(id: string): Promise<Category> {
    console.log("🔵 Fetching category:", id);
    console.log("🔵 Endpoint:", ENDPOINTS.GET_CATEGORY(id));

    try {
      const response = await get<Category>(ENDPOINTS.GET_CATEGORY(id));
      console.log("✅ Category fetched successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to fetch category:", error);
      throw error;
    }
  },

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    console.log("🔵 Creating category with data:", data);
    console.log("🔵 Endpoint:", ENDPOINTS.CREATE_CATEGORY);

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      
      if (data.slug) formData.append("slug", data.slug);
      if (data.description) formData.append("description", data.description);
      
      // Convert status to isActive for backend
      if (data.status) {
        formData.append("isActive", (data.status === 'active').toString());
      }
      
      // Add image file if provided
      if (data.image instanceof File) {
        formData.append("image", data.image);
      }
      
      const response = await upload<Category>(ENDPOINTS.CREATE_CATEGORY, formData);
      console.log("✅ Category created successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to create category:", error);
      throw error;
    }
  },

  /**
   * Update an existing category
   */
  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    console.log("🔵 Updating category:", id, "with data:", data);
    console.log("🔵 Endpoint:", ENDPOINTS.UPDATE_CATEGORY(id));

    try {
      const formData = new FormData();
      
      if (data.name) formData.append("name", data.name);
      if (data.slug) formData.append("slug", data.slug);
      if (data.description) formData.append("description", data.description);
      
      // Convert status to isActive for backend
      if (data.status) {
        formData.append("isActive", (data.status === 'active').toString());
      }
      
      // Add image file if provided
      if (data.image instanceof File) {
        formData.append("image", data.image);
      }
      
      const response = await upload<Category>(ENDPOINTS.UPDATE_CATEGORY(id), formData, undefined, 'PUT');
      console.log("✅ Category updated successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to update category:", error);
      throw error;
    }
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    console.log("🔵 Deleting category:", id);
    console.log("🔵 Endpoint:", ENDPOINTS.DELETE_CATEGORY(id));

    try {
      await del<void>(ENDPOINTS.DELETE_CATEGORY(id));
      console.log("✅ Category deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete category:", error);
      throw error;
    }
  },

  /**
   * Upload category image
   */
  async uploadCategoryImage(
    categoryId: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("image", file);

    return upload<{ url: string }>(
      ENDPOINTS.UPDATE_CATEGORY(categoryId),
      formData,
      onProgress,
      'PUT'
    );
  },
};
