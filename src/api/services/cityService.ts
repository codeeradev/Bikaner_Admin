import { del, get, post, put } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export interface City {
  id: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateCityDto {
  name: string;
  status?: "active" | "inactive";
}

export interface UpdateCityDto {
  name?: string;
  status?: "active" | "inactive";
}

export interface CityListResponse {
  data: City[];
  total: number;
  page: number;
  pageSize: number;
}

export const cityService = {
  /**
   * Get all cities with pagination
   */
  async getCities(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    state?: string;
    status?: "active" | "inactive";
  }): Promise<CityListResponse> {
    return get<CityListResponse>(ENDPOINTS.GET_CITIES, params);
  },

  /**
   * Get a single city by ID
   */
  async getCity(id: string): Promise<City> {
    return get<City>(ENDPOINTS.GET_CITY(id));
  },

  /**
   * Create a new city
   */
  async createCity(data: CreateCityDto): Promise<City> {
    // Convert status to isActive for backend
    const backendData: any = { ...data };
    if (data.status) {
      backendData.isActive = data.status === 'active';
      delete backendData.status;
    }
    
    return post<City>(ENDPOINTS.CREATE_CITY, backendData);
  },

  /**
   * Update an existing city
   */
  async updateCity(id: string, data: UpdateCityDto): Promise<City> {
    // Convert status to isActive for backend
    const backendData: any = { ...data };
    if (data.status) {
      backendData.isActive = data.status === 'active';
      delete backendData.status;
    }
    
    return put<City>(ENDPOINTS.UPDATE_CITY(id), backendData);
  },

  /**
   * Delete a city
   */
  async deleteCity(id: string): Promise<void> {
    return del<void>(ENDPOINTS.DELETE_CITY(id));
  },
};
