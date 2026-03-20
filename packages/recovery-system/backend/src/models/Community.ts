import mongoose, { Schema, Document } from "mongoose";

// ─── Community Post Interface ───
export interface IComment {
  _id?: mongoose.Types.ObjectId;
  userId: string; // BetterAuth user ID (string)
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface ICommunityPost extends Document {
  // Content
  content: string;
  category: string;
  authorName: string;
  authorId: string; // BetterAuth user ID (string)
  isAnonymous: boolean;

  // Engagement
  likes: string[]; // Array of user IDs who liked (BetterAuth IDs)
  comments: IComment[]; // Array of comment objects
  savedBy: string[]; // Array of user IDs who saved (BetterAuth IDs)

  // Metadata
  isEdited: boolean;
  editedAt?: Date;
  contentBefore?: string; // Store original content if edited (for transparency)

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ─── Comment Schema (embedded) ───
const CommentSchema = new Schema({
  userId: {
    type: String, // BetterAuth user ID
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
});

// ─── Community Post Schema ───
const CommunitySchema = new Schema(
  {
    // Content
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Alcohol Recovery",
        "Substance Recovery",
        "Family Support",
        "Success Story",
        "CBT Wins",
        "General Support",
      ],
    },
    authorName: {
      type: String,
      required: true,
    },
    authorId: {
      type: String, // BetterAuth user ID
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },

    // Engagement
    likes: [
      {
        type: String, // BetterAuth user IDs
      },
    ],
    comments: [CommentSchema],
    savedBy: [
      {
        type: String, // BetterAuth user IDs
      },
    ],

    // Edit tracking
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    contentBefore: {
      type: String,
    },
  },
  {
    timestamps: true, // CRUCIAL for feed sorting (createdAt, updatedAt)
  }
);

// ─── Indexes for Performance ───
CommunitySchema.index({ createdAt: -1 }); // Sort by newest first
CommunitySchema.index({ authorId: 1 }); // Find posts by user
CommunitySchema.index({ category: 1 }); // Filter by category

export default mongoose.model<ICommunityPost>("CommunityPost", CommunitySchema);