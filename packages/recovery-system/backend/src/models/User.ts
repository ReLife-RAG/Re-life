import mongoose, { Schema, Document } from 'mongoose';


export interface IUser extends Document {
  email: string;
  password: string; 
  name: string;
  addictionTypes: string[];
  role: 'user' | 'counselor' | 'admin';
  profile: {
    age?: number;
    bio?: string;
  };
  timezone?: string; // IANA timezone (e.g., "America/New_York", "Asia/Kolkata")
  recoveryStart?: Date;
  accountStatus: 'active' | 'suspended' | 'pending';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

}


const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  addictionTypes: [{ type: String }],
  role: { 
    type: String, 
    enum: ['user', 'counselor', 'admin'], 
    default: 'user' 
  },
  profile: {
    age: { type: Number },
    bio: { type: String }
  },
  timezone: { 
    type: String, 
    default: 'UTC',
    validate: {
      validator: function(v: string) {
        try {
          Intl.DateTimeFormat(undefined, { timeZone: v });
          return true;
        } catch {
          return false;
        }
      },
      message: 'Invalid timezone format. Use IANA timezone (e.g., "America/New_York")'
    }
  },
  recoveryStart: { type: Date },
  accountStatus: { 
    type: String, 
    enum: ['active', 'suspended', 'pending'], 
    default: 'active' 
  },
  isVerified: { type: Boolean, default: false }
}, {
  timestamps: true 
});


export default mongoose.model<IUser>('User', UserSchema);
