import { del, get, patch, post, put } from "../apiClient";
import type { ApiResponse } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

/**
 * A franchise store as returned by the admin list/detail endpoints.
 * `cityId`/`zoneId` come back populated as `{ _id, name }` on the detail
 * view but as plain strings on some list contexts — both are accepted here.
 */
export interface Franchise {
  id: string;
  name: string;
  address: string;
  cityId: { _id: string; name: string } | string;
  zoneId: { _id: string; name: string } | string;
  lat: number;
  lng: number;
  managerName: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  /** Present on the list endpoint only (aggregated server-side). */
  productCount?: number;
  /** Present on the list endpoint only (aggregated server-side). */
  pendingOrders?: number;
  createdAt: string;
  updatedAt: string;
}

/** One row of a store's per-product stock/pricing override. */
export interface FranchiseInventoryItem {
  id: string;
  // Populated shape uses `id`, not `_id` — apiClient's transformMongoResponse
  // rewrites every Mongo `_id` to `id`, including inside populated fields.
  productId: { id: string; name: string; sku: string; image?: string } | string;
  stock: number;
  mrp: number;
  sellingPrice: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

/** One row of a store's order history, as shown on the detail page. */
export interface FranchiseOrderHistoryItem {
  id: string;
  orderNumber?: string;
  grandTotal: number;
  orderStatus: string;
  franchiseAssignment: FranchiseAssignment;
  createdAt: string;
}

/** Full store profile + its inventory + its order history (GET /franchises/:id). */
export interface FranchiseDetail extends Franchise {
  inventory: FranchiseInventoryItem[];
  orderHistory: FranchiseOrderHistoryItem[];
}

/** Body for POST /franchises/:id/products — adds a product to a store's catalog. */
export interface AddFranchiseProductDto {
  productId: string;
  stock?: number;
  mrp: number;
  sellingPrice: number;
  isVisible?: boolean;
}

/** Body for PUT /franchises/:id/products/:productId — only sent fields are touched. */
export interface UpdateFranchiseProductDto {
  stock?: number;
  mrp?: number;
  sellingPrice?: number;
  isVisible?: boolean;
}

/** getFranchiseProducts' response envelope (same shape as FranchiseListResponse). */
export interface FranchiseProductListResponse {
  success: boolean;
  data: FranchiseInventoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/** Body for POST /franchises. */
export interface CreateFranchiseDto {
  name: string;
  address: string;
  cityId: string;
  zoneId: string;
  lat: number;
  lng: number;
  managerName: string;
  email: string;
  password: string;
  phone: string;
}

/**
 * Body for PUT /franchises/:id. `password` is optional — only send it
 * when the admin is explicitly resetting the manager's login, since an
 * empty string would otherwise wipe it (see adminFranchiseController).
 */
export interface UpdateFranchiseDto {
  name?: string;
  address?: string;
  cityId?: string;
  zoneId?: string;
  lat?: number;
  lng?: number;
  managerName?: string;
  email?: string;
  password?: string;
  phone?: string;
}

/** Shape of the assignment sub-document embedded on an order. */
export interface FranchiseAssignment {
  franchiseId: string | { _id: string; name: string; managerName: string; phone: string };
  status: "pending" | "accepted" | "rejected";
  assignedAt: string;
  assignedBy?: string;
  respondedAt?: string | null;
}

/** Just enough of an order to reflect the result of an assignment call. */
export interface AssignedOrder {
  id: string;
  orderNumber?: string;
  franchiseAssignment: FranchiseAssignment;
}

/**
 * getFranchises' response envelope. Note this does NOT match
 * zoneService's ZoneListResponse shape — the franchise list endpoint
 * nests pagination under `pagination`, it isn't spread flat.
 */
export interface FranchiseListResponse {
  success: boolean;
  data: Franchise[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const franchiseService = {
  /**
   * GET /franchises
   * List every store, with product/pending-order counts already
   * aggregated server-side.
   */
  async getFranchises(params?: {
    status?: "active" | "inactive";
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<FranchiseListResponse> {
    return get<FranchiseListResponse>(ENDPOINTS.GET_FRANCHISES, params);
  },

  /**
   * GET /franchises/:id
   * Full store profile plus its inventory and recent order history.
   */
  async getFranchise(id: string): Promise<ApiResponse<FranchiseDetail>> {
    return get<ApiResponse<FranchiseDetail>>(ENDPOINTS.GET_FRANCHISE(id));
  },

  /**
   * POST /franchises
   * Creates the store and its manager login in a single call.
   */
  async createFranchise(
    data: CreateFranchiseDto,
  ): Promise<ApiResponse<Franchise>> {
    return post<ApiResponse<Franchise>>(ENDPOINTS.CREATE_FRANCHISE, data);
  },

  /**
   * PUT /franchises/:id
   * Edits store/manager details. Omit `password` unless resetting it.
   */
  async updateFranchise(
    id: string,
    data: UpdateFranchiseDto,
  ): Promise<ApiResponse<Franchise>> {
    return put<ApiResponse<Franchise>>(ENDPOINTS.UPDATE_FRANCHISE(id), data);
  },

  /**
   * PATCH /franchises/:id/status
   * Activates or deactivates a store (blocks manager login + new
   * assignments while inactive).
   */
  async setFranchiseStatus(
    id: string,
    status: "active" | "inactive",
  ): Promise<ApiResponse<Franchise>> {
    return patch<ApiResponse<Franchise>>(ENDPOINTS.SET_FRANCHISE_STATUS(id), {
      status,
    });
  },

  /**
   * DELETE /franchises/:id
   * Soft-delete — the backend marks the store inactive rather than
   * removing it, since past orders still reference it.
   */
  async deleteFranchise(id: string): Promise<ApiResponse<Franchise>> {
    return del<ApiResponse<Franchise>>(ENDPOINTS.DELETE_FRANCHISE(id));
  },

  /**
   * PUT /orders/:orderId/assign-franchise
   * Hands a pending order to a store — used for both the first
   * assignment and a reassignment after a rejection.
   */
  async assignOrderToFranchise(
    orderId: string,
    franchiseId: string,
  ): Promise<ApiResponse<AssignedOrder>> {
    return put<ApiResponse<AssignedOrder>>(
      ENDPOINTS.ASSIGN_ORDER_TO_FRANCHISE(orderId),
      { franchiseId },
    );
  },

  /**
   * GET /franchises/:id/products
   * Paginated/searchable view of a store's catalog — an alternative to
   * the full (unpaginated) `inventory` array embedded in getFranchise,
   * for stores with large catalogs.
   */
  async getFranchiseProducts(
    franchiseId: string,
    params?: {
      search?: string;
      isVisible?: boolean;
      page?: number;
      limit?: number;
    },
  ): Promise<FranchiseProductListResponse> {
    return get<FranchiseProductListResponse>(
      ENDPOINTS.GET_FRANCHISE_PRODUCTS(franchiseId),
      params,
    );
  },

  /**
   * POST /franchises/:id/products
   * Adds a product to a store's catalog with its own stock/mrp/
   * sellingPrice (never inherited from the global product record).
   */
  async addFranchiseProduct(
    franchiseId: string,
    data: AddFranchiseProductDto,
  ): Promise<ApiResponse<FranchiseInventoryItem>> {
    return post<ApiResponse<FranchiseInventoryItem>>(
      ENDPOINTS.ADD_FRANCHISE_PRODUCT(franchiseId),
      data,
    );
  },

  /**
   * PUT /franchises/:id/products/:productId
   * Edits a store's existing stock/mrp/sellingPrice/isVisible override
   * for a product already in its catalog.
   */
  async updateFranchiseProduct(
    franchiseId: string,
    productId: string,
    data: UpdateFranchiseProductDto,
  ): Promise<ApiResponse<FranchiseInventoryItem>> {
    return put<ApiResponse<FranchiseInventoryItem>>(
      ENDPOINTS.UPDATE_FRANCHISE_PRODUCT(franchiseId, productId),
      data,
    );
  },

  /**
   * DELETE /franchises/:id/products/:productId
   * Removes a product from a store's catalog entirely.
   */
  async removeFranchiseProduct(
    franchiseId: string,
    productId: string,
  ): Promise<ApiResponse<null>> {
    return del<ApiResponse<null>>(
      ENDPOINTS.REMOVE_FRANCHISE_PRODUCT(franchiseId, productId),
    );
  },
};
