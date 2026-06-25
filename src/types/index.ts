export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: "active" | "inactive";
  productCount: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  image: string;
  description: string;
  userPrice: number;
  franchisePrice: number;
  bulkPrice: number;
  minOrder: number;
  maxOrder: number;
  status: "active" | "inactive";
  createdAt: string;
}

export type PermissionAction = "view" | "create" | "edit" | "delete";

export type PermissionSection =
  | "dashboard"
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
