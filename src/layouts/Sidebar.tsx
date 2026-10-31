import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FolderTree,
  ImageIcon,
  LayoutDashboard,
  MapPin,
  Menu,
  Package,
  Palette,
  Shield,
  ShoppingCart,
  Tag,
  User,
  UserCheck,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";

interface MenuItem {
  label: string;
  icon: typeof LayoutDashboard;
  href?: string;
  permission?: string; // Changed from section to permission
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    label: "Management",
    icon: FolderTree,
    children: [
      {
        label: "Categories",
        icon: FolderTree,
        href: "/categories",
        permission: PERMISSIONS.CATEGORIES_VIEW,
      },
      {
        label: "Products",
        icon: Package,
        href: "/products",
        permission: PERMISSIONS.PRODUCTS_VIEW,
      },
      {
        label: "Banners",
        icon: ImageIcon,
        href: "/banners",
        permission: PERMISSIONS.BANNERS_VIEW,
      },
    ],
  },
  {
    label: "Locations",
    icon: MapPin,
    children: [
      {
        label: "Cities",
        icon: Building2,
        href: "/cities",
        permission: PERMISSIONS.CITIES_VIEW,
      },
      {
        label: "Zones",
        icon: MapPin,
        href: "/zones",
        permission: PERMISSIONS.ZONES_VIEW,
      },
    ],
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    children: [
      {
        label: "All Orders",
        icon: ShoppingCart,
        href: "/orders",
        permission: PERMISSIONS.ORDERS_VIEW,
      },
      {
        label: "Customer Orders",
        icon: ShoppingCart,
        href: "/orders/normal",
        permission: PERMISSIONS.NORMAL_ORDERS_VIEW,
      },
      {
        label: "Distributor Orders",
        icon: ShoppingCart,
        href: "/orders/bulk",
        permission: PERMISSIONS.BULK_ORDERS_VIEW,
      },
    ],
  },
  {
    label: "Approvals",
    icon: UserCheck,
    children: [
      {
        label: "Distributor Applications",
        icon: UserCheck,
        href: "/approvals/sellers",
        permission: PERMISSIONS.SELLER_APPROVALS_VIEW,
      },
    ],
  },
  {
    label: "Franchise",
    icon: Store,
    children: [
      { label: "Registered Franchise", icon: Store, href: "/franchise/registered", permission: PERMISSIONS.REGISTERED_FRANCHISES_VIEW },
      { label: "Stock Requests", icon: Store, href: "/franchise/stock-requests", permission: PERMISSIONS.FRANCHISE_VIEW },
    ],
  },
  {
    label: "Administration",
    icon: Shield,
    children: [
      {
        label: "Users & Staff",
        icon: User,
        href: "/users",
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        label: "Roles & Permissions",
        icon: Shield,
        href: "/roles",
        permission: PERMISSIONS.ROLES_VIEW,
      },
      {
        label: "Theme Management",
        icon: Palette,
        href: "/theme",
        permission: PERMISSIONS.THEME_VIEW,
      },
    ],
  },
  {
    label: "Promotions",
    icon: Tag,
    children: [
      {
        label: "Offers",
        icon: Tag,
        href: "/offers",
        permission: PERMISSIONS.OFFERS_VIEW,
      },
    ],
  },
  {
    label: "Settings",
    icon: User,
    children: [
      {
        label: "Profile",
        icon: User,
        href: "/profile",
        permission: PERMISSIONS.PROFILE_VIEW,
      },
      {
        label: "Settings",
        icon: User,
        href: "/settings",
        permission: PERMISSIONS.SETTINGS_VIEW,
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
  const { can, isAdmin } = usePermissions();

  // Check if user has permission for this menu item
  const hasAccess = item.permission ? isAdmin || can(item.permission) : true;

  // For parent items, check if user has access to any child
  const hasChildAccess = item.children
    ? item.children.some((child) => {
        return child.permission ? isAdmin || can(child.permission) : true;
      })
    : false;

  const isActive = item.href ? location.pathname === item.href : false;
  const isParentActive = item.children
    ? item.children.some(
        (child) =>
          child.href &&
          (location.pathname === child.href ||
            location.pathname.startsWith(child.href)),
      )
    : false;
  const hasChildren = item.children && item.children.length > 0;

  useEffect(() => {
    if (isParentActive) setExpanded(true);
  }, [isParentActive]);

  // Don't show menu item if no permission.
  if (!hasAccess && !hasChildAccess) return null;

  if (hasChildren) {
    return (
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              aria-label={collapsed ? item.label : undefined}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "hover:translate-x-0.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                (expanded || isParentActive) && "bg-sidebar-accent/80 text-sidebar-accent-foreground",
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
          </TooltipTrigger>
          <TooltipContent side="right" align="center" sideOffset={8} hidden={!collapsed}>
            {item.label}
          </TooltipContent>
        </Tooltip>
        {expanded && !collapsed && (
          <div className="ml-5 mt-1.5 space-y-1 border-l border-rose-200/70 py-1 pl-2.5 dark:border-border">
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
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={item.href}
          aria-label={collapsed ? item.label : undefined}
          className={cn(
            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "hover:translate-x-0.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            (isActive || isParentActive) &&
              "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/20 hover:translate-x-0 hover:from-rose-500 hover:to-orange-500 hover:text-white",
          )}
          data-ocid={`sidebar.link.${item.label.toLowerCase().replace(/\s+/g, "_")}`}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" align="center" sideOffset={8} hidden={!collapsed}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  const {
    sidebarCollapsed,
    toggleSidebarCollapsed,
    mobileDrawerOpen,
    setMobileDrawerOpen,
  } = useUIStore();

  const sidebarContent = (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("relative flex h-[4.75rem] shrink-0 items-center border-b border-sidebar-border/70 bg-gradient-to-r from-sidebar via-sidebar to-rose-50/60 dark:to-rose-950/10", sidebarCollapsed ? "justify-center px-2" : "px-4")}>
        {!sidebarCollapsed && <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-rose-300/0 via-rose-300/70 to-orange-300/0" />}
        <div className={cn("flex min-w-0 items-center gap-3 font-semibold text-sidebar-foreground", sidebarCollapsed && "justify-center")}>
          <img
            src="/assets/images/bikaner-logo.jpeg"
            alt="Bikaner Biscuit Bakery"
            className="h-10 w-10 shrink-0 rounded-2xl border border-white/90 bg-white object-contain p-1 shadow-md shadow-rose-950/10"
          />
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-tight">Bikaner Admin</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-600/75 dark:text-rose-300/70">Bakery workspace</span>
            </div>
          )}
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1 px-2.5 py-3">
        <nav aria-label="Main navigation" className="space-y-1">
          {!sidebarCollapsed && <p className="mb-2 px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/45">Workspace</p>}
          {menuItems.map((item) => (
            <MenuItemComponent
              key={item.label}
              item={item}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>
      <div className="shrink-0 border-t border-sidebar-border/70 bg-gradient-to-r from-sidebar to-rose-50/50 p-3 dark:to-rose-950/10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={sidebarCollapsed ? "icon" : "default"}
              onClick={toggleSidebarCollapsed}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn("flex rounded-xl hover:bg-sidebar-accent", sidebarCollapsed ? "w-full justify-center" : "w-full justify-start gap-2 px-3 text-xs text-sidebar-foreground/65")}
              data-ocid="sidebar.toggle_button"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <><ChevronLeft className="h-4 w-4" />Collapse sidebar</>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" sideOffset={8}>
            {sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          </TooltipContent>
        </Tooltip>
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
          className="w-72 border-sidebar-border/70 bg-sidebar p-0 text-sidebar-foreground shadow-2xl"
        >
          <div className="flex h-full min-h-0 flex-col">
            <div className="flex h-[4.5rem] shrink-0 items-center border-b border-sidebar-border/70 bg-gradient-to-r from-sidebar to-sidebar-accent/30 px-4">
              <div className="flex items-center gap-3 font-semibold text-sidebar-foreground">
                <img
                  src="/assets/images/bikaner-logo.jpeg"
                  alt="Bikaner Biscuit Bakery"
                  className="h-10 w-10 rounded-xl border border-white/80 bg-white object-contain p-1 shadow-sm"
                />
                <div>
                  <span className="block text-sm font-bold">Bikaner Admin</span>
                  <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/60">Bakery workspace</span>
                </div>
              </div>
            </div>
            <ScrollArea className="min-h-0 flex-1 px-2.5 py-4">
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
