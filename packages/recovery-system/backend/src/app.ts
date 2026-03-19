import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import progressRoutes from "./routes/index";
import journalRoutes from "./routes/journal.routes";
import communityRoutes from "./routes/community.routes";
import counselorRoutes from "./routes/counselor.routes";
import { isAuth } from "./middleware/isAuth";
import { getProfile, updateProfile, getProfileDetails } from "./controllers/auth.controller";
import chatRoutes from "./routes/chat.routes";




const app: Application = express();

app.use(express.json());

// CORS Configuration
// TODO: In production, change 'origin' to specific domain (e.g., 'https://relife.com') 
// and use process.env.FRONTEND_URL instead of hardcoded localhost
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : true, // Development - allow all (for Postman testing), restricted in production
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());

// Custom auth routes (MUST be before BetterAuth catch-all)
app.get("/api/auth/me", isAuth, getProfile);
app.put("/api/auth/profile", isAuth, updateProfile);
app.get("/api/auth/profile/details", isAuth, getProfileDetails);


// Auth routes (BetterAuth catch-all)
app.all("/api/auth/*", (req, res) => toNodeHandler(auth)(req, res));

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Re-Life API is running...");
});

// Progress Tracking Routes
app.use('/api', progressRoutes);

// Journal Routes
app.use('/api', journalRoutes);

// Community Routes
app.use('/api/community', communityRoutes);

// Counselor Routes
app.use('/api', counselorRoutes);

// Chat Routes
app.use('/api/chat', chatRoutes);



// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});


export default app;