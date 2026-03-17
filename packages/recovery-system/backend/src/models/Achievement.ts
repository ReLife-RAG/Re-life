import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  userId: string;
  achievementId: string;
  gameId: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    userId:        { type: String, required: true },
    achievementId: { type: String, required: true },
    gameId:        { type: String, required: true },
    title:         { type: String, required: true },
    description:   { type: String, required: true },
    icon:          { type: String, default: '🏆' },
    points:        { type: Number, default: 0 },
    unlockedAt:    { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);