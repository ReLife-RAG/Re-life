import { Router } from "express";
import { auth } from "../lib/auth"; 
import { toNodeHandler } from "better-auth/node";

const router = Router();


router.all("/auth/*", toNodeHandler(auth)); 

export default router;