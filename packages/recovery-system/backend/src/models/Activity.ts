import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  userId: string;   // betterAuth user id
  gameId: 'sober' | 'forest' | 'habitica' | 'braver';
  date: string;     // YYYY-MM-DD
  sessions: number;
  pointsEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    userId:       { type: String, required: true },
    gameId:       { type: String, required: true, enum: ['sober', 'forest', 'habitica', 'braver'] },
    date:         { type: String, required: true },
    sessions:     { type: Number, default: 1 },
    pointsEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One record per user per game per day
ActivitySchema.index({ userId: 1, gameId: 1, date: 1 }, { unique: true });

export default mongoose.model<IActivity>('Activity', ActivitySchema);