import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  LayoutDashboard,
  Menu,
  Palette,
  Search,
  Settings,
  ShoppingCart,
  User,
  X,
  XCircle,
} from "lucide-react";

export function ThemePreview() {
  return (
    <div className="space-y-4">
      {/* Navbar Preview */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="bg-background border-b border-border p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <Menu className="h-4 w-4 text-foreground" />
            </button>
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <Palette className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm text-foreground">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="h-8 w-32 rounded-md border border-input bg-muted/50 pl-7 pr-2 text-xs"
                readOnly
              />
            </div>
            <button
              type="button"
              className="relative p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <Bell className="h-4 w-4 text-foreground" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar + Content Preview */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-40 bg-sidebar p-3 space-y-1 shrink-0">
            <div className="flex items-center gap-2 rounded-md bg-sidebar-primary px-2.5 py-1.5">
              <LayoutDashboard className="h-3.5 w-3.5 text-sidebar-primary-foreground shrink-0" />
              <span className="text-xs font-medium text-sidebar-primary-foreground">
                Dashboard
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-sidebar-accent px-2.5 py-1.5">
              <ShoppingCart className="h-3.5 w-3.5 text-sidebar-accent-foreground shrink-0" />
              <span className="text-xs text-sidebar-accent-foreground">
                Orders
              </span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5">
              <Settings className="h-3.5 w-3.5 text-sidebar-foreground shrink-0" />
              <span className="text-xs text-sidebar-foreground">Settings</span>
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 bg-background p-3 space-y-3">
            <div className="text-sm font-semibold text-foreground">
              Overview
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md bg-card border border-border p-2">
                <div className="text-[10px] text-muted-foreground">Revenue</div>
                <div className="text-sm font-bold text-card-foreground">
                  $12,450
                </div>
              </div>
              <div className="rounded-md bg-card border border-border p-2">
                <div className="text-[10px] text-muted-foreground">Orders</div>
                <div className="text-sm font-bold text-card-foreground">
                  1,234
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Preview */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-muted/30">
          <CardTitle className="text-sm flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-primary" />
            Dashboard Card
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Palette className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate text-card-foreground">
                Dashboard Overview
              </div>
              <div className="text-xs text-muted-foreground truncate">
                This is how cards look with your theme
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" data-ocid="theme.preview.primary_button">
              Primary
            </Button>
            <Button
              size="sm"
              variant="secondary"
              data-ocid="theme.preview.secondary_button"
            >
              Secondary
            </Button>
            <Button
              size="sm"
              variant="outline"
              data-ocid="theme.preview.outline_button"
            >
              Outline
            </Button>
            <Button
              size="sm"
              variant="destructive"
              data-ocid="theme.preview.destructive_button"
            >
              Danger
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Form Preview</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Email Address</Label>
            <Input
              type="email"
              placeholder="admin@example.com"
              className="h-8 text-xs"
              readOnly
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              className="h-8 text-xs"
              readOnly
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border border-primary bg-primary flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-xs text-foreground">Remember me</span>
          </div>
        </CardContent>
      </Card>

      {/* Table Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Table Preview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 text-foreground">Premium Plan</td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-foreground">
                    $99.00
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2 text-foreground">Basic Plan</td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
                      Pending
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-foreground">
                    $29.00
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-foreground">Enterprise</td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                      Cancelled
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right text-foreground">
                    $499.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Status Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Status States</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            <span className="text-foreground">Success state example</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
            <span className="text-foreground">Warning state example</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-destructive shrink-0" />
            <span className="text-foreground">Error state example</span>
          </div>
        </CardContent>
      </Card>

      {/* Progress & Charts Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Charts & Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>65%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: "65%" }}
              />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground">Chart colors:</span>
            <div className="flex gap-1.5">
              <div className="h-4 w-4 rounded-full bg-chart-1" />
              <div className="h-4 w-4 rounded-full bg-chart-2" />
              <div className="h-4 w-4 rounded-full bg-chart-3" />
              <div className="h-4 w-4 rounded-full bg-chart-4" />
              <div className="h-4 w-4 rounded-full bg-chart-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Notification Preview</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start gap-3 rounded-lg bg-success/10 border border-success/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-success">Success</div>
              <div className="text-[10px] text-success/80">
                Your changes have been saved successfully.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-warning/10 border border-warning/20 p-3">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-warning">Warning</div>
              <div className="text-[10px] text-warning/80">
                Please review your settings before continuing.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-xs font-medium text-destructive">Error</div>
              <div className="text-[10px] text-destructive/80">
                Something went wrong. Please try again.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Badge Preview</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Primary
            </span>
            <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">
              Secondary
            </span>
            <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              Success
            </span>
            <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
              Warning
            </span>
            <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
              Danger
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Modal Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Modal Preview</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-card-foreground">
                Confirm Action
              </h3>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to perform this action? This cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline">
                Cancel
              </Button>
              <Button size="sm" variant="destructive">
                Confirm
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
