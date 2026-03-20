import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import User from "../models/User";

export const isAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // First try to get BetterAuth session
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });

        if (session) {
            (req as any).user = session.user;
            (req as any).session = session.session;
            return next();
        }

        // If no BetterAuth session, try custom token format
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const token = authHeader.substring(7);
        
        try {
            // Decode base64 token
            const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
            
            // Verify user exists
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            (req as any).user = decoded;
            return next();
        } catch (tokenError) {
            return res.status(401).json({ error: "Unauthorized" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Auth Error" });
    }
};