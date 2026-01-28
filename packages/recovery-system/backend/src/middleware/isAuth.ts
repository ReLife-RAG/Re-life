import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export const isAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        });

        if (!session) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        (req as any).user = session.user;
        (req as any).session = session.session;
        
        return next();
    } catch (error) {
        return res.status(500).json({ error: "Auth Error" });
    }
};