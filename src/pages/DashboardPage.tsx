import { cityService, zoneService, dashboardService } from "@/api";
import type { City, Zone } from "@/api";
import type {
  DashboardStats,
  RecentOrder,
  TopProduct,
  InventoryItem as DashboardInventoryItem,
  TotalRevenue,
  MonthlyTrend,
  DashboardSellerApplication,
} from "@/api/services/dashboardService";
import { DataTable } from "@/components/DataTable";
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
  Sparkles,
  Store,
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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Button size="sm" variant="outline" asChild>
        <a href="/orders">Manage</a>
      </Button>
    ),
  },
];

const franchiseColumns: ColumnDef<DashboardSellerApplication>[] = [
  { 
    accessorKey: "applicantName", 
    header: "Applicant",
    cell: ({ row }) => row.getValue("applicantName") || "N/A"
  },
  { 
    accessorKey: "businessName", 
    header: "Business",
    cell: ({ row }) => row.getValue("businessName") || "N/A"
  },
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
  const [totalRevenue, setTotalRevenue] = useState<TotalRevenue | null>(null);
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
        dashboardService.getTotalRevenue(30),
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
      setTotalRevenue(revenue);
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
          tone: "amber" as const,
        },
        {
          title: "Today's Sales",
          value: `₹${dashboardStats.sales.today.amount.toLocaleString()}`,
          icon: IndianRupee,
          trend: {
            value: dashboardStats.sales.today.trend,
            label: "from yesterday",
          },
          tone: "rose" as const,
        },
        {
          title: "Total Orders",
          value: dashboardStats.overview.totalOrders.toLocaleString(),
          icon: Store,
          description: `${dashboardStats.sales.today.orders} today`,
          tone: "violet" as const,
        },
        {
          title: "Low Stock Alerts",
          value: dashboardStats.overview.lowStockAlerts,
          icon: AlertTriangle,
          description: `${dashboardStats.inventory.outOfStock} out of stock`,
          tone: "orange" as const,
        },
        {
          title: "Monthly Revenue",
          value: `₹${dashboardStats.sales.month.amount.toLocaleString()}`,
          icon: BarChart3,
          trend: {
            value: dashboardStats.sales.month.trend,
            label: "from last month",
          },
          tone: "teal" as const,
        },
        {
          title: "Active Cities",
          value: dashboardStats.overview.activeCities.toLocaleString(),
          icon: MapPin,
          description: `${dashboardStats.overview.activeZones} zones`,
          tone: "sky" as const,
        },
        {
          title: "Seller Requests",
          value: dashboardStats.overview.pendingSellerApplications,
          icon: Building2,
          description: "Pending approval",
          tone: "pink" as const,
        },
        {
          title: "Categories",
          value: dashboardStats.overview.totalCategories,
          icon: Factory,
          description: "Active categories",
          tone: "lime" as const,
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
    <div className="space-y-7">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative isolate overflow-hidden rounded-[1.75rem] border border-rose-200/70 bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 p-5 shadow-sm dark:border-rose-900/50 dark:from-rose-950/45 dark:via-orange-950/25 dark:to-amber-950/35 sm:p-7"
      >
        <div className="pointer-events-none absolute -right-12 -top-24 -z-10 h-64 w-64 rounded-full bg-fuchsia-200/40 blur-3xl dark:bg-fuchsia-700/10" />
        <div className="pointer-events-none absolute -bottom-24 right-1/3 -z-10 h-52 w-52 rounded-full bg-amber-300/35 blur-3xl dark:bg-amber-700/10" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-2xl border border-white/80 bg-white/90 p-2 shadow-md sm:h-[92px] sm:w-[92px]">
              <img
                src="/assets/images/bikaner-logo.jpeg"
                alt="Bikaner Biscuit Bakery"
                className="h-full w-full rounded-xl object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700 dark:border-rose-800 dark:bg-black/15 dark:text-rose-200">
                <Sparkles className="h-3.5 w-3.5" /> Bakery operations
              </div>
              <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">
                Welcome to your bakery dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-stone-700/80 dark:text-stone-200/75 sm:text-base">
                Your daily view of sales, orders, products, and store activity.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="shrink-0 gap-2 border-white/80 bg-white/80 shadow-sm hover:bg-white dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh dashboard
          </Button>
        </div>
      </motion.section>

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
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
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
            {/* Revenue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/70 to-card p-6 shadow-sm dark:border-amber-900/40 dark:from-amber-950/20"
            >
              <h3 className="text-lg font-semibold mb-4">Revenue (Last 30 Days)</h3>
              {totalRevenue ? (
                <div className="h-[260px] flex flex-col items-center justify-center space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">
                      ₹{totalRevenue.revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Last {totalRevenue.days} Days
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 w-full mt-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground">Total Orders</span>
                      <span className="text-lg font-semibold">{totalRevenue.orders}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-muted-foreground">Avg. Order Value</span>
                      <span className="text-lg font-semibold">
                        ₹{totalRevenue.orders > 0 ? Math.round(totalRevenue.revenue / totalRevenue.orders).toLocaleString() : 0}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                  No revenue data available
                </div>
              )}
            </motion.div>

            {/* Monthly Sales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-2xl border border-rose-200/70 bg-gradient-to-br from-rose-50/60 to-card p-6 shadow-sm dark:border-rose-900/40 dark:from-rose-950/15 lg:col-span-2"
            >
              <h3 className="text-lg font-semibold mb-4">
                Monthly Sales Trends
              </h3>
              {monthlyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={monthlyTrends}>
                    <defs>
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
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, "Sales"]}
                    />
                    <Legend />
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
              className="rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50/55 to-card p-6 shadow-sm dark:border-violet-900/40 dark:from-violet-950/15"
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
                <Badge variant="destructive" className="gap-1 normal-case">
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
              <div className="rounded-2xl border border-orange-200/70 bg-gradient-to-br from-orange-50/60 to-card p-8 text-center text-muted-foreground dark:border-orange-900/40 dark:from-orange-950/15">
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
              className="rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50/60 to-card p-6 shadow-sm dark:border-sky-900/40 dark:from-sky-950/15"
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
              className="rounded-2xl border border-teal-200/70 bg-gradient-to-br from-teal-50/60 to-card p-6 shadow-sm dark:border-teal-900/40 dark:from-teal-950/15"
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
