/**
 * Community API Client - Handles all community feed operations
 * Uses relative URLs (proxied by Next.js) to avoid CORS issues
 */

const API_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

// ─── TYPES ───
export interface IComment {
  _id?: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: Date | string;
}

export interface ICommunityPost {
  _id: string;
  content: string;
  category: string;
  authorName: string;
  authorId?: string;
  isAnonymous: boolean;
  likes: string[];
  comments: IComment[];
  savedBy: string[];
  isEdited: boolean;
  editedAt?: Date | string;
  contentBefore?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  likeCount?: number;
  commentCount?: number;
  saveCount?: number;
  isLikedByUser?: boolean;
  isSavedByUser?: boolean;
  isAuthor?: boolean;
}

export interface FeedResponse {
  success: boolean;
  posts: ICommunityPost[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

// ─── API CLIENT ───
export const communityService = {
  // ─── GET ENDPOINTS ───

  /**
   * Fetch community feed
   * @param category - Filter by category (optional)
   * @param limit - Number of posts to fetch
   * @param skip - Pagination offset
   */
  async getFeed(
    category: string = 'All',
    limit: number = 10,
    skip: number = 0
  ): Promise<FeedResponse> {
    const params = new URLSearchParams();
    if (category !== 'All') params.append('category', category);
    params.append('limit', limit.toString());
    params.append('skip', skip.toString());

    const response = await fetch(
      `${API_URL}/api/community/feed?${params.toString()}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch feed');
    }

    return response.json();
  },

  /**
   * Get user's own posts
   */
  async getMyPosts(): Promise<{ success: boolean; posts: ICommunityPost[] }> {
    const response = await fetch(`${API_URL}/api/community/my-posts`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch your posts');
    }

    return response.json();
  },

  /**
   * Get user's saved posts
   */
  async getSavedPosts(): Promise<{
    success: boolean;
    posts: ICommunityPost[];
  }> {
    const response = await fetch(`${API_URL}/api/community/saved-posts`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch saved posts');
    }

    return response.json();
  },

  /**
   * Get single post details
   */
  async getPostDetails(
    postId: string
  ): Promise<{ success: boolean; post: ICommunityPost }> {
    const response = await fetch(`${API_URL}/api/community/${postId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }

    return response.json();
  },

  // ─── CREATE ENDPOINTS ───

  /**
   * Create new community post
   */
  async createPost(
    content: string,
    category: string,
    isAnonymous: boolean
  ): Promise<{ success: boolean; message: string; post: ICommunityPost }> {
    const response = await fetch(`${API_URL}/api/community/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        content,
        category,
        isAnonymous,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create post');
    }

    return response.json();
  },

  // ─── UPDATE ENDPOINTS ───

  /**
   * Edit existing post (author only)
   */
  async updatePost(
    postId: string,
    content: string
  ): Promise<{ success: boolean; message: string; post: ICommunityPost }> {
    const response = await fetch(`${API_URL}/api/community/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update post');
    }

    return response.json();
  },

  // ─── DELETE ENDPOINTS ───

  /**
   * Delete post (author only)
   */
  async deletePost(
    postId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/api/community/${postId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete post');
    }

    return response.json();
  },

  // ─── ENGAGEMENT ENDPOINTS ───

  /**
   * Like or unlike a post
   */
  async toggleLike(postId: string): Promise<{
    success: boolean;
    message: string;
    isLiked: boolean;
    post: ICommunityPost;
  }> {
    const response = await fetch(`${API_URL}/api/community/${postId}/like`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to toggle like');
    }

    return response.json();
  },

  /**
   * Save or unsave a post
   */
  async toggleSave(postId: string): Promise<{
    success: boolean;
    message: string;
    isSaved: boolean;
    post: ICommunityPost;
  }> {
    const response = await fetch(`${API_URL}/api/community/${postId}/save`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to toggle save');
    }

    return response.json();
  },

  // ─── COMMENT ENDPOINTS ───

  /**
   * Add comment to post
   */
  async addComment(
    postId: string,
    content: string
  ): Promise<{ success: boolean; message: string; post: ICommunityPost }> {
    const response = await fetch(`${API_URL}/api/community/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add comment');
    }

    return response.json();
  },

  /**
   * Delete comment from post (author only)
   */
  async deleteComment(
    postId: string,
    commentId: string
  ): Promise<{ success: boolean; message: string; post: ICommunityPost }> {
    const response = await fetch(
      `${API_URL}/api/community/${postId}/comment/${commentId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }

    return response.json();
  },
};