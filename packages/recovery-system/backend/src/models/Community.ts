import mongoose, { Schema, Document } from "mongoose";

export interface ICommunityPost extends Document {
  content: string;
  category: string;
  authorName: string;
  isAnonymous: boolean;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const CommunitySchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, // VERY important for feed sorting
  }
);

export default mongoose.model<ICommunityPost>(
  "CommunityPost",
  CommunitySchema
);
