import type { Staff } from "@/types";
import { del, get, patch, post, put, upload } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export interface CreateStaffDto {
  roleId: string;
  name: string;
  mobile: string;
  email?: string;
  password: string;
  cityId?: string;
  zoneIds?: string[];
  allowedCategories?: string[];
  customPricingEnabled?: boolean;
  status?: "active" | "inactive";
  profileImage?: File;
}

export interface UpdateStaffDto {
  roleId?: string;
  name?: string;
  mobile?: string;
  email?: string;
  password?: string;
  cityId?: string;
  zoneIds?: string[];
  allowedCategories?: string[];
  customPricingEnabled?: boolean;
  status?: "active" | "inactive";
  profileImage?: File;
}

export interface StaffListResponse {
  success: boolean;
  data: Staff[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface StaffResponse {
  success: boolean;
  data: Staff;
  message?: string;
}

export const staffService = {
  /**
   * Get all staff members
   */
  async getStaff(params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<StaffListResponse> {
    return get<StaffListResponse>(ENDPOINTS.GET_USERS, params);
  },

  /**
   * Get single staff member by ID
   */
  async getStaffById(id: string): Promise<StaffResponse> {
    return get<StaffResponse>(ENDPOINTS.GET_USER(id));
  },

  /**
   * Create new staff member
   */
  async createStaff(data: CreateStaffDto): Promise<StaffResponse> {
    if (data.profileImage) {
      const formData = new FormData();
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      }

      return upload<StaffResponse>(ENDPOINTS.CREATE_USER, formData);
    }

    return post<StaffResponse>(ENDPOINTS.CREATE_USER, data);
  },

  /**
   * Update staff member
   */
  async updateStaff(id: string, data: UpdateStaffDto): Promise<StaffResponse> {
    if (data.profileImage) {
      const formData = new FormData();
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      }

      return upload<StaffResponse>(
        ENDPOINTS.UPDATE_USER(id),
        formData,
        undefined,
        "PUT",
      );
    }

    return put<StaffResponse>(ENDPOINTS.UPDATE_USER(id), data);
  },

  /**
   * Delete staff member
   */
  async deleteStaff(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    return del<{ success: boolean; message: string }>(
      ENDPOINTS.DELETE_USER(id),
    );
  },

  /**
   * Toggle staff status
   */
  async toggleStaffStatus(id: string): Promise<StaffResponse> {
    return patch<StaffResponse>(ENDPOINTS.TOGGLE_USER_STATUS(id));
  },
};
