import { useAuthStore } from "@/store";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  createPermission,
  type PermissionAction,
  type PermissionModule,
} from "@/lib/permissions";
import { useMemo } from "react";

/**
 * Hook for checking user permissions
 * 
 * Provides convenient methods to check if the current user has specific permissions
 */
export const usePermissions = () => {
  const { user } = useAuthStore();

  const userPermissions = useMemo(() => {
    return user?.permissions || [];
  }, [user]);

  const userRole = useMemo(() => {
    return user?.role || "";
  }, [user]);

  const isUserAdmin = useMemo(() => {
    return isAdmin(userRole);
  }, [userRole]);

  /**
   * Check if user has a specific permission
   * Admin always returns true
   */
  const can = (permission: string): boolean => {
    if (isUserAdmin) return true;
    return hasPermission(userPermissions, permission);
  };

  /**
   * Check if user can perform an action on a module
   * Admin always returns true
   */
  const canAccess = (
    module: PermissionModule,
    action: PermissionAction
  ): boolean => {
    if (isUserAdmin) return true;
    const permission = createPermission(module, action);
    return hasPermission(userPermissions, permission);
  };

  /**
   * Check if user has any of the provided permissions
   * Admin always returns true
   */
  const canAny = (permissions: string[]): boolean => {
    if (isUserAdmin) return true;
    return hasAnyPermission(userPermissions, permissions);
  };

  /**
   * Check if user has all of the provided permissions
   * Admin always returns true
   */
  const canAll = (permissions: string[]): boolean => {
    if (isUserAdmin) return true;
    return hasAllPermissions(userPermissions, permissions);
  };

  /**
   * Check if user can view a module
   */
  const canView = (module: PermissionModule): boolean => {
    return canAccess(module, "view");
  };

  /**
   * Check if user can create in a module
   */
  const canCreate = (module: PermissionModule): boolean => {
    return canAccess(module, "create");
  };

  /**
   * Check if user can edit in a module
   */
  const canEdit = (module: PermissionModule): boolean => {
    return canAccess(module, "edit");
  };

  /**
   * Check if user can delete in a module
   */
  const canDelete = (module: PermissionModule): boolean => {
    return canAccess(module, "delete");
  };

  /**
   * Check if user can manage (special permission)
   */
  const canManage = (module: PermissionModule): boolean => {
    return canAccess(module, "manage");
  };

  return {
    // Basic permission checks
    can,
    canAccess,
    canAny,
    canAll,

    // Action-specific checks
    canView,
    canCreate,
    canEdit,
    canDelete,
    canManage,

    // User info
    isAdmin: isUserAdmin,
    userRole,
    userPermissions,
  };
};

/**
 * Hook for checking if user can access a specific module
 * Returns boolean indicating if user has view permission for the module
 */
export const useCanAccessModule = (module: PermissionModule): boolean => {
  const { canView } = usePermissions();
  return canView(module);
};

/**
 * Hook for getting all permission checks for a module
 * Returns object with all CRUD permission checks
 */
export const useModulePermissions = (module: PermissionModule) => {
  const { canView, canCreate, canEdit, canDelete, isAdmin } = usePermissions();

  return useMemo(
    () => ({
      canView: canView(module),
      canCreate: canCreate(module),
      canEdit: canEdit(module),
      canDelete: canDelete(module),
      isAdmin,
    }),
    [module, canView, canCreate, canEdit, canDelete, isAdmin]
  );
};
