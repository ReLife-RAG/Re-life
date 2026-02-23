import { Router } from "express";
import { createCounselorProfile } from "../controllers/counselor.controller";
import { isAuth } from "../middleware/isAuth";
import { isCounselor } from "../middleware/isCounselor";

const router = Router();

router.post("/counselors", isAuth, isCounselor, createCounselorProfile);

export default router;
