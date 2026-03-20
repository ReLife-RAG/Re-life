import mongoose, { Schema, Document } from 'mongoose';

// Step 2: Reminder Model for alert times
export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  addictionType?: 'drugs' | 'social_media' | 'pornography';
  reminderTime: string; // Format: "HH:MM" (24-hour format)
  timezone: string; // e.g., "America/New_York"
  frequency: 'daily' | 'weekly' | 'custom' | 'hourly';
  customDays?: number[]; // 0-6 (Sunday-Saturday)
  message: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    index: true
  },
  addictionType: {
    type: String,
    enum: ['drugs', 'social_media', 'pornography'],
    index: true
  },
  reminderTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // Validates HH:MM format
    validate: {
      validator: function(v: string) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Reminder time must be in HH:MM format (24-hour)'
    }
  },
  timezone: {
    type: String,
    default: 'UTC',
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'custom', 'hourly'],
    default: 'daily',
    required: true
  },
  customDays: {
    type: [Number],
    validate: {
      validator: function(days: number[]) {
        if (!days || days.length === 0) return true;
        return days.every(day => day >= 0 && day <= 6);
      },
      message: 'Days must be between 0 (Sunday) and 6 (Saturday)'
    }
  },
  message: {
    type: String,
    required: true,
    default: 'Time for your daily check-in! 💚',
    maxlength: [500, 'Reminder message cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

ReminderSchema.index({ userId: 1, isActive: 1 });
ReminderSchema.index({ addictionType: 1, isActive: 1 });
ReminderSchema.index({ userId: 1, addictionType: 1 });

export default mongoose.model<IReminder>('Reminder', ReminderSchema);