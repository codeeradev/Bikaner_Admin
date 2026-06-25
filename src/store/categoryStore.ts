import { mockCategories } from "@/mock-data/categories";
import type { Category } from "@/types";
import { create } from "zustand";

interface CategoryState {
  categories: Category[];
  searchQuery: string;
  statusFilter: string;
  isLoading: boolean;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: string) => void;
  addCategory: (
    category: Omit<Category, "id" | "createdAt" | "productCount">,
  ) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getFilteredCategories: () => Category[];
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: mockCategories,
  searchQuery: "",
  statusFilter: "all",
  isLoading: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),

  addCategory: (category) => {
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      productCount: 0,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ categories: [...state.categories, newCategory] }));
  },

  updateCategory: (id, category) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...category } : c,
      ),
    }));
  },

  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },

  getFilteredCategories: () => {
    const { categories, searchQuery, statusFilter } = get();
    return categories.filter((category) => {
      const matchesSearch =
        !searchQuery ||
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || category.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  },
}));
