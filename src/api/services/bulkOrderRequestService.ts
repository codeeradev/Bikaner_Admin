import { get, patch } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export type BulkRequestStatus = "pending" | "contacted" | "closed";

export interface BulkOrderRequest {
  id: string;
  quantity: number;
  status: BulkRequestStatus;
  createdAt: string;
  productId?: { name: string; sku?: string; image?: string };
  userId?: { name?: string; phone?: string; email?: string };
}

export const bulkOrderRequestService = {
  async getAll(): Promise<BulkOrderRequest[]> {
    const response = await get<{ data: BulkOrderRequest[] }>(ENDPOINTS.GET_BULK_ORDER_REQUESTS);
    return response.data;
  },
  async updateStatus(id: string, status: BulkRequestStatus): Promise<BulkOrderRequest> {
    const response = await patch<{ data: BulkOrderRequest }>(ENDPOINTS.UPDATE_BULK_ORDER_REQUEST_STATUS(id), { status });
    return response.data;
  },
};
