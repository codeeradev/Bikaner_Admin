import { mockProducts } from "@/mock-data/products";
import type { Product } from "@/types";
import { create } from "zustand";

interface ProductState {
  products: Product[];
  searchQuery: string;
  statusFilter: string;
  categoryFilter: string;
  isLoading: boolean;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: string) => void;
  setCategoryFilter: (filter: string) => void;
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getFilteredProducts: () => Product[];
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: mockProducts,
  searchQuery: "",
  statusFilter: "all",
  categoryFilter: "all",
  isLoading: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setCategoryFilter: (filter) => set({ categoryFilter: filter }),

  addProduct: (product) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ products: [...state.products, newProduct] }));
  },

  updateProduct: (id, product) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...product } : p,
      ),
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  getFilteredProducts: () => {
    const { products, searchQuery, statusFilter, categoryFilter } = get();
    return products.filter((product) => {
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || product.categoryId === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  },
}));
