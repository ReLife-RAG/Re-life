import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node"; // Import the handler
import { auth } from "./lib/auth"; // Import your auth engine

const app: Application = express();

app.use(express.json()); 
app.use(cors());         
app.use(helmet());     

// ----------------------------------------------------
// THE FIX: Direct Connection
// This guarantees that http://localhost:5000/api/auth/... works
// ----------------------------------------------------
app.all("/api/auth/*", toNodeHandler(auth));

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Re-Life API is running...");
});

export default app;