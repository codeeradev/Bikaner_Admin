import { get, put } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export type OrderType = "normal" | "bulk";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface ApiOrder {
  id: string;
  orderNumber?: string;
  userId?: {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    mobile?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    priceType: "selling" | "bulk";
    subtotal: number;
  }>;
  totalAmount: number;
  deliveryCharge: number;
  grandTotal: number;
  orderType: OrderType;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod?: "razorpay" | "cod";
  addressId?: {
    name?: string;
    mobile?: string;
    address?: string;
    city?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerMobile: string;
  productCount: number;
  quantity: number;
  amount: number;
  orderType: OrderType;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod?: string;
  date: string;
}

interface OrderListResponse {
  success: boolean;
  data: ApiOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface OrderResponse {
  success: boolean;
  message?: string;
  data: ApiOrder;
}

const toOrderListItem = (order: ApiOrder): OrderListItem => ({
  id: order.id,
  orderNumber: order.orderNumber || order.id,
  customerName:
    order.userId?.name || order.addressId?.name || "Unknown Customer",
  customerMobile: order.userId?.mobile || order.addressId?.mobile || "",
  productCount: order.items?.length || 0,
  quantity:
    order.items?.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0,
    ) || 0,
  amount: Number(order.grandTotal || order.totalAmount || 0),
  orderType: order.orderType,
  paymentStatus: order.paymentStatus,
  orderStatus: order.orderStatus,
  paymentMethod: order.paymentMethod,
  date: order.createdAt || order.updatedAt,
});

export const orderService = {
  async getOrders(params?: {
    page?: number;
    limit?: number;
    orderType?: OrderType;
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    search?: string;
  }): Promise<{ orders: OrderListItem[]; raw: ApiOrder[] }> {
    const response = await get<OrderListResponse>(ENDPOINTS.GET_ORDERS, params);
    return {
      orders: response.data.map(toOrderListItem),
      raw: response.data,
    };
  },

  async getNormalOrders(): Promise<OrderListItem[]> {
    const response = await get<OrderListResponse>(ENDPOINTS.GET_NORMAL_ORDERS, {
      limit: 100,
    });
    return response.data.map(toOrderListItem);
  },

  async getBulkOrders(): Promise<OrderListItem[]> {
    const response = await get<OrderListResponse>(ENDPOINTS.GET_BULK_ORDERS, {
      limit: 100,
    });
    return response.data.map(toOrderListItem);
  },

  async updateOrderStatus(
    id: string,
    orderStatus: OrderStatus,
  ): Promise<OrderResponse> {
    return put<OrderResponse>(ENDPOINTS.UPDATE_ORDER_STATUS(id), {
      orderStatus,
    });
  },

  async cancelOrder(id: string, cancelReason?: string): Promise<OrderResponse> {
    return put<OrderResponse>(ENDPOINTS.CANCEL_ORDER(id), { cancelReason });
  },
};
