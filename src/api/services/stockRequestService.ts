import { get, put } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

type Status = "pending" | "approved" | "dispatched" | "received" | "rejected";
export interface StockRequest {
  id: string;
  productName: string;
  franchiseId: { id: string; name: string; managerName: string } | null;
  stockAtRequest: number;
  requestedQuantity: number;
  approvedQuantity?: number;
  note: string;
  adminNote: string;
  status: Status;
  createdAt: string;
  reviewedBy?: { name: string } | null;
  receivedAt?: string;
}
export interface List {
  data: StockRequest[];
  pagination: { pages: number; total: number };
}

export function stockRequestError(error: unknown, fallback: string): string {
  return error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
    ? error.message
    : fallback;
}

export const stockRequestService = {
  async list(params: {
    page: number;
    limit: number;
    status?: string;
  }): Promise<List> {
    const response = await get<List>(
      ENDPOINTS.GET_FRANCHISE_STOCK_REQUESTS,
      params,
    );
    if (
      !response ||
      !Array.isArray(response.data) ||
      !response.pagination ||
      !Number.isFinite(response.pagination.total) ||
      !Number.isFinite(response.pagination.pages)
    ) {
      throw new Error(
        "Unexpected stock-request response. Check that the backend is running and the API URL is correct.",
      );
    }
    return response;
  },
  update(
    id: string,
    body: { status: string; quantity?: number; note?: string },
  ) {
    return put(ENDPOINTS.UPDATE_FRANCHISE_STOCK_REQUEST(id), body);
  },
};
