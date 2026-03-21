import mongoose, { Document, Schema } from "mongoose";

export type ChatRole = "user" | "assistant";

export interface IChatMessage {
  role: ChatRole;
  content: string;
  timestamp: Date;
}

export interface IImportantDetail {
  type: "trigger" | "goal" | "coping" | "mood" | "event";
  value: string;
  source: ChatRole;
  createdAt: Date;
}

export interface IChatConversation extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IChatMessage[];
  importantDetails: IImportantDetail[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 6000,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false }
);

const ImportantDetailSchema = new Schema<IImportantDetail>(
  {
    type: {
      type: String,
      enum: ["trigger", "goal", "coping", "mood", "event"],
      required: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    source: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
      default: "user",
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false }
);

const ChatConversationSchema = new Schema<IChatConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: "New chat",
      maxlength: 120,
    },
    messages: {
      type: [ChatMessageSchema],
      default: [],
    },
    importantDetails: {
      type: [ImportantDetailSchema],
      default: [],
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

ChatConversationSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.model<IChatConversation>("ChatConversation", ChatConversationSchema);
