export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  roleId: string;
  permissions: string[];
  status: "active" | "inactive";
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  status: "active" | "inactive";
  productCount?: number;
  createdAt: string;
}

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

export type PermissionAction = "view" | "create" | "edit" | "delete" | "manage";

export type PermissionModule =
  | "dashboard"
  | "categories"
  | "products"
  | "zones"
  | "cities"
  | "orders"
  | "normalOrders"
  | "bulkOrders"
  | "franchise"
  | "franchiseRequests"
  | "registeredFranchises"
  | "users"
  | "roles"
  | "wallet"
  | "settings"
  | "theme"
  | "profile";

export interface Permission {
  module: PermissionModule;
  action: PermissionAction;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[]; // Array of permission strings like "products:view"
  isActive: boolean;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionsByModule {
  [module: string]: string[];
}

export interface Staff {
  id: string;
  name: string;
  email?: string;
  mobile: string;
  roleId: string;
  role?: {
    id: string;
    name: string;
    permissions: string[];
  };
  profileImage?: string;
  cityId?: string;
  city?: {
    id: string;
    name: string;
  };
  zoneIds?: string[];
  zones?: Array<{
    id: string;
    name: string;
  }>;
  status: "active" | "inactive";
  isBlocked?: boolean;
  createdAt: string;
  updatedAt: string;
}
  | "categories"
  | "products"
  | "orders"
  | "wallet"
  | "franchise"
  | "theme"
  | "settings";

export interface Permission {
  section: PermissionSection;
  actions: Record<PermissionAction, boolean>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number;
  createdAt: string;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  sidebarBg: string;
  navbarBg: string;
  cardBg: string;
  buttonColor: string;
  textColor: string;
  darkMode: boolean;
}

export interface Profile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalProducts: number;
  totalCategories: number;
  totalFranchise: number;
  franchiseRequests: number;
  totalOrders: number;
  bulkOrders: number;
  walletBalance: number;
}

export interface Order {
  id: string;
  customerName: string;
  productCount: number;
  quantity: number;
  amount: number;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "packed"
    | "shipped"
    | "delivered"
    | "cancelled";
  date: string;
}

export interface FranchiseRequest {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  address: string;
  businessName: string;
  requestDate: string;
  status: "pending" | "approved" | "rejected";
}

export interface InventoryItem {
  product: string;
  sku: string;
  stockLevel: number;
  maxStock: number;
  reorderPoint: number;
  status: "healthy" | "low" | "critical";
  warehouse: string;
  expiryDate: string;
}

export interface TopProduct {
  name: string;
  sku: string;
  unitsSold: number;
  revenue: number;
  growth: number;
  region: string;
}

export interface DeliveryShipment {
  id: string;
  destination: string;
  distributor: string;
  items: number;
  status: "in_transit" | "out_for_delivery" | "delivered" | "delayed";
  eta: string;
  progress: number;
}

export interface ProductionLine {
  lineName: string;
  oee: number;
  efficiency: number;
  outputToday: number;
  target: number;
  wastePercent: number;
  status: "running" | "idle" | "maintenance";
}

export interface DistributorPerformance {
  name: string;
  region: string;
  ordersThisMonth: number;
  revenue: number;
  onTimeDelivery: number;
  rating: number;
  trend: number;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
}

export interface DialogState {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: (() => void) | null;
}
