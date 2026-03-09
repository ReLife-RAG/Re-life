import { Request, Response } from "express";
import CommunityPost from "../models/Community";

declare global {
  namespace Express {
    interface Request {
      user?: { name: string; _id: string };
    }
  }
}

// helper: random anonymous name
const generateAlias = () => {
  const adjectives = ["Quiet", "Calm", "Brave", "Wise"];
  const animals = ["Owl", "Fox", "Wolf", "Eagle"];

  return (
    adjectives[Math.floor(Math.random() * adjectives.length)] +
    "-" +
    animals[Math.floor(Math.random() * animals.length)]
  );
};

// CREATE POST
export const createPost = async (req: Request, res: Response) => {
  try {
    const { content, category, isAnonymous } = req.body;

    // user comes from isAuth middleware
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const authorName = isAnonymous
      ? generateAlias()
      : user.name;

    const post = await CommunityPost.create({
      content,
      category,
      isAnonymous,
      authorName,
      likes: [],
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to create post" });
  }
};

// GET FEED (newest first)
export const getFeed = async (req: Request, res: Response) => {
  try {
    const posts = await CommunityPost.find()
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to load feed" });
  }
};