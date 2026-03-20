import { Router } from "express";
import { createCounselorProfile, getCounselorProfile, getAllCounselors, getCounselorById } from "../controllers/Counselor.controller";
import { isAuth } from "../middleware/isAuth";
import { isCounselor } from "../middleware/isCounselor";

const router = Router();

// Public routes
router.get("/counselors", getAllCounselors);
router.get("/counselors/:id", getCounselorById);

// Protected routes
router.post("/counselors", isAuth, isCounselor, createCounselorProfile);
router.get("/counselors/me", isAuth, isCounselor, getCounselorProfile);

export default router;
