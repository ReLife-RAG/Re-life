"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Plus,
  Heart,
  MessageCircle,
  Flag,
  MoreVertical,
  XCircle,
  ShieldCheck,
  Bookmark,
  Trash2,
  Edit2,
  AlertCircle,
  Loader,
} from "lucide-react";
import { communityService, ICommunityPost, IComment } from "@/lib/community-client";
import { useAuth } from "@/context/AuthContext";

// ─── TYPES ───
interface CreatePostData {
  content: string;
  category: string;
  isAnonymous: boolean;
}

interface CommentInputState {
  [postId: string]: string;
}

// ─── CONSTANTS ───
const CATEGORIES = [
  "All",
  "Alcohol Recovery",
  "Substance Recovery",
  "Family Support",
  "Success Story",
  "CBT Wins",
  "General Support",
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Success Story": { bg: "bg-[#EAF7ED]", text: "text-[#86D293]" },
  "Alcohol Recovery": { bg: "bg-[#FEF3E2]", text: "text-[#F59D0B]" },
  "Substance Recovery": { bg: "bg-[#FEE4E2]", text: "text-[#DC2626]" },
  "Family Support": { bg: "bg-[#EDE9FE]", text: "text-[#7C3AED]" },
  "CBT Wins": { bg: "bg-[#E0F2FE]", text: "text-[#0284C7]" },
  "General Support": { bg: "bg-slate-100", text: "text-slate-400" },
};

// ─── HELPER: Format Time ───
const formatTimeAgo = (date: string | Date) => {
  const now = new Date();
  const postDate = new Date(date);
  const diffMs = now.getTime() - postDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return postDate.toLocaleDateString();
};

// ─── HELPER: Get Category Color ───
const getCategoryColor = (category: string) => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS["General Support"];
};

// ─── COMPONENT: Create Post Modal ───
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePostData) => Promise<void>;
  isLoading: boolean;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Alcohol Recovery");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!content.trim()) {
      setError("Please write something");
      return;
    }

    if (content.trim().length < 10) {
      setError("Content must be at least 10 characters");
      return;
    }

    try {
      await onSubmit({
        content: content.trim(),
        category,
        isAnonymous,
      });

      // Reset form
      setContent("");
      setCategory("Alcohol Recovery");
      setIsAnonymous(true);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create post");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-slate-900">Share Your Story</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <XCircle size={24} className="text-slate-300" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Category Select */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none ring-1 ring-slate-100 focus:ring-[#86D293] text-sm text-slate-600 font-medium"
            >
              {CATEGORIES.slice(1).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Content Textarea */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">
              Your Message
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or advice. What's on your mind?"
              className="w-full h-40 p-6 bg-slate-50 rounded-[32px] border-none outline-none ring-1 ring-slate-100 focus:ring-[#86D293] text-sm resize-none text-slate-700"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-400 mt-2">
              {content.length}/2000 characters
            </p>
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
              disabled={isLoading}
            />
            <label
              htmlFor="anonymous"
              className="text-sm text-slate-600 cursor-pointer flex-1"
            >
              Post anonymously (your name won't be visible)
            </label>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-center gap-3 p-4 bg-[#F3F7F3] rounded-2xl">
            <ShieldCheck size={18} className="text-[#86D293] flex-shrink-0" />
            <p className="text-xs text-slate-500 font-medium">
              Your real identity is protected. Only a unique ID is shown to other
              members.
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-4 bg-[#86D293] text-white rounded-[24px] font-bold shadow-lg shadow-[#86D293]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader size={18} className="animate-spin" />}
            {isLoading ? "Posting..." : "Post to Feed"}
          </button>
        </div>
      </div>
    </div>
  );
};

