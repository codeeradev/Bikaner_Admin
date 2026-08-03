import { get } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

// Helper function for consistent error handling
const ensureSuccess = <T extends { success: boolean; message?: string }>(
  response: T,
  fallbackMessage: string,
): T => {
  if (!response.success) {
    throw new Error(response.message || fallbackMessage);
  }

  return response;
};

// Response interfaces
interface DashboardStatsResponse {
  success: boolean;
  message?: string;
  data: DashboardStats;
}

interface RecentOrdersResponse {
  success: boolean;
  message?: string;
  data: RecentOrder[];
}

interface TopProductsResponse {
  success: boolean;
  message?: string;
  data: TopProduct[];
}

interface InventoryStatusResponse {
  success: boolean;
  message?: string;
  data: InventoryItem[];
}

interface RevenueByRegionResponse {
  success: boolean;
  message?: string;
  data: RevenueByRegion[];
}

interface MonthlyTrendsResponse {
  success: boolean;
  message?: string;
  data: MonthlyTrend[];
}

interface SellerApplicationsResponse {
  success: boolean;
  message?: string;
  data: DashboardSellerApplication[];
}

// Data interfaces
export interface DashboardStats {
  overview: {
    totalProducts: number;
    activeProducts: number;
    totalCategories: number;
    totalOrders: number;
    totalUsers: number;
    activeCities: number;
    activeZones: number;
    pendingSellerApplications: number;
    lowStockAlerts: number;
  };
  sales: {
    today: {
      amount: number;
      orders: number;
      trend: number;
    };
    month: {
      amount: number;
      orders: number;
      trend: number;
    };
  };
  orders: {
    statusBreakdown: Array<{
      _id: string;
      count: number;
    }>;
    paymentBreakdown: Array<{
      _id: string;
      count: number;
      total: number;
    }>;
  };
  inventory: {
    lowStock: number;
    outOfStock: number;
  };
}

export interface RecentOrder {
  id: string;
  customerName: string;
  productCount: number;
  quantity: number;
  amount: number;
  paymentStatus: string;
  orderStatus: string;
  date: string;
}

export interface TopProduct {
  name: string;
  sku: string;
  unitsSold: number;
  revenue: number;
  growth: number;
  region: string;
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

export interface RevenueByRegion {
  region: string;
  revenue: number;
  orders: number;
}

export interface MonthlyTrend {
  month: string;
  production: number;
  sales: number;
}

export interface DashboardSellerApplication {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  address: string;
  businessName: string;
  requestDate: string;
  status: string;
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const response = ensureSuccess(
      await get<DashboardStatsResponse>(ENDPOINTS.GET_DASHBOARD_STATS),
      "Failed to fetch dashboard stats",
    );
    return response.data;
  },

  /**
   * Get recent orders
   */
  async getRecentOrders(limit?: number): Promise<RecentOrder[]> {
    const params: Record<string, number> = {};
    if (limit !== undefined) params.limit = limit;

    const response = ensureSuccess(
      await get<RecentOrdersResponse>(
        ENDPOINTS.GET_DASHBOARD_RECENT_ORDERS,
        params,
      ),
      "Failed to fetch recent orders",
    );
    return response.data;
  },

  /**
   * Get top selling products
   */
  async getTopProducts(limit?: number, days?: number): Promise<TopProduct[]> {
    const params: Record<string, number> = {};
    if (limit !== undefined) params.limit = limit;
    if (days !== undefined) params.days = days;

    const response = ensureSuccess(
      await get<TopProductsResponse>(
        ENDPOINTS.GET_DASHBOARD_TOP_PRODUCTS,
        params,
      ),
      "Failed to fetch top products",
    );
    return response.data;
  },

  /**
   * Get inventory status
   */
  async getInventoryStatus(): Promise<InventoryItem[]> {
    const response = ensureSuccess(
      await get<InventoryStatusResponse>(
        ENDPOINTS.GET_DASHBOARD_INVENTORY_STATUS,
      ),
      "Failed to fetch inventory status",
    );
    return response.data;
  },

  /**
   * Get revenue by region
   */
  async getRevenueByRegion(days?: number): Promise<RevenueByRegion[]> {
    const params: Record<string, number> = {};
    if (days !== undefined) params.days = days;

    const response = ensureSuccess(
      await get<RevenueByRegionResponse>(
        ENDPOINTS.GET_DASHBOARD_REVENUE_BY_REGION,
        params,
      ),
      "Failed to fetch revenue by region",
    );
    return response.data;
  },

  /**
   * Get monthly trends
   */
  async getMonthlyTrends(months?: number): Promise<MonthlyTrend[]> {
    const params: Record<string, number> = {};
    if (months !== undefined) params.months = months;

    const response = ensureSuccess(
      await get<MonthlyTrendsResponse>(
        ENDPOINTS.GET_DASHBOARD_MONTHLY_TRENDS,
        params,
      ),
      "Failed to fetch monthly trends",
    );
    return response.data;
  },

  /**
   * Get recent seller applications
   */
  async getRecentSellerApplications(
    limit?: number,
  ): Promise<DashboardSellerApplication[]> {
    const params: Record<string, number> = {};
    if (limit !== undefined) params.limit = limit;

    const response = ensureSuccess(
      await get<SellerApplicationsResponse>(
        ENDPOINTS.GET_DASHBOARD_SELLER_APPLICATIONS,
        params,
      ),
      "Failed to fetch seller applications",
    );
    return response.data;
  },
};
