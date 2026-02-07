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

    res.json({ user: fullUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
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

    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
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

    res.json({ profile: userProfile });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile details' });
  }
};
