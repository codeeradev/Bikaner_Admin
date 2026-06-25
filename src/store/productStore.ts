import { productService } from "@/api";
import type { ApiError, Product, ProductListResponse } from "@/api";
import { create } from "zustand";

interface ProductState {
  products: Product[];
  searchQuery: string;
  statusFilter: string;
  categoryFilter: string;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;

  // Actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: string) => void;
  setCategoryFilter: (filter: string) => void;
  setPage: (page: number) => void;
  fetchProducts: () => Promise<void>;
  addProduct: (product: any) => Promise<void>;
  updateProduct: (id: string, product: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getFilteredProducts: () => Product[];
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  searchQuery: "",
  statusFilter: "all",
  categoryFilter: "all",
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 100,

  setSearchQuery: (query) => {
    set({ searchQuery: query, page: 1 });
  },

  setStatusFilter: (filter) => {
    set({ statusFilter: filter, page: 1 });
  },

  setCategoryFilter: (filter) => {
    set({ categoryFilter: filter, page: 1 });
  },

  setPage: (page) => {
    set({ page });
    get().fetchProducts();
  },

  fetchProducts: async () => {
    const { searchQuery, statusFilter, categoryFilter, page, pageSize } = get();
    set({ isLoading: true, error: null });

    try {
      const response: ProductListResponse = await productService.getProducts({
        page,
        pageSize,
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? (statusFilter as "active" | "inactive") : undefined,
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
      });

      set({
        products: response.data,
        total: response.total,
        isLoading: false,
      });
    } catch (err) {
      const apiError = err as ApiError;
      set({
        error: apiError.message || "Failed to fetch products",
        isLoading: false,
      });
    }
  },

  addProduct: async (productData) => {
    set({ isLoading: true, error: null });

    try {
      await productService.createProduct(productData);
      await get().fetchProducts();
    } catch (err) {
      const apiError = err as ApiError;
      set({
        error: apiError.message || "Failed to create product",
        isLoading: false,
      });
      throw err;
    }
  },

  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null });

    try {
      await productService.updateProduct(id, productData);
      await get().fetchProducts();
    } catch (err) {
      const apiError = err as ApiError;
      set({
        error: apiError.message || "Failed to update product",
        isLoading: false,
      });
      throw err;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await productService.deleteProduct(id);
      await get().fetchProducts();
    } catch (err) {
      const apiError = err as ApiError;
      set({
        error: apiError.message || "Failed to delete product",
        isLoading: false,
      });
      throw err;
    }
  },

  getFilteredProducts: () => {
    return get().products;
  },
}));
