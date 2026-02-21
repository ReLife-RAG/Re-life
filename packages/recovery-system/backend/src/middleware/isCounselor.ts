import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export const isCounselor = async (req: Request, res: Response, next: NextFunction) => {

    // Get user from request (set by isAuth middleware)
    const user = (req as any).user;

    // If no user, not logged in
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch full user from database to get role
    const fullUser = await User.findById(user.id);

    if (!fullUser) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // If user role is not counselor, deny access
    if (fullUser.role !== 'counselor') {
        return res.status(403).json({ error: 'Access denied. Counselor role required' });
    }

    // User is a counselor, allow to continue
    return next();
};