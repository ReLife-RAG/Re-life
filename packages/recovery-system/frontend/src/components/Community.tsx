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
