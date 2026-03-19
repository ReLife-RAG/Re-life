import { Request, Response } from 'express';
import User from '../models/User';
import { UpdateProfileData } from '../types';

// BetterAuth handles signup, signin, signout automatically via /api/auth/* endpoints
// This controller contains helper functions for custom operations

/**
 * Get current user profile (including custom fields)
 * @route GET /api/auth/me
 * Authenticated route - uses req.user from middleware
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    // User data already in req.user from isAuth middleware
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get full user document with all custom fields
    const fullUser = await User.findById(user.id).select('-password');
    if (!fullUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: fullUser });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get profile' });
  }
};

/**
 * Update user profile (custom fields only)
 * @route PUT /api/auth/profile
 * Authenticated route
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const updateData: UpdateProfileData = req.body;

    // Only update allowed fields
    const allowedFields = [
      'addictionTypes',
      'recoveryStart',
      'accountStatus',
      'phone',
      'emergencyContact',
      'timezone',
      'name',
      'image',
      'profile'
    ];

    const filtered: any = {};
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filtered[key] = updateData[key as keyof UpdateProfileData];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      filtered,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Get user's custom profile data
 * @route GET /api/auth/profile/details
 * Authenticated route
 */
export const getProfileDetails = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userProfile = await User.findById(user.id).select(
      'addictionTypes recoveryStart accountStatus phone emergencyContact profile createdAt'
    );

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    return res.json({ profile: userProfile });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get profile details' });
  }
};

/**
 * Custom sign-up endpoint for testing
 * @route POST /api/auth/register
 * Creates a new user with email/password
 */
export const signUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      role: role || 'user',
      emailVerified: false,
      accountStatus: 'active'
    });

    // Note: In production, use proper password hashing (bcrypt, argon2, etc.)
    // For now, storing plaintext (for testing only)
    (newUser as any).password = password;

    await newUser.save();

    // Generate a simple JWT token for testing
    const token = Buffer.from(JSON.stringify({
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    })).toString('base64');

    return res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      message: 'User registered successfully'
    });
  } catch (error: any) {
    console.error('Sign up error:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
};