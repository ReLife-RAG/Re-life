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

// ═══════════════════════════════════════════════════════════════════
// ─── POST ENDPOINTS ───
// ═══════════════════════════════════════════════════════════════════

/**
 * CREATE NEW POST
 * POST /api/community/create
 */
export const createPost = async (req: Request, res: Response) => {
  try {
    const { content, category, isAnonymous } = req.body;
    const user = req.user;

    // ─── Validation ───
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!content || !category) {
      return res
        .status(400)
        .json({ message: "Content and category are required" });
    }

    if (content.trim().length < 10) {
      return res.status(400).json({
        message: "Content must be at least 10 characters long",
      });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({
        message: "Content must not exceed 2000 characters",
      });
    }

    // ─── Create Post ───
    const authorName = isAnonymous ? generateAlias() : user.name;

    const post = await CommunityPost.create({
      content: content.trim(),
      category,
      isAnonymous,
      authorName,
      authorId: user.id,
      likes: [],
      comments: [],
      savedBy: [],
      isEdited: false,
    });

    // ─── Populate and return ───
    await post.populate("authorId", "name email");
    const formattedPost = formatPostResponse(post, user.id);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: formattedPost,
    });
  } catch (error) {
    console.error("Create post error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create post",
    });
  }
};

/**
 * GET FEED (All Posts)
 * GET /api/community/feed
 * Query params: ?category=Alcohol Recovery&limit=10&skip=0
 */
export const getFeed = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { category, limit = 10, skip = 0 } = req.query;

    // ─── Build query ───
    const query: any = {};
    if (category && category !== "All") {
      query.category = category;
    }

    // ─── Get posts ───
    const posts = await CommunityPost.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate("authorId", "name email")
      .select("-__v");

    // ─── Format response ───
    const formattedPosts = posts.map((post) =>
      formatPostResponse(post, user?.id)
    );

    // ─── Get total count ───
    const totalCount = await CommunityPost.countDocuments(query);

    res.status(200).json({
      success: true,
      posts: formattedPosts,
      total: totalCount,
      limit: Number(limit),
      skip: Number(skip),
      hasMore: Number(skip) + Number(limit) < totalCount,
    });
  } catch (error) {
    console.error("Get feed error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load feed",
    });
  }
};

/**
 * GET USER'S OWN POSTS
 * GET /api/community/my-posts
 */
export const getMyPosts = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const posts = await CommunityPost.find({ authorId: user.id })
      .sort({ createdAt: -1 })
      .populate("authorId", "name email")
      .select("-__v");

    const formattedPosts = posts.map((post) =>
      formatPostResponse(post, user.id)
    );

    res.status(200).json({
      success: true,
      posts: formattedPosts,
    });
  } catch (error) {
    console.error("Get my posts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load your posts",
    });
  }
};

/**
 * GET SINGLE POST DETAILS
 * GET /api/community/:postId
 */
export const getPostDetails = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const user = req.user;

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    const post = await CommunityPost.findById(postId)
      .populate("authorId", "name email")
      .select("-__v");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const formattedPost = formatPostResponse(post, user?.id);

    res.status(200).json({
      success: true,
      post: formattedPost,
    });
  } catch (error) {
    console.error("Get post details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load post",
    });
  }
};

/**
 * UPDATE/EDIT POST (only by author)
 * PUT /api/community/:postId
 */
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ─── Find Post ───
    const post = await CommunityPost.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ─── Check Authorization ───
    if (post.authorId !== user.id) {
      return res.status(403).json({
        message: "You can only edit your own posts",
      });
    }

    // ─── Validation ───
    if (!content || content.trim().length < 10) {
      return res.status(400).json({
        message: "Content must be at least 10 characters long",
      });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({
        message: "Content must not exceed 2000 characters",
      });
    }

    // ─── Update ───
    post.contentBefore = post.content; // Save original
    post.content = content.trim();
    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();
    await post.populate("authorId", "name email");

    const formattedPost = formatPostResponse(post, user.id);

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: formattedPost,
    });
  } catch (error) {
    console.error("Update post error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update post",
    });
  }
};

/**
 * DELETE POST (only by author)
 * DELETE /api/community/:postId
 */
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = await CommunityPost.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ─── Check Authorization ───
    if (post.authorId !== user.id) {
      return res.status(403).json({
        message: "You can only delete your own posts",
      });
    }

    await CommunityPost.findByIdAndDelete(postId);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete post",
    });
  }
};