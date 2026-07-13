import { get, put } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export type SellerApplicationStatus = "pending" | "approved" | "rejected";

export interface SellerApplication {
  id: string;
  userId?: {
    id?: string;
    name?: string;
    email?: string;
    mobile?: string;
    constRoleId?: number;
  };
  name: string;
  mobile: string;
  email?: string;
  gst?: string;
  address: string;
  cityId?: {
    id?: string;
    name?: string;
  };
  status: SellerApplicationStatus;
  reviewedBy?: {
    id?: string;
    name?: string;
  } | null;
  reviewedAt?: string | null;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface SellerApplicationListResponse {
  success: boolean;
  data: SellerApplication[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface SellerApplicationResponse {
  success: boolean;
  message?: string;
  data: SellerApplication;
}

export const sellerApplicationService = {
  async getApplications(params?: {
    page?: number;
    limit?: number;
    status?: SellerApplicationStatus | "all";
    search?: string;
  }): Promise<SellerApplicationListResponse> {
    return get<SellerApplicationListResponse>(
      ENDPOINTS.GET_SELLER_APPLICATIONS,
      params,
    );
  },

  async approveApplication(id: string): Promise<SellerApplicationResponse> {
    return put<SellerApplicationResponse>(
      ENDPOINTS.APPROVE_SELLER_APPLICATION(id),
    );
  },

  async rejectApplication(
    id: string,
    reason?: string,
  ): Promise<SellerApplicationResponse> {
    return put<SellerApplicationResponse>(
      ENDPOINTS.REJECT_SELLER_APPLICATION(id),
      { reason },
    );
  },
};
