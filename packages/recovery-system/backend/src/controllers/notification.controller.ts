import { Request, Response } from 'express';
import Notification from '../models/Notification';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; name: string; email: string };
    }
  }
}

// ─── HELPER: Create Notification ───
export const createNotification = async (
  userId: string,
  actorId: string,
  actorName: string,
  type: 'like' | 'comment',
  postId: string,
  postContent?: string,
  commentContent?: string
): Promise<void> => {
  try {
    // Don't create notification if user is notifying themselves
    if (userId === actorId) return;

    // For likes: Check if notification already exists (prevent duplicates)
    if (type === 'like') {
      const existing = await Notification.findOne({
        userId,
        type: 'like',
        postId,
        actorId,
      });

      if (existing && !existing.isRead) {
        // Notification already exists and unread, just update timestamp
        existing.updatedAt = new Date();
        await existing.save();
        return;
      }

      // If read or doesn't exist, delete old and create new
      if (existing && existing.isRead) {
        await Notification.deleteOne({ _id: existing._id });
      }
    }

    // Create notification
    await Notification.create({
      userId,
      actorId,
      actorName,
      type,
      postId,
      postContent: postContent?.substring(0, 100), // Store first 100 chars as preview
      commentContent: commentContent?.substring(0, 100),
      isRead: false,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    // Don't throw - this is a side effect and shouldn't break the main operation
  }
};

// ─── GET Notifications ───
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { limit = 20, skip = 0 } = req.query;

    // Get notifications sorted by newest first
    const notifications = await Notification.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate('postId', 'content category')
      .lean();

    // Get total count
    const total = await Notification.countDocuments({ userId: user.id });

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      userId: user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      notifications,
      total,
      unreadCount,
      limit: Number(limit),
      skip: Number(skip),
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
    });
  }
};

// ─── Mark Notification as Read ───
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
    });
  }
};

// ─── Mark All as Read ───
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await Notification.updateMany(
      { userId: user.id, isRead: false },
      { isRead: true }
    );

    const unreadCount = await Notification.countDocuments({
      userId: user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      unreadCount,
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
    });
  }
};

// ─── Delete Notification ───
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
    });
  }
};

// ─── Delete All Notifications ───
export const deleteAllNotifications = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await Notification.deleteMany({ userId: user.id });

    res.status(200).json({
      success: true,
      message: 'All notifications deleted',
    });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notifications',
    });
  }
};

// ─── Get Unread Count ───
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const unreadCount = await Notification.countDocuments({
      userId: user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
    });
  }
};
