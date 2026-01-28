import mongoose, { Schema, Document } from 'mongoose';

// Step 2: Reminder Model for alert times
export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  reminderTime: string; // Format: "HH:MM" (24-hour format)
  timezone: string; // e.g., "America/New_York"
  enabled: boolean;
  frequency: 'daily' | 'custom';
  customDays?: number[]; // 0-6 (Sunday-Saturday)
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reminderTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // Validates HH:MM format
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  enabled: {
    type: Boolean,
    default: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'custom'],
    default: 'daily'
  },
  customDays: {
    type: [Number],
    validate: {
      validator: function(days: number[]) {
        return days.every(day => day >= 0 && day <= 6);
      },
      message: 'Days must be between 0 (Sunday) and 6 (Saturday)'
    }
  },
  message: {
    type: String,
    default: 'Time for your daily check-in! 💚',
    maxlength: 200
  }
}, {
  timestamps: true
});

ReminderSchema.index({ userId: 1, enabled: 1 });

export default mongoose.model<IReminder>('Reminder', ReminderSchema);