import { cityService, zoneService, dashboardService } from "@/api";
import type { City, Zone } from "@/api";
import type {
  DashboardStats,
  RecentOrder,
  TopProduct,
  InventoryItem as DashboardInventoryItem,
  RevenueByRegion,
  MonthlyTrend,
  DashboardSellerApplication,
} from "@/api/services/dashboardService";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Factory,
  IndianRupee,
  MapPin,
  MapPinned,
  Package,
  RefreshCw,
  Store,
  TrendingUp,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const orderColumns: ColumnDef<RecentOrder>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.getValue("id")}</span>
    ),
  },
  { accessorKey: "customerName", header: "Customer" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => `₹${Number(row.getValue("amount")).toLocaleString()}`,
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const variants: Record<
        string,
        "default" | "secondary" | "destructive" | "outline"
      > = {
        paid: "default",
        pending: "secondary",
        failed: "destructive",
        refunded: "outline",
      };
      return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "orderStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("orderStatus") as string;
      const variants: Record<
        string,
        "default" | "secondary" | "destructive" | "outline"
      > = {
        delivered: "default",
        accepted: "default",
        pending: "secondary",
        cancelled: "destructive",
      };
      return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString(),
  },
];

const franchiseColumns: ColumnDef<DashboardSellerApplication>[] = [
  { accessorKey: "applicantName", header: "Applicant" },
  { accessorKey: "businessName", header: "Business" },
  {
    accessorKey: "requestDate",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.getValue("requestDate")).toLocaleDateString(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants: Record<
        string,
        "default" | "secondary" | "destructive" | "outline"
      > = {
        approved: "default",
        pending: "secondary",
        rejected: "destructive",
      };
      return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
    },
  },
];

const inventoryColumns: ColumnDef<DashboardInventoryItem>[] = [
  { accessorKey: "product", header: "Product" },
  { accessorKey: "sku", header: "SKU" },
  {
    accessorKey: "stockLevel",
    header: "Stock",
    cell: ({ row }) => {
      const item = row.original;
      const percent = Math.round((item.stockLevel / item.maxStock) * 100);
      return (
        <div className="w-32">
          <div className="flex justify-between text-xs mb-1">
            <span>{item.stockLevel.toLocaleString()}</span>
            <span className="text-muted-foreground">{percent}%</span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants: Record<
        string,
        "default" | "secondary" | "destructive" | "outline"
      > = {
        healthy: "default",
        low: "secondary",
        critical: "destructive",
      };
      return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
    },
  },
  { accessorKey: "warehouse", header: "Warehouse" },
];



export function DashboardPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [inventoryItems, setInventoryItems] = useState<DashboardInventoryItem[]>([]);
  const [revenueByRegion, setRevenueByRegion] = useState<RevenueByRegion[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [sellerApplications, setSellerApplications] = useState<DashboardSellerApplication[]>([]);
  
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoadingStats(true);
    
    try {
      console.log("Fetching dashboard data...");
      
      const [
        stats,
        orders,
        products,
        inventory,
        revenue,
        trends,
        applications,
      ] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentOrders(8),
        dashboardService.getTopProducts(5, 30),
        dashboardService.getInventoryStatus(),
        dashboardService.getRevenueByRegion(30),
        dashboardService.getMonthlyTrends(6),
        dashboardService.getRecentSellerApplications(5),
      ]);

      console.log("Dashboard API responses:", {
        stats,
        orders,
        products,
        inventory,
        revenue,
        trends,
        applications,
      });

      setDashboardStats(stats);
      setRecentOrders(orders);
      setTopProducts(products);
      setInventoryItems(inventory);
      setRevenueByRegion(revenue);
      setMonthlyTrends(trends);
      setSellerApplications(applications);
      
      console.log("Dashboard data updated successfully");
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  };

  // Fetch cities and zones
  const fetchCitiesAndZones = async () => {
    setLoadingCities(true);
    setLoadingZones(true);

    try {
      const citiesResponse = await cityService.getCities({
        page: 1,
        pageSize: 5,
      });
      setCities(citiesResponse.data);
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    } finally {
      setLoadingCities(false);
    }

    try {
      const zonesResponse = await zoneService.getZones({
        page: 1,
        pageSize: 5,
      });
      setZones(zonesResponse.data);
    } catch (error) {
      console.error("Failed to fetch zones:", error);
    } finally {
      setLoadingZones(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
    fetchCitiesAndZones();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const stats = dashboardStats
    ? [
        {
          title: "Total Products",
          value: dashboardStats.overview.totalProducts.toLocaleString(),
          icon: Package,
          description: `${dashboardStats.overview.activeProducts} active`,
        },
        {
          title: "Today's Sales",
          value: `₹${dashboardStats.sales.today.amount.toLocaleString()}`,
          icon: IndianRupee,
          trend: {
            value: dashboardStats.sales.today.trend,
            label: "from yesterday",
          },
        },
        {
          title: "Total Orders",
          value: dashboardStats.overview.totalOrders.toLocaleString(),
          icon: Store,
          description: `${dashboardStats.sales.today.orders} today`,
        },
        {
          title: "Low Stock Alerts",
          value: dashboardStats.overview.lowStockAlerts,
          icon: AlertTriangle,
          description: `${dashboardStats.inventory.outOfStock} out of stock`,
        },
        {
          title: "Monthly Revenue",
          value: `₹${(dashboardStats.sales.month.amount / 100000).toFixed(1)}L`,
          icon: BarChart3,
          trend: {
            value: dashboardStats.sales.month.trend,
            label: "from last month",
          },
        },
        {
          title: "Active Cities",
          value: dashboardStats.overview.activeCities.toLocaleString(),
          icon: MapPin,
          description: `${dashboardStats.overview.activeZones} zones`,
        },
        {
          title: "Total Users",
          value: dashboardStats.overview.totalUsers.toLocaleString(),
          icon: TrendingUp,
          description: "Registered customers",
        },
        {
          title: "Seller Requests",
          value: dashboardStats.overview.pendingSellerApplications,
          icon: Building2,
          description: "Pending approval",
        },
        {
          title: "Categories",
          value: dashboardStats.overview.totalCategories,
          icon: Factory,
          description: "Active categories",
        },
        {
          title: "Pending Requests",
          value: dashboardStats.overview.pendingSellerApplications,
          icon: Truck,
          description: "Seller applications",
        },
      ]
    : [];

  const lowStockItems = inventoryItems.filter((i) => i.status !== "healthy");

  const COLORS = [
    "oklch(var(--chart-1))",
    "oklch(var(--chart-2))",
    "oklch(var(--chart-3))",
    "oklch(var(--chart-4))",
    "oklch(var(--chart-5))",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Operations Dashboard"
          description="Real-time overview of Bikaner Biscuit operations"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loadingStats ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Revenue by Region */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-lg border border-border bg-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Revenue by Region</h3>
              {revenueByRegion.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={revenueByRegion}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="revenue"
                      nameKey="region"
                    >
                      {revenueByRegion.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.region}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(var(--card))",
                        border: "1px solid oklch(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`₹${value}L`, "Revenue"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </motion.div>

            {/* Production vs Sales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-lg border border-border bg-card p-6 lg:col-span-2"
            >
              <h3 className="text-lg font-semibold mb-4">
                Monthly Trends (Lakhs)
              </h3>
              {monthlyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={monthlyTrends}>
                    <defs>
                      <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="oklch(var(--chart-1))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(var(--chart-1))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="oklch(var(--chart-2))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(var(--chart-2))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(var(--border))"
                    />
                    <XAxis
                      dataKey="month"
                      stroke="oklch(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="oklch(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(var(--card))",
                        border: "1px solid oklch(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`₹${value}L`, ""]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="production"
                      name="Production"
                      stroke="oklch(var(--chart-1))"
                      fill="url(#prodGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      name="Sales"
                      stroke="oklch(var(--chart-2))"
                      fill="url(#salesGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                  No trend data available
                </div>
              )}
            </motion.div>
          </div>

          {/* Top Products */}
          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="rounded-lg border border-border bg-card p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => {
                    const maxUnits = topProducts[0].unitsSold;
                    const percent = Math.round((product.unitsSold / maxUnits) * 100);
                    return (
                      <div key={product.sku} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground w-5">
                              {index + 1}
                            </span>
                            <span className="font-medium">{product.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({product.region})
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground text-xs">
                              {product.unitsSold.toLocaleString()} units
                            </span>
                            <span
                              className={
                                product.growth >= 0
                                  ? "text-success text-xs font-medium"
                                  : "text-destructive text-xs font-medium"
                              }
                            >
                              {product.growth >= 0 ? "+" : ""}
                              {product.growth}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden ml-7">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No product data available
                </div>
              )}
            </motion.div>
          </div>

          {/* Inventory Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Inventory Status</h3>
              {lowStockItems.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {lowStockItems.length} alerts
                </Badge>
              )}
            </div>
            {inventoryItems.length > 0 ? (
              <DataTable
                columns={inventoryColumns}
                data={inventoryItems}
                searchPlaceholder="Search inventory..."
              />
            ) : (
              <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                No inventory data available
              </div>
            )}
          </motion.div>

          {/* Cities and Zones Management */}
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Cities
                </h3>
                <Button size="sm" variant="outline" asChild>
                  <a href="/cities">Manage</a>
                </Button>
              </div>
              {loadingCities ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  Loading cities...
                </div>
              ) : cities.length > 0 ? (
                <div className="space-y-3">
                  {cities.map((city) => (
                    <div
                      key={city.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <div className="font-medium">{city.name}</div>
                        {city.lat && city.lng && (
                          <div className="text-xs text-muted-foreground">
                            {city.lat.toFixed(4)}, {city.lng.toFixed(4)}
                          </div>
                        )}
                      </div>
                      <Badge
                        variant={
                          city.status === "active" ? "default" : "secondary"
                        }
                      >
                        {city.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  No cities available.{" "}
                  <a href="/cities" className="text-primary hover:underline">
                    Add cities
                  </a>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.65 }}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPinned className="h-5 w-5" />
                  Delivery Zones
                </h3>
                <Button size="sm" variant="outline" asChild>
                  <a href="/zones">Manage</a>
                </Button>
              </div>
              {loadingZones ? (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  Loading zones...
                </div>
              ) : zones.length > 0 ? (
                <div className="space-y-3">
                  {zones.map((zone) => (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <div className="font-medium">{zone.name}</div>
                        {zone.description && (
                          <div className="text-xs text-muted-foreground">
                            {zone.description}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={
                            zone.status === "active" ? "default" : "secondary"
                          }
                        >
                          {zone.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ₹{zone.deliveryCharge} delivery
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  No zones available.{" "}
                  <a href="/zones" className="text-primary hover:underline">
                    Add zones
                  </a>
                </div>
              )}
            </motion.div>
          </div>

          {/* Recent Orders + Seller Applications */}
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
              {recentOrders.length > 0 ? (
                <DataTable
                  columns={orderColumns}
                  data={recentOrders}
                  searchPlaceholder="Search orders..."
                />
              ) : (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                  No orders available
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.75 }}
            >
              <h3 className="text-lg font-semibold mb-4">
                Recent Seller Applications
              </h3>
              {sellerApplications.length > 0 ? (
                <DataTable
                  columns={franchiseColumns}
                  data={sellerApplications}
                  searchPlaceholder="Search requests..."
                />
              ) : (
                <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                  No seller applications available
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
