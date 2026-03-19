import express from "express";
import {
  createPost,
  getFeed,
  getMyPosts,
  getPostDetails,
  updatePost,
  deletePost,
  toggleLike,
  toggleSave,
  getSavedPosts,
  addComment,
  deleteComment,
} from "../controllers/community.controller";
import { isAuth } from "../middleware/isAuth";

const router = express.Router();

// ─── Public Routes (Require Auth) ───
router.get("/feed", isAuth, getFeed); // Get all posts with filter
router.get("/my-posts", isAuth, getMyPosts); // Get user's own posts
router.get("/saved-posts", isAuth, getSavedPosts); // Get user's saved posts
router.get("/:postId", isAuth, getPostDetails); // Get single post

// ─── Post Management (Require Auth) ───
router.post("/create", isAuth, createPost); // Create new post
router.put("/:postId", isAuth, updatePost); // Edit post (author only)
router.delete("/:postId", isAuth, deletePost); // Delete post (author only)

// ─── Engagement (Require Auth) ───
router.post("/:postId/like", isAuth, toggleLike); // Like/unlike
router.post("/:postId/save", isAuth, toggleSave); // Save/unsave

// ─── Comments (Require Auth) ───
router.post("/:postId/comment", isAuth, addComment); // Add comment
router.delete("/:postId/comment/:commentId", isAuth, deleteComment); // Delete comment

export default router;