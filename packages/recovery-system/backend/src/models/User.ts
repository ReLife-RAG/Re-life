import mongoose, { Schema, Document } from 'mongoose';

// BetterAuth-compatible User Interface
// Combines betterAuth standard fields with custom recovery app fields
export interface IUser extends Document {
  // BetterAuth standard fields
  email: string;
  emailVerified: boolean; // Changed from isVerified to match betterAuth
  name: string;
  image?: string; // Added for betterAuth compatibility
  role: 'user' | 'counselor' | 'admin';
  
  // Custom recovery app fields
  addictionTypes: string[];
  recoveryStart?: Date;
  accountStatus: 'active' | 'suspended' | 'pending';
  phone?: string;
  emergencyContact?: string;
  profile?: {
    age?: number;
    bio?: string;
  };
  timezone?: string; // User's timezone for streak calculations (e.g., 'UTC', 'America/New_York')
  savedResources: string[];
  
  // Timestamps (auto-generated)
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  // BetterAuth standard fields (MUST match betterAuth schema)
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: false }, // Changed from isVerified
  name: { type: String, required: true },
  image: { type: String }, // Added for profile pictures
  role: { 
    type: String, 
    enum: ['user', 'counselor', 'admin'], 
    default: 'user' 
  },
  
  // Custom recovery app fields
  addictionTypes: [{ type: String }],
  recoveryStart: { type: Date },
  accountStatus: { 
    type: String, 
    enum: ['active', 'suspended', 'pending'], 
    default: 'active' 
  },
  phone: { type: String },
  emergencyContact: { type: String },
  profile: {
    age: { type: Number },
    bio: { type: String }
  },
  timezone: { type: String, default: 'UTC' }, // Default to UTC if not provided
  savedResources: [{ type: String }]
}, {
  timestamps: true 
});

// NOTE: Password field is NOT included here
// BetterAuth manages password hashing automatically

export default mongoose.model<IUser>('users', UserSchema);
