import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'like' | 'comment';

export interface INotification extends Document {
  // Recipient
  userId: string; // BetterAuth user ID (who receives notification)

  // Actor
  actorId: string; // User who performed the action
  actorName: string;

  // Action details
  type: NotificationType; // 'like' | 'comment'
  postId: mongoose.Types.ObjectId;
  postContent?: string; // Preview of the post content
  commentContent?: string; // If type is 'comment'

  // Status
  isRead: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String, // BetterAuth user ID
      required: true,
      index: true,
    },
    actorId: {
      type: String,
      required: true,
    },
    actorName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'comment'],
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'CommunityPost',
      required: true,
    },
    postContent: String,
    commentContent: String,
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create compound index for efficient queries and uniqueness on likes (prevent duplicate like notifications)
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, postId: 1, actorId: 1 }, { sparse: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
