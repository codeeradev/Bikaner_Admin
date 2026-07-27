import { del, get, put } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export type NotificationType =
  | "new_order"
  | "bulk_order"
  | "seller_application"
  | "general"
  | "promotion"
  | "alert"
  | "order_status";

export interface Notification {
  id: string;
  recipientConstRoleId: number;
  title: string;
  message: string;
  image?: string;
  type: NotificationType;
  link?: string;
  orderId?: {
    id: string;
    orderNumber: string;
    orderStatus: string;
    orderType?: "normal" | "bulk";
    grandTotal?: number;
  };
  sellerApplicationId?: {
    id: string;
    name: string;
    mobile: string;
    status: string;
  };
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface NotificationResponse {
  success: boolean;
  message?: string;
  data?: Notification;
}

export const notificationService = {
  /**
   * Get admin notifications with pagination
   * @param params - Pagination parameters (page, limit)
   * @returns Promise with notification list and pagination
   */
  async getNotifications(
    params?: PaginationParams,
  ): Promise<NotificationListResponse> {
    return get<NotificationListResponse>(
      ENDPOINTS.GET_NOTIFICATIONS,
      params ? { ...params } : undefined,
    );
  },

  /**
   * Mark a notification as read
   * @param notificationId - ID of the notification to mark as read
   * @returns Promise with success response
   */
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    return put<NotificationResponse>(
      ENDPOINTS.MARK_NOTIFICATION_READ(notificationId),
      {},
    );
  },

  /**
   * Mark all admin notifications as read
   * @returns Promise with success response
   */
  async markAllAsRead(): Promise<NotificationResponse> {
    return put<NotificationResponse>(ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ, {});
  },

  /**
   * Delete a notification
   * @param notificationId - ID of the notification to delete
   * @returns Promise with success response
   */
  async deleteNotification(
    notificationId: string,
  ): Promise<NotificationResponse> {
    return del<NotificationResponse>(
      ENDPOINTS.DELETE_NOTIFICATION(notificationId),
    );
  },
};
