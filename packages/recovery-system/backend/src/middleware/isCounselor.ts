import { Request, Response, NextFunction } from 'express';

export const isCounselor = (req: Request, res: Response, next: NextFunction) => {

    // Get user from request (set by isAuth middleware)
    const user = (req as any).user;

    // If no user, not logged in
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // If user role is not counselor, deny access
    if (user.role !== 'counselor') {
        return res.status(403).json({ error: 'Access denied. Counselor role required' });
    }

    // User is a counselor, allow to continue
    return next();
};