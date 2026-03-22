'use client';

import React, { useState, useEffect, useRef } from 'react';
import { notificationService, INotification } from '@/lib/notification-client';
import { useAuth } from '@/context/AuthContext';

export default function NotificationBar() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(10, 0);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count (lightweight for frequent polling)
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (isAuthenticated && open) {
      fetchNotifications();
    }
  }, [isAuthenticated, open]);

  // Poll for unread count every 10 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 10000);

    pollIntervalRef.current = interval;

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isAuthenticated]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleNotificationClick = async (notification: INotification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markNotificationAsRead(notification._id);
        setNotifications(
          notifications.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
  };

  const handleDeleteNotification = async (
    e: React.MouseEvent<HTMLButtonElement>,
    notificationId: string
  ) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter((n) => n._id !== notificationId));
      setUnreadCount(Math.max(0, unreadCount - 1)); // Assume deleted one was unread
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error deleting all notifications:', err);
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const getNotificationContent = (notification: INotification) => {
    if (notification.type === 'like') {
      return (
        <div>
          <p className="font-medium text-gray-900 text-sm">
            {notification.actorName} liked your post
          </p>
          {notification.postContent && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              "{notification.postContent.substring(0, 60)}..."
            </p>
          )}
        </div>
      );
    }

    if (notification.type === 'comment') {
      return (
        <div>
          <p className="font-medium text-gray-900 text-sm">
            {notification.actorName} commented on your post
          </p>
          {notification.commentContent && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              "{notification.commentContent.substring(0, 60)}..."
            </p>
          )}
        </div>
      );
    }

    return <p className="text-sm text-gray-700">Unknown notification</p>;
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative text-white/60 hover:text-white transition focus:outline-none"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#40738E] to-[#2D5A7B] px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-white/70 hover:text-white transition"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 flex justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-[#40738E] border-t-transparent rounded-full" />
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y">
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 cursor-pointer transition ${
                      notification.isRead
                        ? 'bg-gray-50 hover:bg-gray-100'
                        : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        {getNotificationContent(notification)}
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteNotification(e, notification._id)}
                        className="text-gray-400 hover:text-red-500 transition mt-1"
                        aria-label="Delete notification"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t px-4 py-2 flex justify-center">
              <button
                onClick={handleDeleteAll}
                className="text-xs text-red-500 hover:text-red-700 transition font-medium"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
