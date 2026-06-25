import { del, get, post, put } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export interface Zone {
  id: string;
  name: string;
  description?: string;
  deliveryCharge: number;
  minOrderAmount: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateZoneDto {
  name: string;
  description?: string;
  deliveryCharge: number;
  minOrderAmount: number;
  status?: "active" | "inactive";
}

export interface UpdateZoneDto {
  name?: string;
  description?: string;
  deliveryCharge?: number;
  minOrderAmount?: number;
  status?: "active" | "inactive";
}

export interface ZoneListResponse {
  data: Zone[];
  total: number;
  page: number;
  pageSize: number;
}

export const zoneService = {
  /**
   * Get all zones with pagination
   */
  async getZones(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: "active" | "inactive";
  }): Promise<ZoneListResponse> {
    return get<ZoneListResponse>(ENDPOINTS.GET_ZONES, params);
  },

  /**
   * Get a single zone by ID
   */
  async getZone(id: string): Promise<Zone> {
    return get<Zone>(ENDPOINTS.GET_ZONE(id));
  },

  /**
   * Create a new zone
   */
  async createZone(data: CreateZoneDto): Promise<Zone> {
    // Convert status to isActive for backend
    const backendData: any = { ...data };
    if (data.status) {
      backendData.isActive = data.status === 'active';
      delete backendData.status;
    }
    
    return post<Zone>(ENDPOINTS.CREATE_ZONE, backendData);
  },

  /**
   * Update an existing zone
   */
  async updateZone(id: string, data: UpdateZoneDto): Promise<Zone> {
    // Convert status to isActive for backend
    const backendData: any = { ...data };
    if (data.status) {
      backendData.isActive = data.status === 'active';
      delete backendData.status;
    }
    
    return put<Zone>(ENDPOINTS.UPDATE_ZONE(id), backendData);
  },

  /**
   * Delete a zone
   */
  async deleteZone(id: string): Promise<void> {
    return del<void>(ENDPOINTS.DELETE_ZONE(id));
  },
};
