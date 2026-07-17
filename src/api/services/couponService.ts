import { del, get, post, put } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export type CouponType = "percentage" | "flat";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponPayload {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  description?: string;
  isActive?: boolean;
}

interface CouponListResponse {
  success: boolean;
  message?: string;
  data: Coupon[];
}

interface CouponResponse {
  success: boolean;
  message?: string;
  data: Coupon;
}

interface DeleteResponse {
  success: boolean;
  message?: string;
}

const ensureSuccess = <T extends { success: boolean; message?: string }>(
  response: T,
  fallbackMessage: string,
): T => {
  if (!response.success) {
    throw new Error(response.message || fallbackMessage);
  }

  return response;
};

export const couponService = {
  async getCoupons(): Promise<Coupon[]> {
    const response = ensureSuccess(
      await get<CouponListResponse>(ENDPOINTS.GET_COUPONS, { limit: 100 }),
      "Failed to fetch coupons",
    );
    return response.data;
  },

  async createCoupon(data: CouponPayload): Promise<CouponResponse> {
    return ensureSuccess(
      await post<CouponResponse>(ENDPOINTS.CREATE_COUPON, data),
      "Failed to create coupon",
    );
  },

  async updateCoupon(id: string, data: CouponPayload): Promise<CouponResponse> {
    return ensureSuccess(
      await put<CouponResponse>(ENDPOINTS.UPDATE_COUPON(id), data),
      "Failed to update coupon",
    );
  },

  async deleteCoupon(id: string): Promise<DeleteResponse> {
    return ensureSuccess(
      await del<DeleteResponse>(ENDPOINTS.DELETE_COUPON(id)),
      "Failed to delete coupon",
    );
  },
};
