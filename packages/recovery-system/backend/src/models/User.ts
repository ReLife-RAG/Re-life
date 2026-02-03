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
