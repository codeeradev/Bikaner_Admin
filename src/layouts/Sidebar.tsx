import { ENDPOINTS } from "@/api/endpoints";
import { settingsService } from "@/api/services";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useSettingsStore, useUIStore } from "@/store";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Cookie,
  FolderTree,
  ImageIcon,
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
  UserCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
        label: "Normal Orders",
        icon: ShoppingCart,
        href: "/orders/normal",
        permission: PERMISSIONS.NORMAL_ORDERS_VIEW,
      },
      {
        label: "Bulk Orders",
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
        label: "Seller Applications",
        icon: UserCheck,
        href: "/approvals/sellers",
        permission: PERMISSIONS.SELLER_APPROVALS_VIEW,
      },
    ],
  },
  // {
  //   label: "Franchise",
  //   icon: Store,
  //   children: [
  //     {
  //       label: "Registered Franchise",
  //       icon: Store,
  //       href: "/franchise/registered",
  //       permission: PERMISSIONS.REGISTERED_FRANCHISES_VIEW,
  //     },
  //     {
  //       label: "Franchise Requests",
  //       icon: Store,
  //       href: "/franchise/requests",
  //       permission: PERMISSIONS.FRANCHISE_REQUESTS_VIEW,
  //     },
  //   ],
  // },
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
    label: "Settings",
    icon: Settings,
    children: [
      {
        label: "Profile",
        icon: User,
        href: "/profile",
        permission: PERMISSIONS.PROFILE_VIEW,
      },
      {
        label: "Settings",
        icon: Settings,
        href: "/settings",
        permission: PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
];

const apiOrigin = new URL(ENDPOINTS.GET_SETTINGS).origin;

function getAssetUrl(path?: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
}

function BrandLogo({ logoUrl }: { logoUrl: string }) {
  return (
    <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center overflow-hidden">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="Site logo"
          className="h-full w-full object-cover"
        />
      ) : (
        <Cookie className="h-4 w-4 text-primary-foreground" />
      )}
    </div>
  );
}

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

  // Don't show menu item if no permission
  if (!hasAccess && !hasChildAccess) return null;

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

export function Sidebar() {
  const {
    sidebarCollapsed,
    toggleSidebarCollapsed,
    mobileDrawerOpen,
    setMobileDrawerOpen,
  } = useUIStore();
  const { isAdmin } = usePermissions();
  const { siteTitle, siteLogo, setBrandSettings } = useSettingsStore();
  const logoUrl = useMemo(() => getAssetUrl(siteLogo), [siteLogo]);

  useEffect(() => {
    if (!isAdmin) return;

    let isMounted = true;

    const loadBrandSettings = async () => {
      try {
        const response = await settingsService.getSettings();
        if (!isMounted) return;
        setBrandSettings({
          siteTitle: response.data.siteTitle,
          siteLogo: response.data.siteLogo || "",
        });
      } catch (error) {
        console.error("Failed to load brand settings:", error);
      }
    };

    loadBrandSettings();

    return () => {
      isMounted = false;
    };
  }, [isAdmin, setBrandSettings]);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2 font-semibold text-sidebar-foreground">
          <BrandLogo logoUrl={logoUrl} />
          {!sidebarCollapsed && <span className="text-sm">{siteTitle}</span>}
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
                <BrandLogo logoUrl={logoUrl} />
                <span className="text-sm">{siteTitle}</span>
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
