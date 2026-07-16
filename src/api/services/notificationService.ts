import { del, get, put } from "../apiClient";
import { ENDPOINTS } from "../endpoints";

export type NotificationType =
  | "order_status"
  | "general"
  | "promotion"
  | "alert";

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  image?: string;
  type: NotificationType;
  orderId?: {
    _id: string;
    orderNumber: string;
    orderStatus: string;
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
   * Get user notifications with pagination
   * @param params - Pagination parameters (page, limit)
   * @returns Promise with notification list and pagination
   */
  async getNotifications(
    params?: PaginationParams
  ): Promise<NotificationListResponse> {
    return get<NotificationListResponse>(ENDPOINTS.GET_NOTIFICATIONS, params);
  },

  /**
   * Mark a notification as read
   * @param notificationId - ID of the notification to mark as read
   * @returns Promise with success response
   */
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    return put<NotificationResponse>(
      ENDPOINTS.MARK_NOTIFICATION_READ(notificationId),
      {}
    );
  },

  /**
   * Delete a notification
   * @param notificationId - ID of the notification to delete
   * @returns Promise with success response
   */
  async deleteNotification(
    notificationId: string
  ): Promise<NotificationResponse> {
    return del<NotificationResponse>(
      ENDPOINTS.DELETE_NOTIFICATION(notificationId)
    );
  },
};
