import mongoose, { Schema, Document } from 'mongoose';

export interface IJournal extends Document {
  user: mongoose.Types.ObjectId; // Links to Person A's User Model
  content: string;
  mood: string;
  triggers: string[]; 
  copingStrategies: string[];
  image?: string; // URL from Cloudinary (Optional)
  isPrivate: boolean;
  createdAt: Date;
}

const JournalSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  content: { type: String, required: true },
  mood: { type: String, required: true },
  triggers: [{ type: String }],
  copingStrategies: [{ type: String }],
  image: { type: String }, // Store the URL returned by your Upload Service
  isPrivate: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IJournal>('Journal', JournalSchema);