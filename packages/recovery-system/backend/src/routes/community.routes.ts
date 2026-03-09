import express from "express";
import { createPost, getFeed } from "../controllers/community.controller";
import { isAuth } from "../middleware/isAuth";

const router = express.Router();

// create post
router.post("/create", isAuth, createPost);

// get feed
router.get("/feed", isAuth, getFeed);

export default router;