import { Request, Response } from "express";
import CommunityPost from "../models/Community";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; name: string; email: string };
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// ─── HELPER FUNCTIONS ───
// ═══════════════════════════════════════════════════════════════════

// Generate random anonymous name
const generateAlias = () => {
  const adjectives = [
    "Quiet",
    "Calm",
    "Brave",
    "Wise",
    "Silent",
    "Gentle",
    "Strong",
    "Hopeful",
    "Bright",
    "Clear",
  ];
  const animals = [
    "Owl",
    "Fox",
    "Wolf",
    "Eagle",
    "Deer",
    "Hawk",
    "Bear",
    "Dove",
    "Phoenix",
    "Swan",
  ];
  const randomNum = Math.floor(Math.random() * 9000) + 1000; // 1000-9999

  return (
    adjectives[Math.floor(Math.random() * adjectives.length)] +
    "-" +
    animals[Math.floor(Math.random() * animals.length)] +
    "#" +
    randomNum
  );
};

// Format post response (hide authorId if anonymous)
const formatPostResponse = (post: any, userId?: string) => {
  const postObj = post.toObject ? post.toObject() : post;

  // Hide author details if anonymous
  if (postObj.isAnonymous) {
    delete postObj.authorId;
  }

  // Add helpful fields
  return {
    ...postObj,
    likeCount: postObj.likes.length,
    commentCount: postObj.comments.length,
    saveCount: postObj.savedBy.length,
    isLikedByUser: userId ? postObj.likes.includes(userId) : false,
    isSavedByUser: userId ? postObj.savedBy.includes(userId) : false,
    isAuthor: userId ? postObj.authorId === userId : false,
  };
};