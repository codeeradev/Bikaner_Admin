import { get, post, put, del, patch } from "../apiClient";
import { ENDPOINTS } from "../endpoints";
import type { Role, PermissionsByModule } from "@/types";

export interface CreateRoleDto {
  name: string;
  permissions: string[];
  isActive?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface RoleListResponse {
  success: boolean;
  data: Role[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface RoleResponse {
  success: boolean;
  data: Role;
  message?: string;
}

export interface PermissionsResponse {
  success: boolean;
  data: {
    byModule: PermissionsByModule;
    all: string[];
  };
}

export const roleService = {
  /**
   * Get all roles
   */
  async getRoles(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<RoleListResponse> {
    return get<RoleListResponse>(ENDPOINTS.GET_ROLES, params);
  },

  /**
   * Get single role by ID
   */
  async getRoleById(id: string): Promise<RoleResponse> {
    return get<RoleResponse>(ENDPOINTS.GET_ROLE(id));
  },

  /**
   * Create new role
   */
  async createRole(data: CreateRoleDto): Promise<RoleResponse> {
    return post<RoleResponse>(ENDPOINTS.CREATE_ROLE, data);
  },

  /**
   * Update role
   */
  async updateRole(id: string, data: UpdateRoleDto): Promise<RoleResponse> {
    return put<RoleResponse>(ENDPOINTS.UPDATE_ROLE(id), data);
  },

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<{ success: boolean; message: string }> {
    return del<{ success: boolean; message: string }>(
      ENDPOINTS.DELETE_ROLE(id)
    );
  },

  /**
   * Toggle role status
   */
  async toggleRoleStatus(id: string): Promise<RoleResponse> {
    return patch<RoleResponse>(ENDPOINTS.TOGGLE_ROLE_STATUS(id));
  },

  /**
   * Get all available permissions grouped by module
   */
  async getAvailablePermissions(): Promise<PermissionsResponse> {
    return get<PermissionsResponse>(ENDPOINTS.GET_PERMISSIONS);
  },
};
