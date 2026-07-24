import { del, get, post, put } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export type OfferType = "flat_discount" | "percentage_discount" | "bogo";

export type ApplicableOn = "cart" | "specific_products";

export interface BOGOConfig {
  buyQuantity: number;
  getQuantity: number;
}

export interface Offer {
  id: string;
  name: string;
  description?: string;
  offerType: OfferType;
  discountValue?: number;
  maxDiscountAmount?: number;
  bogoConfig?: BOGOConfig;
  applicableOn: ApplicableOn;
  specificProducts?: string[];
  minCartValue?: number;
  startDate: string;
  endDate?: string;
  priority: number;
  autoApply: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OfferPayload {
  name: string;
  description?: string;
  offerType: OfferType;
  discountValue?: number;
  maxDiscountAmount?: number;
  bogoConfig?: BOGOConfig;
  applicableOn: ApplicableOn;
  specificProducts?: string[];
  minCartValue?: number;
  startDate: string;
  endDate?: string;
  priority?: number;
  autoApply?: boolean;
  isActive?: boolean;
}

interface OfferListResponse {
  success: boolean;
  message?: string;
  data: Offer[];
}

interface OfferResponse {
  success: boolean;
  message?: string;
  data: Offer;
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

export const offerService = {
  async getOffers(): Promise<Offer[]> {
    const response = ensureSuccess(
      await get<OfferListResponse>(ENDPOINTS.GET_OFFERS, { limit: 100 }),
      "Failed to fetch offers",
    );
    return response.data;
  },

  async getOfferById(id: string): Promise<Offer> {
    const response = ensureSuccess(
      await get<OfferResponse>(ENDPOINTS.GET_OFFER(id)),
      "Failed to fetch offer",
    );
    return response.data;
  },

  async createOffer(data: OfferPayload): Promise<OfferResponse> {
    return ensureSuccess(
      await post<OfferResponse>(ENDPOINTS.CREATE_OFFER, data),
      "Failed to create offer",
    );
  },

  async updateOffer(id: string, data: OfferPayload): Promise<OfferResponse> {
    return ensureSuccess(
      await put<OfferResponse>(ENDPOINTS.UPDATE_OFFER(id), data),
      "Failed to update offer",
    );
  },

  async deleteOffer(id: string): Promise<DeleteResponse> {
    return ensureSuccess(
      await del<DeleteResponse>(ENDPOINTS.DELETE_OFFER(id)),
      "Failed to delete offer",
    );
  },
};
