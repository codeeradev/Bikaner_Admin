import { categoryService } from "@/api";
import type { ApiError, Category, CategoryListResponse } from "@/api";
import { create } from "zustand";
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/api";

interface CategoryState {
  categories: Category[];
  searchQuery: string;
  statusFilter: string;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;

  // Actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: string) => void;
  setPage: (page: number) => void;
  fetchCategories: () => Promise<void>;
  addCategory: (category: CreateCategoryDto) => Promise<void>;

updateCategory: (
  id: string,
  category: UpdateCategoryDto
) => Promise<void>;

  deleteCategory: (id: string) => Promise<void>;
  getFilteredCategories: () => Category[];
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  searchQuery: "",
  statusFilter: "all",
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 20,

  setSearchQuery: (query) => {
    set({ searchQuery: query, page: 1 });
  },

  setStatusFilter: (filter) => {
    set({ statusFilter: filter, page: 1 });
  },

  setPage: (page) => {
    set({ page });
    get().fetchCategories();
  },

  fetchCategories: async () => {
    const { searchQuery, statusFilter, page, pageSize } = get();
    set({ isLoading: true, error: null });

    try {
      const response: CategoryListResponse =
        await categoryService.getCategories({
          page,
          pageSize,
          search: searchQuery || undefined,
          status:
            statusFilter !== "all"
              ? (statusFilter as "active" | "inactive")
              : undefined,
        });

      set({
        categories: response.data,
        total: response.total,
        isLoading: false,
      });
    } catch (err) {
      const apiError = err as ApiError;
      set({
        error: apiError.message || "Failed to fetch categories",
        isLoading: false,
      });
    }
  },

  addCategory: async (category) => {
    set({ isLoading: true, error: null });

    try {
      await categoryService.createCategory(category);

      await get().fetchCategories();
    } catch (err) {
      const apiError = err as ApiError;

      set({
        error: apiError.message || "Failed to create category",
        isLoading: false,
      });

      throw err;
    }
  },

  updateCategory: async (id, category) => {
    set({ isLoading: true, error: null });

    try {
      await categoryService.updateCategory(id, category);

      await get().fetchCategories();
    } catch (err) {
      const apiError = err as ApiError;

      set({
        error: apiError.message || "Failed to update category",
        isLoading: false,
      });

      throw err;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await categoryService.deleteCategory(id);

      // Refresh the list
      await get().fetchCategories();
    } catch (err) {
      const apiError = err as ApiError;
      set({
        error: apiError.message || "Failed to delete category",
        isLoading: false,
      });
      throw err;
    }
  },

  getFilteredCategories: () => {
    return get().categories;
  },
}));
