import type { PermissionAction, PermissionSection, Role } from "@/types";

const allSections: PermissionSection[] = [
  "dashboard",
  "categories",
  "products",
  "orders",
  "wallet",
  "franchise",
  "theme",
  "settings",
];

const allActions: PermissionAction[] = ["view", "create", "edit", "delete"];

function createPermissions(
  overrides: Partial<
    Record<PermissionSection, Partial<Record<PermissionAction, boolean>>>
  > = {},
) {
  return allSections.map((section) => ({
    section,
    actions: Object.fromEntries(
      allActions.map((action) => [
        action,
        overrides[section]?.[action] ?? false,
      ]),
    ) as Record<PermissionAction, boolean>,
  }));
}

export const mockRoles: Role[] = [
  {
    id: "role-1",
    name: "Admin",
    description: "Full system access with all permissions",
    permissions: createPermissions({
      dashboard: { view: true, create: true, edit: true, delete: true },
      categories: { view: true, create: true, edit: true, delete: true },
      products: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, create: true, edit: true, delete: true },
      wallet: { view: true, create: true, edit: true, delete: true },
      franchise: { view: true, create: true, edit: true, delete: true },
      theme: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, create: true, edit: true, delete: true },
    }),
    userCount: 3,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "role-2",
    name: "Franchise",
    description: "Franchise owner with limited management access",
    permissions: createPermissions({
      dashboard: { view: true },
      categories: { view: true },
      products: { view: true },
      orders: { view: true, create: true, edit: true },
      wallet: { view: true },
      franchise: { view: true },
      theme: { view: true },
      settings: { view: true },
    }),
    userCount: 12,
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "role-3",
    name: "Manager",
    description: "Manager with product and order management access",
    permissions: createPermissions({
      dashboard: { view: true },
      categories: { view: true, create: true, edit: true },
      products: { view: true, create: true, edit: true, delete: true },
      orders: { view: true, create: true, edit: true },
      wallet: { view: true },
      franchise: { view: true },
      theme: { view: true },
      settings: { view: true },
    }),
    userCount: 5,
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "role-4",
    name: "Staff",
    description: "Basic staff with view-only access",
    permissions: createPermissions({
      dashboard: { view: true },
      categories: { view: true },
      products: { view: true },
      orders: { view: true },
      wallet: { view: true },
      franchise: { view: true },
      theme: { view: true },
      settings: { view: true },
    }),
    userCount: 8,
    createdAt: "2024-03-01T00:00:00Z",
  },
];

export const permissionSectionLabels: Record<PermissionSection, string> = {
  dashboard: "Dashboard",
  categories: "Categories",
  products: "Products",
  orders: "Orders",
  wallet: "Wallet",
  franchise: "Franchise",
  theme: "Theme",
  settings: "Settings",
};

export const permissionActionLabels: Record<PermissionAction, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
};
