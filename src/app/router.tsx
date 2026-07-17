import { AlertContainer } from "@/components/AlertContainer";
import { MainLayout } from "@/layouts/MainLayout";
import { BannersPage } from "@/pages/BannersPage";
import { BulkOrdersPage } from "@/pages/BulkOrdersPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { CitiesPage } from "@/pages/CitiesPage";
import { CouponManagementPage } from "@/pages/CouponManagementPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { FranchisePage } from "@/pages/FranchisePage";
import { FranchiseRequestsPage } from "@/pages/FranchiseRequestsPage";
import { LoginPage } from "@/pages/LoginPage";
import { NormalOrdersPage } from "@/pages/NormalOrdersPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisteredFranchisePage } from "@/pages/RegisteredFranchisePage";
import { RolesPage } from "@/pages/RolesPage";
import { SellerApprovalsPage } from "@/pages/SellerApprovalsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { ThemePage } from "@/pages/ThemePage";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";
import { UsersPage } from "@/pages/UsersPage";
import { WalletPage } from "@/pages/WalletPage";
import { ZonesPage } from "@/pages/ZonesPage";
import {
  Navigate,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ProtectedRoute } from "./ProtectedRoute";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <AlertContainer />
      <Outlet />
    </>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: MainLayout,
});

const protectedRoute = createRoute({
  getParentRoute: () => appRoute,
  id: "protected",
  component: ProtectedRoute,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/dashboard" />,
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const categoriesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/categories",
  component: CategoriesPage,
});

const citiesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/cities",
  component: CitiesPage,
});

const zonesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/zones",
  component: ZonesPage,
});

const productsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/products",
  component: ProductsPage,
});

const bannersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/banners",
  component: BannersPage,
});

const rolesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/roles",
  component: RolesPage,
});

const themeRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/theme",
  component: ThemePage,
});

const profileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/profile",
  component: ProfilePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/settings",
  component: SettingsPage,
});

const couponsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/coupons",
  component: CouponManagementPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/orders",
  component: OrdersPage,
});

const normalOrdersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/orders/normal",
  component: NormalOrdersPage,
});

const bulkOrdersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/orders/bulk",
  component: BulkOrdersPage,
});

const sellerApprovalsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/approvals/sellers",
  component: SellerApprovalsPage,
});

const franchiseRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/franchise",
  component: FranchisePage,
});

const registeredFranchiseRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/franchise/registered",
  component: RegisteredFranchisePage,
});

const franchiseRequestsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/franchise/requests",
  component: FranchiseRequestsPage,
});

const walletRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/wallet",
  component: WalletPage,
});

const usersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/users",
  component: UsersPage,
});

const unauthorizedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/unauthorized",
  component: UnauthorizedPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  unauthorizedRoute,
  notFoundRoute,
  appRoute.addChildren([
    protectedRoute.addChildren([
      indexRoute,
      dashboardRoute,
      categoriesRoute,
      citiesRoute,
      zonesRoute,
      productsRoute,
      bannersRoute,
      ordersRoute,
      normalOrdersRoute,
      bulkOrdersRoute,
      sellerApprovalsRoute,
      franchiseRoute,
      registeredFranchiseRoute,
      franchiseRequestsRoute,
      walletRoute,
      usersRoute,
      rolesRoute,
      themeRoute,
      profileRoute,
      settingsRoute,
      couponsRoute,
    ]),
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
