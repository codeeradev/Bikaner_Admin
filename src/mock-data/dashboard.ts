import type { DashboardStats, FranchiseRequest, Order } from "@/types";

export const mockDashboardStats: DashboardStats = {
  totalRevenue: 245890.5,
  totalProducts: 320,
  totalCategories: 15,
  totalFranchise: 28,
  franchiseRequests: 7,
  totalOrders: 1456,
  bulkOrders: 234,
  walletBalance: 45230.75,
};

// FMCG / Biscuit business specific stats
export const mockFmcgStats = {
  totalOrders: 1456,
  todaySales: 284750,
  inventoryStatus: 87,
  lowStockAlerts: 12,
  topSellingProduct: "Marie Gold",
  distributorPerformance: 94,
  retailerActivity: 312,
  revenueAnalytics: 245.89,
  deliveryTracking: 89,
  productionMetrics: 78,
};

// Extended biscuit product catalog
export interface BiscuitProduct {
  name: string;
  sku: string;
  category: string;
  mrp: number;
  packSize: string;
  shelfLifeMonths: number;
  weightGrams: number;
}

export const mockBiscuitCatalog: BiscuitProduct[] = [
  {
    name: "Marie Gold",
    sku: "BB-MG-001",
    category: "Marie",
    mrp: 20,
    packSize: "150g",
    shelfLifeMonths: 6,
    weightGrams: 150,
  },
  {
    name: "Bourbon",
    sku: "BB-BB-002",
    category: "Cream",
    mrp: 25,
    packSize: "200g",
    shelfLifeMonths: 8,
    weightGrams: 200,
  },
  {
    name: "Nice Biscuit",
    sku: "BB-NB-003",
    category: "Butter",
    mrp: 15,
    packSize: "100g",
    shelfLifeMonths: 6,
    weightGrams: 100,
  },
  {
    name: "Glucose",
    sku: "BB-GL-004",
    category: "Glucose",
    mrp: 10,
    packSize: "75g",
    shelfLifeMonths: 9,
    weightGrams: 75,
  },
  {
    name: "Krackjack",
    sku: "BB-KJ-005",
    category: "Cracker",
    mrp: 18,
    packSize: "150g",
    shelfLifeMonths: 7,
    weightGrams: 150,
  },
  {
    name: "Parle-G",
    sku: "BB-PG-006",
    category: "Glucose",
    mrp: 5,
    packSize: "56g",
    shelfLifeMonths: 12,
    weightGrams: 56,
  },
  {
    name: "Cream Cracker",
    sku: "BB-CC-007",
    category: "Cracker",
    mrp: 22,
    packSize: "200g",
    shelfLifeMonths: 8,
    weightGrams: 200,
  },
  {
    name: "Digestive",
    sku: "BB-DG-008",
    category: "Health",
    mrp: 35,
    packSize: "250g",
    shelfLifeMonths: 6,
    weightGrams: 250,
  },
  {
    name: "Butter Cookies",
    sku: "BB-BC-009",
    category: "Cookies",
    mrp: 40,
    packSize: "200g",
    shelfLifeMonths: 5,
    weightGrams: 200,
  },
  {
    name: "Fruit Biscuit",
    sku: "BB-FB-010",
    category: "Fruit",
    mrp: 30,
    packSize: "150g",
    shelfLifeMonths: 6,
    weightGrams: 150,
  },
  {
    name: "Jeera Cracker",
    sku: "BB-JC-011",
    category: "Cracker",
    mrp: 20,
    packSize: "150g",
    shelfLifeMonths: 8,
    weightGrams: 150,
  },
  {
    name: "Coconut Crunch",
    sku: "BB-CO-012",
    category: "Cookies",
    mrp: 28,
    packSize: "150g",
    shelfLifeMonths: 5,
    weightGrams: 150,
  },
];

// Manufacturing KPIs
export interface ManufacturingKpi {
  lineName: string;
  oee: number;
  batchYield: number;
  wastagePercent: number;
  throughputPerHour: number;
  downtimeMinutes: number;
}

export const mockManufacturingKpis: ManufacturingKpi[] = [
  {
    lineName: "Line A - Marie Gold",
    oee: 92,
    batchYield: 97.2,
    wastagePercent: 2.1,
    throughputPerHour: 520,
    downtimeMinutes: 18,
  },
  {
    lineName: "Line B - Bourbon",
    oee: 87,
    batchYield: 94.5,
    wastagePercent: 3.2,
    throughputPerHour: 410,
    downtimeMinutes: 32,
  },
  {
    lineName: "Line C - Glucose",
    oee: 94,
    batchYield: 98.1,
    wastagePercent: 1.8,
    throughputPerHour: 680,
    downtimeMinutes: 12,
  },
  {
    lineName: "Line D - Packaging",
    oee: 78,
    batchYield: 91.0,
    wastagePercent: 4.5,
    throughputPerHour: 380,
    downtimeMinutes: 55,
  },
];

// Supply chain — super stockists and distributors
export interface SupplyChainPartner {
  name: string;
  type: "super_stockist" | "distributor" | "stockist";
  region: string;
  city: string;
  coverageStores: number;
  monthlyVolume: number; // in kg
  creditLimit: number;
  outstanding: number;
  rating: number;
}

export const mockSupplyChainPartners: SupplyChainPartner[] = [
  {
    name: "Sharma Distributors",
    type: "super_stockist",
    region: "Rajasthan",
    city: "Jaipur",
    coverageStores: 420,
    monthlyVolume: 8500,
    creditLimit: 500000,
    outstanding: 125000,
    rating: 4.8,
  },
  {
    name: "Gupta Wholesale",
    type: "super_stockist",
    region: "Delhi NCR",
    city: "Delhi",
    coverageStores: 680,
    monthlyVolume: 12000,
    creditLimit: 800000,
    outstanding: 210000,
    rating: 4.6,
  },
  {
    name: "Patel Retail Mart",
    type: "distributor",
    region: "Karnataka",
    city: "Bangalore",
    coverageStores: 310,
    monthlyVolume: 5200,
    creditLimit: 300000,
    outstanding: 89000,
    rating: 4.4,
  },
  {
    name: "Reddy Distribution",
    type: "distributor",
    region: "Andhra Pradesh",
    city: "Hyderabad",
    coverageStores: 390,
    monthlyVolume: 7100,
    creditLimit: 400000,
    outstanding: 156000,
    rating: 4.7,
  },
  {
    name: "Agarwal Supermart",
    type: "stockist",
    region: "Maharashtra",
    city: "Mumbai",
    coverageStores: 250,
    monthlyVolume: 3800,
    creditLimit: 250000,
    outstanding: 72000,
    rating: 4.2,
  },
  {
    name: "Singh Brothers",
    type: "distributor",
    region: "Punjab",
    city: "Amritsar",
    coverageStores: 280,
    monthlyVolume: 4600,
    creditLimit: 280000,
    outstanding: 54000,
    rating: 4.5,
  },
  {
    name: "Iyer Traders",
    type: "stockist",
    region: "Tamil Nadu",
    city: "Chennai",
    coverageStores: 190,
    monthlyVolume: 3200,
    creditLimit: 200000,
    outstanding: 48000,
    rating: 4.3,
  },
  {
    name: "Bose & Co.",
    type: "distributor",
    region: "West Bengal",
    city: "Kolkata",
    coverageStores: 340,
    monthlyVolume: 5800,
    creditLimit: 350000,
    outstanding: 92000,
    rating: 4.6,
  },
];

export const mockRecentOrders: Order[] = [
  {
    id: "ORD-2024-001",
    customerName: "Sharma Distributors",
    productCount: 3,
    quantity: 150,
    amount: 45250.0,
    paymentStatus: "paid",
    orderStatus: "delivered",
    date: "2024-06-18T10:30:00Z",
  },
  {
    id: "ORD-2024-002",
    customerName: "Patel Retail Mart",
    productCount: 2,
    quantity: 80,
    amount: 18990.0,
    paymentStatus: "pending",
    orderStatus: "processing",
    date: "2024-06-18T09:15:00Z",
  },
  {
    id: "ORD-2024-003",
    customerName: "Gupta Wholesale",
    productCount: 5,
    quantity: 250,
    amount: 87550.0,
    paymentStatus: "paid",
    orderStatus: "shipped",
    date: "2024-06-17T16:45:00Z",
  },
  {
    id: "ORD-2024-004",
    customerName: "Kirana King Stores",
    productCount: 1,
    quantity: 500,
    amount: 69950.0,
    paymentStatus: "failed",
    orderStatus: "pending",
    date: "2024-06-17T14:20:00Z",
  },
  {
    id: "ORD-2024-005",
    customerName: "Agarwal Supermart",
    productCount: 4,
    quantity: 120,
    amount: 32400.0,
    paymentStatus: "paid",
    orderStatus: "confirmed",
    date: "2024-06-16T11:00:00Z",
  },
  {
    id: "ORD-2024-006",
    customerName: "Verma General Store",
    productCount: 2,
    quantity: 60,
    amount: 15600.0,
    paymentStatus: "refunded",
    orderStatus: "cancelled",
    date: "2024-06-16T08:30:00Z",
  },
  {
    id: "ORD-2024-007",
    customerName: "Reddy Distribution",
    productCount: 3,
    quantity: 180,
    amount: 54000.0,
    paymentStatus: "paid",
    orderStatus: "packed",
    date: "2024-06-15T15:00:00Z",
  },
  {
    id: "ORD-2024-008",
    customerName: "Singh Brothers Retail",
    productCount: 6,
    quantity: 300,
    amount: 120000.0,
    paymentStatus: "pending",
    orderStatus: "pending",
    date: "2024-06-15T10:45:00Z",
  },
];

export const mockRecentFranchiseRequests: FranchiseRequest[] = [
  {
    id: "FRQ-001",
    applicantName: "Ramesh Kumar",
    email: "ramesh@biscuitmart.com",
    phone: "+91-98765-43201",
    address: "45 Gandhi Road, Jaipur, Rajasthan",
    businessName: "Kumar Biscuit Mart",
    requestDate: "2024-06-18T08:00:00Z",
    status: "pending",
  },
  {
    id: "FRQ-002",
    applicantName: "Priya Sharma",
    email: "priya@snackshack.in",
    phone: "+91-98765-43202",
    address: "78 MG Road, Bangalore, Karnataka",
    businessName: "Sharma Snack Shack",
    requestDate: "2024-06-17T14:30:00Z",
    status: "pending",
  },
  {
    id: "FRQ-003",
    applicantName: "Mohammed Ali",
    email: "ali@biscuitworld.com",
    phone: "+91-98765-43203",
    address: "22 Park Street, Kolkata, West Bengal",
    businessName: "Ali Biscuit World",
    requestDate: "2024-06-16T11:00:00Z",
    status: "approved",
  },
  {
    id: "FRQ-004",
    applicantName: "Lakshmi Iyer",
    email: "lakshmi@bakersdelight.in",
    phone: "+91-98765-43204",
    address: "33 Anna Salai, Chennai, Tamil Nadu",
    businessName: "Iyer Bakers Delight",
    requestDate: "2024-06-15T09:45:00Z",
    status: "pending",
  },
  {
    id: "FRQ-005",
    applicantName: "Harpreet Singh",
    email: "harpreet@punjabfoods.com",
    phone: "+91-98765-43205",
    address: "12 GT Road, Amritsar, Punjab",
    businessName: "Singh Punjab Foods",
    requestDate: "2024-06-14T16:20:00Z",
    status: "rejected",
  },
];

export const mockRevenueData = [
  { month: "Jan", revenue: 185, orders: 120 },
  { month: "Feb", revenue: 221, orders: 145 },
  { month: "Mar", revenue: 198, orders: 132 },
  { month: "Apr", revenue: 254, orders: 168 },
  { month: "May", revenue: 289, orders: 190 },
  { month: "Jun", revenue: 312, orders: 210 },
];

export const mockFranchiseGrowthData = [
  { month: "Jan", active: 12, requests: 5 },
  { month: "Feb", active: 15, requests: 8 },
  { month: "Mar", active: 18, requests: 6 },
  { month: "Apr", active: 22, requests: 10 },
  { month: "May", active: 25, requests: 7 },
  { month: "Jun", active: 28, requests: 9 },
];

// Inventory data
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

export const mockInventoryItems: InventoryItem[] = [
  {
    product: "Marie Gold",
    sku: "BB-MG-001",
    stockLevel: 4500,
    maxStock: 5000,
    reorderPoint: 1000,
    status: "healthy",
    warehouse: "Jaipur WH",
    expiryDate: "2024-12-15",
  },
  {
    product: "Bourbon",
    sku: "BB-BB-002",
    stockLevel: 3200,
    maxStock: 5000,
    reorderPoint: 1000,
    status: "healthy",
    warehouse: "Delhi WH",
    expiryDate: "2024-11-20",
  },
  {
    product: "Nice Biscuit",
    sku: "BB-NB-003",
    stockLevel: 850,
    maxStock: 4000,
    reorderPoint: 1000,
    status: "low",
    warehouse: "Mumbai WH",
    expiryDate: "2024-10-10",
  },
  {
    product: "Glucose",
    sku: "BB-GL-004",
    stockLevel: 6200,
    maxStock: 8000,
    reorderPoint: 2000,
    status: "healthy",
    warehouse: "Jaipur WH",
    expiryDate: "2025-01-05",
  },
  {
    product: "Krackjack",
    sku: "BB-KJ-005",
    stockLevel: 420,
    maxStock: 3000,
    reorderPoint: 800,
    status: "critical",
    warehouse: "Bangalore WH",
    expiryDate: "2024-09-28",
  },
  {
    product: "Parle-G",
    sku: "BB-PG-006",
    stockLevel: 7800,
    maxStock: 10000,
    reorderPoint: 2500,
    status: "healthy",
    warehouse: "Delhi WH",
    expiryDate: "2025-02-15",
  },
  {
    product: "Cream Cracker",
    sku: "BB-CC-007",
    stockLevel: 950,
    maxStock: 3500,
    reorderPoint: 900,
    status: "low",
    warehouse: "Chennai WH",
    expiryDate: "2024-11-01",
  },
  {
    product: "Digestive",
    sku: "BB-DG-008",
    stockLevel: 2100,
    maxStock: 4000,
    reorderPoint: 1000,
    status: "healthy",
    warehouse: "Mumbai WH",
    expiryDate: "2024-12-20",
  },
  {
    product: "Butter Cookies",
    sku: "BB-BC-009",
    stockLevel: 380,
    maxStock: 2500,
    reorderPoint: 600,
    status: "critical",
    warehouse: "Kolkata WH",
    expiryDate: "2024-09-15",
  },
  {
    product: "Fruit Biscuit",
    sku: "BB-FB-010",
    stockLevel: 1200,
    maxStock: 3000,
    reorderPoint: 800,
    status: "low",
    warehouse: "Bangalore WH",
    expiryDate: "2024-10-25",
  },
];

// Top selling products
export interface TopProduct {
  name: string;
  sku: string;
  unitsSold: number;
  revenue: number;
  growth: number;
  region: string;
}

export const mockTopProducts: TopProduct[] = [
  {
    name: "Marie Gold",
    sku: "BB-MG-001",
    unitsSold: 45200,
    revenue: 904000,
    growth: 12.5,
    region: "North India",
  },
  {
    name: "Parle-G",
    sku: "BB-PG-006",
    unitsSold: 38900,
    revenue: 389000,
    growth: 8.3,
    region: "All India",
  },
  {
    name: "Bourbon",
    sku: "BB-BB-002",
    unitsSold: 28400,
    revenue: 568000,
    growth: -2.1,
    region: "South India",
  },
  {
    name: "Glucose",
    sku: "BB-GL-004",
    unitsSold: 22100,
    revenue: 331500,
    growth: 15.7,
    region: "West India",
  },
  {
    name: "Krackjack",
    sku: "BB-KJ-005",
    unitsSold: 18700,
    revenue: 280500,
    growth: 5.4,
    region: "East India",
  },
];

// Delivery tracking
export interface DeliveryShipment {
  id: string;
  destination: string;
  distributor: string;
  items: number;
  status: "in_transit" | "out_for_delivery" | "delivered" | "delayed";
  eta: string;
  progress: number;
}

export const mockDeliveries: DeliveryShipment[] = [
  {
    id: "DEL-001",
    destination: "Jaipur, Rajasthan",
    distributor: "Sharma Distributors",
    items: 150,
    status: "in_transit",
    eta: "2024-06-19",
    progress: 65,
  },
  {
    id: "DEL-002",
    destination: "Bangalore, Karnataka",
    distributor: "Patel Retail Mart",
    items: 80,
    status: "out_for_delivery",
    eta: "2024-06-18",
    progress: 90,
  },
  {
    id: "DEL-003",
    destination: "Delhi, NCR",
    distributor: "Gupta Wholesale",
    items: 250,
    status: "delivered",
    eta: "2024-06-18",
    progress: 100,
  },
  {
    id: "DEL-004",
    destination: "Mumbai, Maharashtra",
    distributor: "Agarwal Supermart",
    items: 120,
    status: "delayed",
    eta: "2024-06-20",
    progress: 45,
  },
  {
    id: "DEL-005",
    destination: "Kolkata, West Bengal",
    distributor: "Reddy Distribution",
    items: 180,
    status: "in_transit",
    eta: "2024-06-19",
    progress: 70,
  },
];

// Production metrics
export interface ProductionLine {
  lineName: string;
  oee: number;
  efficiency: number;
  outputToday: number;
  target: number;
  wastePercent: number;
  status: "running" | "idle" | "maintenance";
}

export const mockProductionLines: ProductionLine[] = [
  {
    lineName: "Line A - Marie Gold",
    oee: 92,
    efficiency: 88,
    outputToday: 12500,
    target: 14000,
    wastePercent: 2.1,
    status: "running",
  },
  {
    lineName: "Line B - Bourbon",
    oee: 87,
    efficiency: 85,
    outputToday: 9800,
    target: 11000,
    wastePercent: 3.2,
    status: "running",
  },
  {
    lineName: "Line C - Glucose",
    oee: 94,
    efficiency: 91,
    outputToday: 15200,
    target: 16000,
    wastePercent: 1.8,
    status: "running",
  },
  {
    lineName: "Line D - Packaging",
    oee: 78,
    efficiency: 76,
    outputToday: 8400,
    target: 12000,
    wastePercent: 4.5,
    status: "maintenance",
  },
];

// Distributor performance
export interface DistributorPerformance {
  name: string;
  region: string;
  ordersThisMonth: number;
  revenue: number;
  onTimeDelivery: number;
  rating: number;
  trend: number;
}

export const mockDistributorPerformance: DistributorPerformance[] = [
  {
    name: "Sharma Distributors",
    region: "Rajasthan",
    ordersThisMonth: 45,
    revenue: 1250000,
    onTimeDelivery: 98,
    rating: 4.8,
    trend: 5.2,
  },
  {
    name: "Gupta Wholesale",
    region: "Delhi NCR",
    ordersThisMonth: 62,
    revenue: 2100000,
    onTimeDelivery: 95,
    rating: 4.6,
    trend: 8.1,
  },
  {
    name: "Patel Retail Mart",
    region: "Karnataka",
    ordersThisMonth: 38,
    revenue: 890000,
    onTimeDelivery: 92,
    rating: 4.4,
    trend: -1.3,
  },
  {
    name: "Reddy Distribution",
    region: "Andhra Pradesh",
    ordersThisMonth: 51,
    revenue: 1560000,
    onTimeDelivery: 97,
    rating: 4.7,
    trend: 3.8,
  },
  {
    name: "Agarwal Supermart",
    region: "Maharashtra",
    ordersThisMonth: 29,
    revenue: 720000,
    onTimeDelivery: 89,
    rating: 4.2,
    trend: 2.1,
  },
];

// Revenue by region for charts
export const mockRevenueByRegion = [
  { region: "North India", revenue: 89.5, orders: 520 },
  { region: "South India", revenue: 67.2, orders: 410 },
  { region: "West India", revenue: 54.8, orders: 310 },
  { region: "East India", revenue: 34.4, orders: 216 },
];

// Monthly production vs sales
export const mockProductionVsSales = [
  { month: "Jan", production: 185, sales: 172 },
  { month: "Feb", production: 210, sales: 198 },
  { month: "Mar", production: 195, sales: 189 },
  { month: "Apr", production: 240, sales: 225 },
  { month: "May", production: 265, sales: 248 },
  { month: "Jun", production: 280, sales: 264 },
];
