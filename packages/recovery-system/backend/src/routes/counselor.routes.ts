import { Router } from "express";
import { createCounselorProfile } from "../controllers/Counselor.controller";
import { isAuth } from "../middleware/isAuth";
import { isCounselor } from "../middleware/isCounselor";

const router = Router();

router.post("/counselors", isAuth, isCounselor, createCounselorProfile);

export default router;
