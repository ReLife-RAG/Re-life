import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";                          // ← ADD THIS
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import progressRoutes from "./routes/index";
import journalRoutes from "./routes/journal.routes";
import communityRoutes from "./routes/community.routes";
import counselorRoutes from "./routes/counselor.routes";
import bookingRoutes from "./routes/booking.routes";
import { isAuth } from "./middleware/isAuth";
import { getProfile, updateProfile, getProfileDetails, signUp } from "./controllers/auth.controller";
import chatRoutes from "./routes/chat.routes";
import gamesRoutes from "./routes/games.routes";
import resourceRoutes from "./routes/resource.routes";
import notificationRoutes from "./routes/notification.routes";

const app: Application = express();

app.use(express.json());

// ── Static file serving for local image uploads ──────────────────────────────
// Images uploaded when Cloudinary is NOT configured are saved to /uploads.
// This middleware serves them at http://localhost:5000/uploads/<filename>
// so the Next.js frontend (port 3000) can load them with an absolute URL.
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());

// ── Custom auth routes (MUST be before BetterAuth catch-all) ─────────────────
app.get("/api/auth/me", isAuth, getProfile);
app.put("/api/auth/profile", isAuth, updateProfile);
app.get("/api/auth/profile/details", isAuth, getProfileDetails);
app.post("/api/auth/register", signUp);

// ── Auth routes (BetterAuth catch-all) ───────────────────────────────────────
app.all("/api/auth/*", (req, res) => toNodeHandler(auth)(req, res));

app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("Re-Life API is running...");
});

// ── Progress Tracking Routes ──────────────────────────────────────────────────
app.use('/api', progressRoutes);

// ── Journal Routes ────────────────────────────────────────────────────────────
app.use('/api', journalRoutes);

// ── Community Routes ──────────────────────────────────────────────────────────
app.use('/api/community', communityRoutes);

// ── Counselor Routes ──────────────────────────────────────────────────────────
app.use('/api/counselor', counselorRoutes);

// ── Booking Routes ────────────────────────────────────────────────────────────
app.use('/api', bookingRoutes);

// ── Chat Routes ───────────────────────────────────────────────────────────────
app.use('/api/chat', chatRoutes);

// ── Games Routes ─────────────────────────────────────────────────────────────
app.use('/api/games', gamesRoutes);

// ── Resource Routes ───────────────────────────────────────────────────────────
app.use('/api/resources', resourceRoutes);

// ── Notification Routes ────────────────────────────────────────────────────────
app.use('/api/notifications', notificationRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

export default app;