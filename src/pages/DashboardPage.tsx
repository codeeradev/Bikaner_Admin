import { cityService, zoneService } from "@/api";
import type { City, Zone } from "@/api";
import { DataTable } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  mockDeliveries,
  mockDistributorPerformance,
  mockFmcgStats,
  mockInventoryItems,
  mockProductionLines,
  mockProductionVsSales,
  mockRecentFranchiseRequests,
  mockRecentOrders,
  mockRevenueByRegion,
  mockTopProducts,
} from "@/mock-data";
import type {
  DeliveryShipment,
  FranchiseRequest,
  InventoryItem,
  Order,
  ProductionLine,
} from "@/types";
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
  ShoppingCart,
  Store,
  TrendingUp,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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

const orderColumns: ColumnDef<Order>[] = [
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
        shipped: "default",
        confirmed: "secondary",
        processing: "secondary",
        packed: "outline",
        pending: "outline",
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

const franchiseColumns: ColumnDef<FranchiseRequest>[] = [
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

const inventoryColumns: ColumnDef<InventoryItem>[] = [
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

const deliveryColumns: ColumnDef<DeliveryShipment>[] = [
  { accessorKey: "id", header: "Shipment" },
  { accessorKey: "destination", header: "Destination" },
  { accessorKey: "distributor", header: "Distributor" },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const progress = row.getValue("progress") as number;
      const status = row.original.status;
      const statusColor =
        status === "delivered"
          ? "bg-success"
          : status === "delayed"
            ? "bg-destructive"
            : "bg-primary";
      return (
        <div className="w-28">
          <div className="flex justify-between text-xs mb-1">
            <span className="capitalize">{status.replace("_", " ")}</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full ${statusColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      );
    },
  },
  { accessorKey: "eta", header: "ETA" },
];

const productionColumns: ColumnDef<ProductionLine>[] = [
  { accessorKey: "lineName", header: "Line" },
  {
    accessorKey: "oee",
    header: "OEE",
    cell: ({ row }) => {
      const oee = row.getValue("oee") as number;
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{oee}%</span>
          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${oee}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "efficiency",
    header: "Efficiency",
    cell: ({ row }) => {
      const eff = row.getValue("efficiency") as number;
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{eff}%</span>
          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-success"
              style={{ width: `${eff}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "outputToday",
    header: "Output",
    cell: ({ row }) => {
      const line = row.original;
      const _percent = Math.round((line.outputToday / line.target) * 100);
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {line.outputToday.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">
            / {line.target.toLocaleString()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "wastePercent",
    header: "Waste",
    cell: ({ row }) => {
      const waste = row.getValue("wastePercent") as number;
      return (
        <span
          className={
            waste > 3
              ? "text-destructive font-medium"
              : "text-success font-medium"
          }
        >
          {waste}%
        </span>
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
        running: "default",
        idle: "secondary",
        maintenance: "outline",
      };
      return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
    },
  },
];

export function DashboardPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);

  // Fetch cities and zones on mount
  useEffect(() => {
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

    fetchCitiesAndZones();
  }, []);

  const stats = [
    {
      title: "Production Output",
      value: mockFmcgStats.totalOrders.toLocaleString(),
      icon: Factory,
      trend: { value: 22.1, label: "from last month" },
    },
    {
      title: "Today's Sales",
      value: `₹${mockFmcgStats.todaySales.toLocaleString()}`,
      icon: IndianRupee,
      trend: { value: 18.7, label: "from yesterday" },
    },
    {
      title: "Batch Yield Rate",
      value: `${mockFmcgStats.inventoryStatus}%`,
      icon: Package,
      description: "Avg across all lines",
    },
    {
      title: "Low Stock Alerts",
      value: mockFmcgStats.lowStockAlerts,
      icon: AlertTriangle,
      trend: { value: -5.2, label: "from last week" },
    },
    {
      title: "Top SKU",
      value: mockFmcgStats.topSellingProduct,
      icon: TrendingUp,
      description: "Marie Gold leading",
    },
    {
      title: "Distributor Count",
      value: `${mockFmcgStats.distributorPerformance}`,
      icon: Truck,
      trend: { value: 3.8, label: "new this month" },
    },
    {
      title: "Stockist Coverage",
      value: mockFmcgStats.retailerActivity,
      icon: Store,
      trend: { value: 12.5, label: "from last month" },
    },
    {
      title: "Revenue (Lakhs)",
      value: `₹${mockFmcgStats.revenueAnalytics}L`,
      icon: BarChart3,
      trend: { value: 15.3, label: "from last month" },
    },
    {
      title: "On-Time Delivery",
      value: `${mockFmcgStats.deliveryTracking}%`,
      icon: MapPin,
      description: "Last 7 days average",
    },
    {
      title: "OEE (Plant)",
      value: `${mockFmcgStats.productionMetrics}%`,
      icon: Factory,
      trend: { value: 8.1, label: "from last month" },
    },
  ];

  const lowStockItems = mockInventoryItems.filter(
    (i) => i.status !== "healthy",
  );

  const COLORS = [
    "oklch(var(--chart-1))",
    "oklch(var(--chart-2))",
    "oklch(var(--chart-3))",
    "oklch(var(--chart-4))",
    "oklch(var(--chart-5))",
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Dashboard"
        description="Real-time overview of Bikaner Biscuit manufacturing, inventory, and distribution"
      />

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
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={mockRevenueByRegion}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="revenue"
                nameKey="region"
              >
                {mockRevenueByRegion.map((entry, index) => (
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
        </motion.div>

        {/* Production vs Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-lg border border-border bg-card p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold mb-4">
            Production vs Sales (Lakhs)
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={mockProductionVsSales}>
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
        </motion.div>
      </div>

      {/* Top Products + Distributor Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-lg border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {mockTopProducts.map((product, index) => {
              const maxUnits = mockTopProducts[0].unitsSold;
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-lg border border-border bg-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4">
            Distributor Performance
          </h3>
          <div className="space-y-4">
            {mockDistributorPerformance.map((dist, index) => (
              <div key={dist.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-5">
                      {index + 1}
                    </span>
                    <span className="font-medium">{dist.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({dist.region})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs">
                      ₹{(dist.revenue / 100000).toFixed(1)}L
                    </span>
                    <span
                      className={
                        dist.trend >= 0
                          ? "text-success text-xs font-medium"
                          : "text-destructive text-xs font-medium"
                      }
                    >
                      {dist.trend >= 0 ? "+" : ""}
                      {dist.trend}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden ml-7">
                  <motion.div
                    className="h-full rounded-full bg-success"
                    initial={{ width: 0 }}
                    animate={{ width: `${dist.onTimeDelivery}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground ml-7">
                  <span>On-time: {dist.onTimeDelivery}%</span>
                  <span>Rating: {dist.rating}/5</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Inventory + Deliveries */}
      <div className="grid gap-6 lg:grid-cols-2">
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
          <DataTable
            columns={inventoryColumns}
            data={mockInventoryItems}
            searchPlaceholder="Search inventory..."
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold mb-4">Delivery Tracking</h3>
          <DataTable
            columns={deliveryColumns}
            data={mockDeliveries}
            searchPlaceholder="Search deliveries..."
          />
        </motion.div>
      </div>

      {/* Production Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.55 }}
      >
        <h3 className="text-lg font-semibold mb-4">Production Lines</h3>
        <DataTable
          columns={productionColumns}
          data={mockProductionLines}
          searchPlaceholder="Search production lines..."
        />
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
              <a href="/settings">Manage</a>
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
                    <div className="text-xs text-muted-foreground">
                      {city.state}, {city.country}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        city.status === "active" ? "default" : "secondary"
                      }
                    >
                      {city.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {city.pinCodes?.length || 0} pincodes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No cities available.{" "}
              <a href="/settings" className="text-primary hover:underline">
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
              <a href="/settings">Manage</a>
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
                    <div className="text-xs text-muted-foreground">
                      Code: {zone.code}
                    </div>
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
              <a href="/settings" className="text-primary hover:underline">
                Add zones
              </a>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Orders + Franchise Requests */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <DataTable
            columns={orderColumns}
            data={mockRecentOrders}
            searchPlaceholder="Search orders..."
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.65 }}
        >
          <h3 className="text-lg font-semibold mb-4">
            Recent Franchise Requests
          </h3>
          <DataTable
            columns={franchiseColumns}
            data={mockRecentFranchiseRequests}
            searchPlaceholder="Search requests..."
          />
        </motion.div>
      </div>
    </div>
  );
}
