import { usePermissions } from "@/hooks/usePermissions";
import type { ReactNode } from "react";

interface PermissionGuardProps {
  /**
   * Single permission or array of permissions to check
   */
  permission?: string | string[];

  /**
   * Logic for multiple permissions: 'AND' (all required) or 'OR' (at least one required)
   * Default: 'AND'
   */
  logic?: "AND" | "OR";

  /**
   * Content to render if user has permission
   */
  children: ReactNode;

  /**
   * Optional fallback content to render if user doesn't have permission
   */
  fallback?: ReactNode;

  /**
   * If true, renders nothing when permission is denied instead of fallback
   * Default: false
   */
  hideOnDenied?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @example
 * // Single permission
 * <PermissionGuard permission="products:edit">
 *   <Button>Edit Product</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Multiple permissions with AND logic (user needs all)
 * <PermissionGuard permission={["products:view", "products:edit"]}>
 *   <Button>Edit Product</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Multiple permissions with OR logic (user needs at least one)
 * <PermissionGuard permission={["products:edit", "products:delete"]} logic="OR">
 *   <Button>Modify Product</Button>
 * </PermissionGuard>
 * 
 * @example
 * // With fallback
 * <PermissionGuard 
 *   permission="products:edit" 
 *   fallback={<Text>You don't have permission</Text>}
 * >
 *   <Button>Edit Product</Button>
 * </PermissionGuard>
 */
export const PermissionGuard = ({
  permission,
  logic = "AND",
  children,
  fallback = null,
  hideOnDenied = false,
}: PermissionGuardProps) => {
  const { can, canAny, canAll, isAdmin } = usePermissions();

  console.log("🛡️ PermissionGuard Check:", {
    permission,
    isAdmin,
    logic,
    hideOnDenied
  });

  // Admin always has access
  if (isAdmin) {
    console.log("  ✅ Access granted: User is Admin");
    return <>{children}</>;
  }

  // If no permission specified, render children (used for public content)
  if (!permission) {
    console.log("  ✅ Access granted: No permission required");
    return <>{children}</>;
  }

  let hasAccess = false;

  if (Array.isArray(permission)) {
    // Multiple permissions
    if (logic === "OR") {
      hasAccess = canAny(permission);
      console.log(`  ${hasAccess ? '✅' : '❌'} Multiple permissions (OR): ${hasAccess}`);
    } else {
      hasAccess = canAll(permission);
      console.log(`  ${hasAccess ? '✅' : '❌'} Multiple permissions (AND): ${hasAccess}`);
    }
  } else {
    // Single permission
    hasAccess = can(permission);
    console.log(`  ${hasAccess ? '✅' : '❌'} Single permission "${permission}": ${hasAccess}`);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Permission denied
  console.log(`  🚫 Access denied - hideOnDenied: ${hideOnDenied}`);
  if (hideOnDenied) {
    return null;
  }

  return <>{fallback}</>;
};

/**
 * Hook-based alternative for conditional rendering
 * Use this when you need permission check in logic rather than JSX
 * 
 * @example
 * const { canRender } = usePermissionGuard("products:edit");
 * 
 * if (canRender) {
 *   // Do something
 * }
 */
export const usePermissionGuard = (
  permission: string | string[],
  logic: "AND" | "OR" = "AND"
) => {
  const { can, canAny, canAll, isAdmin } = usePermissions();

  let canRender = false;

  if (isAdmin) {
    canRender = true;
  } else if (!permission) {
    canRender = true;
  } else if (Array.isArray(permission)) {
    canRender = logic === "OR" ? canAny(permission) : canAll(permission);
  } else {
    canRender = can(permission);
  }

  return {
    canRender,
  };
};
