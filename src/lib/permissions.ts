/**
 * Permission utility functions
 *
 * This file contains helper functions for checking user permissions
 * and working with the RBAC system
 */

// Export these types for external use
export type PermissionAction = "view" | "create" | "edit" | "delete" | "manage";

export type PermissionModule =
  | "dashboard"
  | "categories"
  | "products"
  | "zones"
  | "cities"
  | "orders"
  | "normalOrders"
  | "bulkOrders"
  | "sellerApprovals"
  | "franchise"
  | "franchiseRequests"
  | "registeredFranchises"
  | "users"
  | "roles"
  | "wallet"
  | "settings"
  | "theme"
  | "profile"
  | "banners";

/**
 * Permission constants matching backend
 */
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: "dashboard:view",

  // Categories
  CATEGORIES_VIEW: "categories:view",
  CATEGORIES_CREATE: "categories:create",
  CATEGORIES_EDIT: "categories:edit",
  CATEGORIES_DELETE: "categories:delete",

  // Products
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_CREATE: "products:create",
  PRODUCTS_EDIT: "products:edit",
  PRODUCTS_DELETE: "products:delete",

  // Zones
  ZONES_VIEW: "zones:view",
  ZONES_CREATE: "zones:create",
  ZONES_EDIT: "zones:edit",
  ZONES_DELETE: "zones:delete",

  // Cities
  CITIES_VIEW: "cities:view",
  CITIES_CREATE: "cities:create",
  CITIES_EDIT: "cities:edit",
  CITIES_DELETE: "cities:delete",

  // Orders
  ORDERS_VIEW: "orders:view",
  ORDERS_CREATE: "orders:create",
  ORDERS_EDIT: "orders:edit",
  ORDERS_DELETE: "orders:delete",

  // Normal Orders
  NORMAL_ORDERS_VIEW: "normalOrders:view",
  NORMAL_ORDERS_EDIT: "normalOrders:edit",

  // Bulk Orders
  BULK_ORDERS_VIEW: "bulkOrders:view",
  BULK_ORDERS_EDIT: "bulkOrders:edit",

  // Seller Approvals
  SELLER_APPROVALS_VIEW: "sellerApprovals:view",
  SELLER_APPROVALS_MANAGE: "sellerApprovals:manage",

  // Franchise
  FRANCHISE_VIEW: "franchise:view",
  FRANCHISE_CREATE: "franchise:create",
  FRANCHISE_EDIT: "franchise:edit",
  FRANCHISE_DELETE: "franchise:delete",

  // Franchise Requests
  FRANCHISE_REQUESTS_VIEW: "franchiseRequests:view",
  FRANCHISE_REQUESTS_MANAGE: "franchiseRequests:manage",

  // Registered Franchises
  REGISTERED_FRANCHISES_VIEW: "registeredFranchises:view",
  REGISTERED_FRANCHISES_EDIT: "registeredFranchises:edit",

  // Users
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_EDIT: "users:edit",
  USERS_DELETE: "users:delete",

  // Roles
  ROLES_VIEW: "roles:view",
  ROLES_CREATE: "roles:create",
  ROLES_EDIT: "roles:edit",
  ROLES_DELETE: "roles:delete",

  // Wallet
  WALLET_VIEW: "wallet:view",
  WALLET_MANAGE: "wallet:manage",

  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_EDIT: "settings:edit",

  // Theme
  THEME_VIEW: "theme:view",
  THEME_EDIT: "theme:edit",

  // Profile
  PROFILE_VIEW: "profile:view",
  PROFILE_EDIT: "profile:edit",

  // Banners
  BANNERS_VIEW: "banners:view",
  BANNERS_CREATE: "banners:create",
  BANNERS_EDIT: "banners:edit",
  BANNERS_DELETE: "banners:delete",
} as const;

/**
 * Module display names for UI
 */
export const MODULE_LABELS: Record<PermissionModule, string> = {
  dashboard: "Dashboard",
  categories: "Categories",
  products: "Products",
  zones: "Zones",
  cities: "Cities",
  orders: "Orders",
  normalOrders: "Normal Orders",
  bulkOrders: "Bulk Orders",
  sellerApprovals: "Seller Approvals",
  franchise: "Franchise",
  franchiseRequests: "Franchise Requests",
  registeredFranchises: "Registered Franchises",
  users: "Users",
  roles: "Roles",
  wallet: "Wallet",
  settings: "Settings",
  theme: "Theme",
  profile: "Profile",
  banners: "Banners",
};

/**
 * Action display names for UI
 */
export const ACTION_LABELS: Record<PermissionAction, string> = {
  view: "View",
  create: "Add",
  edit: "Edit",
  delete: "Delete",
  manage: "Manage",
};

/**
 * Special role names
 */
export const SPECIAL_ROLES = {
  ADMIN: "Admin",
  FRANCHISE: "Franchise",
} as const;

/**
 * Create permission string from module and action
 */
export const createPermission = (
  module: PermissionModule,
  action: PermissionAction,
): string => {
  return `${module}:${action}`;
};

/**
 * Parse permission string into module and action
 */
export const parsePermission = (
  permission: string,
): { module: string; action: string } => {
  const [module, action] = permission.split(":");
  return { module, action };
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (
  userPermissions: string[],
  requiredPermission: string,
): boolean => {
  return userPermissions.includes(requiredPermission);
};

/**
 * Check if user has any of the provided permissions (OR logic)
 */
export const hasAnyPermission = (
  userPermissions: string[],
  requiredPermissions: string[],
): boolean => {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission),
  );
};

/**
 * Check if user has all of the provided permissions (AND logic)
 */
export const hasAllPermissions = (
  userPermissions: string[],
  requiredPermissions: string[],
): boolean => {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission),
  );
};

/**
 * Check if user is Admin (special role with full access)
 */
export const isAdmin = (roleName: string): boolean => {
  return roleName === SPECIAL_ROLES.ADMIN;
};

/**
 * Get all permissions for a module
 */
export const getModulePermissions = (module: PermissionModule): string[] => {
  return Object.values(PERMISSIONS).filter((permission) =>
    permission.startsWith(`${module}:`),
  );
};

/**
 * Group permissions by module
 */
export const groupPermissionsByModule = (
  permissions: string[],
): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};

  for (const permission of permissions) {
    const { module } = parsePermission(permission);
    if (!grouped[module]) {
      grouped[module] = [];
    }
    grouped[module].push(permission);
  }

  return grouped;
};

/**
 * Filter permissions by action
 */
export const filterPermissionsByAction = (
  permissions: string[],
  action: PermissionAction,
): string[] => {
  return permissions.filter((permission) => permission.endsWith(`:${action}`));
};

/**
 * Get available actions for a module from a list of permissions
 */
export const getModuleActions = (
  permissions: string[],
  module: PermissionModule,
): PermissionAction[] => {
  const modulePermissions = permissions.filter((permission) =>
    permission.startsWith(`${module}:`),
  );

  return modulePermissions.map((permission) => {
    const { action } = parsePermission(permission);
    return action as PermissionAction;
  });
};

/**
 * Check if module has specific action in permissions list
 */
export const hasModuleAction = (
  permissions: string[],
  module: PermissionModule,
  action: PermissionAction,
): boolean => {
  return permissions.includes(createPermission(module, action));
};

/**
 * Get all available modules
 */
export const getAllModules = (): PermissionModule[] => {
  return Object.keys(MODULE_LABELS) as PermissionModule[];
};

/**
 * Get all available actions
 */
export const getAllActions = (): PermissionAction[] => {
  return Object.keys(ACTION_LABELS) as PermissionAction[];
};
