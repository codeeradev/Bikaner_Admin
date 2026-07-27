import { notificationService } from "@/api/services/notificationService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore, useThemeStore, useUIStore } from "@/store";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  ClipboardList,
  LogOut,
  Moon,
  Settings,
  ShoppingBag,
  Store,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";

type HeaderNotification = Awaited<
  ReturnType<typeof notificationService.getNotifications>
>["data"][number];

const formatNotificationTime = (value: string) => {
  const createdAt = new Date(value).getTime();
  const diffInSeconds = Math.max(
    Math.floor((Date.now() - createdAt) / 1000),
    0,
  );

  if (diffInSeconds < 60) return "Just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
};

const getNotificationIcon = (notification: HeaderNotification) => {
  if (notification.type === "seller_application") {
    return <Store className="h-4 w-4" />;
  }

  if (notification.type === "bulk_order") {
    return <ClipboardList className="h-4 w-4" />;
  }

  return <ShoppingBag className="h-4 w-4" />;
};

export function Header() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { setMobileDrawerOpen } = useUIStore();
  const hasUnreadNotifications = unreadCount > 0;
  const visibleUnreadCount = useMemo(
    () => (unreadCount > 99 ? "99+" : unreadCount.toString()),
    [unreadCount],
  );

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoadingNotifications(true);
    try {
      const response = await notificationService.getNotifications({
        page: 1,
        limit: 8,
      });
      setNotifications(response.data || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load admin notifications:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadNotifications();

    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const intervalId = window.setInterval(loadNotifications, 30000);

    return () => window.clearInterval(intervalId);
  }, [isAuthenticated, loadNotifications]);

  const handleNotificationClick = async (notification: HeaderNotification) => {
    if (!notification.read) {
      setNotifications((currentNotifications) =>
        currentNotifications.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      );
      setUnreadCount((currentCount) => Math.max(currentCount - 1, 0));

      try {
        await notificationService.markAsRead(notification.id);
      } catch (error) {
        console.error("Failed to mark admin notification as read:", error);
        loadNotifications();
      }
    }

    if (notification.link) {
      navigate({ to: notification.link });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!hasUnreadNotifications) return;

    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error("Failed to mark admin notifications as read:", error);
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  };

  const handleDeleteNotification = async (
    notificationId: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const notificationToDelete = notifications.find(
      (notification) => notification.id === notificationId,
    );
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    setNotifications((currentNotifications) =>
      currentNotifications.filter(
        (notification) => notification.id !== notificationId,
      ),
    );

    if (notificationToDelete && !notificationToDelete.read) {
      setUnreadCount((currentCount) => Math.max(currentCount - 1, 0));
    }

    try {
      await notificationService.deleteNotification(notificationId);
    } catch (error) {
      console.error("Failed to delete admin notification:", error);
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-md px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileDrawerOpen(true)}
        data-ocid="header.mobile_menu"
      >
        <span className="sr-only">Open menu</span>
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <title>Menu</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="relative"
          data-ocid="header.theme_toggle"
        >
          {darkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu onOpenChange={(open) => open && loadNotifications()}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              data-ocid="header.notifications"
            >
              <Bell className="h-4 w-4" />
              {hasUnreadNotifications && (
                <span className="absolute -top-1 -right-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
                  {visibleUnreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-96 max-w-[calc(100vw-2rem)]"
            align="end"
          >
            <div className="flex items-center justify-between gap-3 px-2 py-1.5">
              <DropdownMenuLabel className="p-0">
                Admin notifications
              </DropdownMenuLabel>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 px-2 text-xs"
                onClick={handleMarkAllAsRead}
                disabled={!hasUnreadNotifications}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark read
              </Button>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto py-1">
              {isLoadingNotifications && notifications.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No admin notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex cursor-pointer items-start gap-3 px-3 py-3"
                    onSelect={() => handleNotificationClick(notification)}
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        notification.read
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {getNotificationIcon(notification)}
                    </span>
                    <span className="min-w-0 flex-1 space-y-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="line-clamp-1 text-sm font-medium">
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive" />
                        )}
                      </span>
                      <span className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {notification.message}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(event) =>
                        handleDeleteNotification(notification.id, event)
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete notification</span>
                    </Button>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full"
              data-ocid="header.user_menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.email || "admin@bikanerbiscuit.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
              data-ocid="header.logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
