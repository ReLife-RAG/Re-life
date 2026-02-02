import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { getAuth } from "./lib/auth";
import progressRoutes from "./routes/index";

const app: Application = express();

app.use(express.json()); 
app.use(cors());         
app.use(helmet());     

// Auth routes
app.all("/api/auth/*", (req, res) => toNodeHandler(getAuth())(req, res));

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Re-Life API is running...");
});

// Progress Tracking Routes
app.use('/api', progressRoutes);

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