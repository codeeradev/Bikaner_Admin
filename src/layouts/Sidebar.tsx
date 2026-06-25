import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore, useRoleStore, useUIStore } from "@/store";
import type { PermissionSection } from "@/types";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Cookie,
  FolderTree,
  LayoutDashboard,
  MapPin,
  Menu,
  Package,
  Palette,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  User,
} from "lucide-react";
import { useState } from "react";

interface MenuItem {
  label: string;
  icon: typeof LayoutDashboard;
  href?: string;
  section?: PermissionSection;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    section: "dashboard",
  },
  {
    label: "Management",
    icon: FolderTree,
    section: "categories",
    children: [
      {
        label: "Categories",
        icon: FolderTree,
        href: "/categories",
        section: "categories",
      },
      {
        label: "Products",
        icon: Package,
        href: "/products",
        section: "products",
      },
    ],
  },
  {
    label: "Locations",
    icon: MapPin,
    section: "settings",
    children: [
      {
        label: "Cities",
        icon: Building2,
        href: "/cities",
        section: "settings",
      },
      {
        label: "Zones",
        icon: MapPin,
        href: "/zones",
        section: "settings",
      },
    ],
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    section: "orders",
    children: [
      {
        label: "Normal Orders",
        icon: ShoppingCart,
        href: "/orders",
        section: "orders",
      },
      {
        label: "Bulk Orders",
        icon: ShoppingCart,
        href: "/bulk-orders",
        section: "orders",
      },
    ],
  },
  {
    label: "Franchise",
    icon: Store,
    section: "franchise",
    children: [
      {
        label: "Registered Franchise",
        icon: Store,
        href: "/franchise",
        section: "franchise",
      },
      {
        label: "Franchise Requests",
        icon: Store,
        href: "/franchise-requests",
        section: "franchise",
      },
    ],
  },
  {
    label: "Administration",
    icon: Shield,
    section: "settings",
    children: [
      {
        label: "Roles & Permissions",
        icon: Shield,
        href: "/roles",
        section: "settings",
      },
      {
        label: "Theme Management",
        icon: Palette,
        href: "/theme",
        section: "theme",
      },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    section: "settings",
    children: [
      { label: "Profile", icon: User, href: "/profile", section: "settings" },
      {
        label: "Settings",
        icon: Settings,
        href: "/settings",
        section: "settings",
      },
    ],
  },
];

function MenuItemComponent({
  item,
  collapsed,
  depth = 0,
}: {
  item: MenuItem;
  collapsed: boolean;
  depth?: number;
}) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const roleStore = useRoleStore();
  const authStore = useAuthStore();
  const userRole = authStore.user?.role || "Staff";
  const roleId = `role-${mockRoleIds[userRole] || 4}`;

  const hasPermission = item.section
    ? roleStore.hasPermission(roleId, item.section, "view")
    : true;

  if (!hasPermission) return null;

  const isActive = item.href
    ? location.pathname === item.href ||
      (item.href !== "/dashboard" && location.pathname.startsWith(item.href))
    : false;
  const isParentActive = item.children
    ? item.children.some(
        (child) =>
          child.href &&
          (location.pathname === child.href ||
            location.pathname.startsWith(child.href)),
      )
    : false;
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center w-full gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            (expanded || isParentActive) && "bg-sidebar-accent/50",
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </>
          )}
        </button>
        {expanded && !collapsed && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children?.map((child) => (
              <MenuItemComponent
                key={child.label}
                item={child}
                collapsed={collapsed}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!item.href) return null;

  return (
    <Link
      to={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        (isActive || isParentActive) &&
          "bg-sidebar-primary text-sidebar-primary-foreground",
      )}
      data-ocid={`sidebar.link.${item.label.toLowerCase().replace(/\s+/g, "_")}`}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

const mockRoleIds: Record<string, number> = {
  Admin: 1,
  Franchise: 2,
  Manager: 3,
  Staff: 4,
};

export function Sidebar() {
  const {
    sidebarCollapsed,
    toggleSidebarCollapsed,
    mobileDrawerOpen,
    setMobileDrawerOpen,
  } = useUIStore();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2 font-semibold text-sidebar-foreground">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <Cookie className="h-4 w-4 text-primary-foreground" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-sm">Bikaner Biscuit</span>
          )}
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <MenuItemComponent
              key={item.label}
              item={item}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebarCollapsed}
          className="w-full flex items-center justify-center"
          data-ocid="sidebar.toggle_button"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-3 left-3 z-50"
            data-ocid="sidebar.mobile_toggle"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64 p-0 bg-sidebar text-sidebar-foreground"
        >
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center border-b border-sidebar-border px-4">
              <div className="flex items-center gap-2 font-semibold">
                <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                  <Cookie className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm">Bikaner Biscuit</span>
              </div>
            </div>
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <MenuItemComponent
                    key={item.label}
                    item={item}
                    collapsed={false}
                  />
                ))}
              </nav>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 z-40",
          sidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
