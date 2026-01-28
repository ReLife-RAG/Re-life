import mongoose, { Schema, Document } from 'mongoose';

// 2.2 Progress Tracking Schema Design
export interface IProgress extends Document {
  // User reference (foreign key)
  userId: mongoose.Types.ObjectId;
  
  // Streak counter field
  streak: number;
  
  // Last check-in date
  lastCheckIn: Date | null;
  
  // Mood log array structure
  moodLog: {
    date: Date;
    mood: 'great' | 'good' | 'okay' | 'struggling' | 'relapsed';
    notes?: string;
    energy?: number; // 1-10 scale
  }[];
  
  // Daily check-in boolean
  checkedInToday: boolean;
  
  // Milestone achievements array
  milestones: {
    name: string;
    targetDays: number;
    achieved: boolean;
    achievedDate?: Date;
    description?: string;
  }[];
  
  // Relapse incidents array
  relapseIncidents: {
    date: Date;
    trigger?: string;
    notes?: string;
    severity?: 'minor' | 'moderate' | 'severe';
    recoveryPlan?: string;
  }[];
  
  // Timestamps (auto-managed by Mongoose)
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema: Schema = new Schema({
  // Define user reference (foreign key)
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  
  // Define streak counter field
  streak: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  // Define last check-in date
  lastCheckIn: { 
    type: Date,
    default: null
  },
  
  // Define mood log array structure
  moodLog: [{
    date: { 
      type: Date, 
      required: true,
      default: Date.now
    },
    mood: { 
      type: String, 
      enum: ['great', 'good', 'okay', 'struggling', 'relapsed'],
      required: true
    },
    notes: { 
      type: String,
      maxlength: 500
    },
    energy: {
      type: Number,
      min: 1,
      max: 10
    }
  }],
  
  // Define daily check-in boolean
  checkedInToday: { 
    type: Boolean, 
    default: false 
  },
  
  // Define milestone achievements array
  milestones: [{
    name: { 
      type: String, 
      required: true 
    },
    targetDays: { 
      type: Number, 
      required: true,
      min: 1
    },
    achieved: { 
      type: Boolean, 
      default: false 
    },
    achievedDate: { 
      type: Date 
    },
    description: {
      type: String
    }
  }],
  
  // Define relapse incidents array
  relapseIncidents: [{
    date: { 
      type: Date, 
      required: true,
      default: Date.now
    },
    trigger: { 
      type: String,
      maxlength: 200
    },
    notes: { 
      type: String,
      maxlength: 1000
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe']
    },
    recoveryPlan: {
      type: String,
      maxlength: 500
    }
  }]
}, {
  // Define timestamps
  timestamps: true
});

// Indexes for performance (userId already has unique index, so only add lastCheckIn)
ProgressSchema.index({ lastCheckIn: -1 });

export default mongoose.model<IProgress>('Progress', ProgressSchema);