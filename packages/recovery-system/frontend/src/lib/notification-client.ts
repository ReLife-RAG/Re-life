/**
 * Notifications API Client - Handles all notification operations
 * Uses relative URLs (proxied by Next.js) to avoid CORS issues
 */

const API_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

// ─── TYPES ───
export interface INotification {
  _id: string;
  userId: string;
  actorId: string;
  actorName: string;
  type: 'like' | 'comment';
  postId: string;
  postContent?: string;
  commentContent?: string;
  isRead: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: INotification[];
  total: number;
  unreadCount: number;
  limit: number;
  skip: number;
}

export interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
}

// ─── API CLIENT ───
export const notificationService = {
  /**
   * Fetch all notifications for current user
   * @param limit - Number of notifications to fetch (default: 20)
   * @param skip - Pagination offset (default: 0)
   */
  async getNotifications(limit: number = 20, skip: number = 0): Promise<NotificationsResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('skip', skip.toString());

    const response = await fetch(
      `${API_URL}/api/notifications?${params.toString()}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return response.json();
  },

  /**
   * Get unread notification count (lightweight for frequent polling)
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }

    return response.json();
  },

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean; notification: INotification }> {
    const response = await fetch(
      `${API_URL}/api/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return response.json();
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; unreadCount: number }> {
    const response = await fetch(`${API_URL}/api/notifications/read-all`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }

    return response.json();
  },

  /**
   * Delete a single notification
   */
  async deleteNotification(notificationId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }

    return response.json();
  },

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/api/notifications`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete all notifications');
    }

    return response.json();
  },
};
