// Auth Types
export interface AuthSession {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string;
    role: 'user' | 'counselor' | 'admin';
    addictionTypes?: string[];
    recoveryStart?: Date;
    accountStatus?: 'active' | 'suspended' | 'pending';
    phone?: string;
    emergencyContact?: string;
    profile?: {
      age?: number;
      bio?: string;
    };
  };
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  addictionTypes?: string[];
  phone?: string;
  emergencyContact?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  image?: string;
  addictionTypes?: string[];
  recoveryStart?: Date;
  accountStatus?: 'active' | 'suspended' | 'pending';
  phone?: string;
  emergencyContact?: string;
  timezone?: string;
  profile?: {
    age?: number;
    bio?: string;
  };
  savedResources?: string[];
}
