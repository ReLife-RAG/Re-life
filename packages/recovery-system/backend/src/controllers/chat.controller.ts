import { Request, Response } from "express";
import axios from "axios";
import User from "../models/User";
import Journal from "../models/Journal";
import Progress from "../models/Progress";
import ChatConversation, { IImportantDetail } from "../models/ChatConversation";

const Python_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

const MAX_CONTEXT_MESSAGES = 12;
const MAX_IMPORTANT_DETAILS = 30;

const normalizeObjectId = (value: unknown): string => String(value || "").trim();

const autoTitle = (firstMessage: string): string => {
    const trimmed = firstMessage.trim();
    if (!trimmed) return "New chat";
    return trimmed.length > 60 ? `${trimmed.slice(0, 60)}...` : trimmed;
};

const extractImportantDetails = (text: string): IImportantDetail[] => {
    const details: IImportantDetail[] = [];
    const lowered = text.toLowerCase();

    const add = (type: IImportantDetail["type"], value: string) => {
        const cleaned = value.trim();
        if (!cleaned) return;
        details.push({
            type,
            value: cleaned.slice(0, 280),
            source: "user",
            createdAt: new Date(),
        });
    };

    const triggerPatterns = [
        /trigger(?:ed)? by\s+([^.!?\n]+)/i,
        /my trigger is\s+([^.!?\n]+)/i,
        /when i\s+([^.!?\n]+)\s+i (?:want|feel like)\s+to/i,
    ];

    const goalPatterns = [
        /my goal is to\s+([^.!?\n]+)/i,
        /i want to\s+([^.!?\n]+)/i,
        /i need to\s+([^.!?\n]+)/i,
    ];

    const copingPatterns = [
        /what helps is\s+([^.!?\n]+)/i,
        /coping strategy(?: is|:)\s+([^.!?\n]+)/i,
        /i usually\s+([^.!?\n]+)\s+to cope/i,
    ];

    const moodPatterns = [
        /i feel\s+([^.!?\n]+)/i,
        /i am feeling\s+([^.!?\n]+)/i,
        /today i feel\s+([^.!?\n]+)/i,
    ];

    for (const pattern of triggerPatterns) {
        const match = lowered.match(pattern);
        if (match?.[1]) add("trigger", match[1]);
    }

    for (const pattern of goalPatterns) {
        const match = lowered.match(pattern);
        if (match?.[1]) add("goal", match[1]);
    }

    for (const pattern of copingPatterns) {
        const match = lowered.match(pattern);
        if (match?.[1]) add("coping", match[1]);
    }

    for (const pattern of moodPatterns) {
        const match = lowered.match(pattern);
        if (match?.[1]) add("mood", match[1]);
    }

    if (details.length === 0 && text.trim().length > 20) {
        add("event", text.trim());
    }

    const unique = new Map<string, IImportantDetail>();
    for (const detail of details) {
        const key = `${detail.type}:${detail.value.toLowerCase()}`;
        if (!unique.has(key)) unique.set(key, detail);
    }

    return Array.from(unique.values());
};

const buildHistoryPayload = (messages: Array<{ role: string; content: string }>) => {
    return messages
        .slice(-MAX_CONTEXT_MESSAGES)
        .map((m) => ({ role: m.role, content: m.content }));
};

export const chatController = {
    async sendMessage(req: Request, res: Response) {
        try {
            const userId = normalizeObjectId((req as any).user?.id);
            const { message, conversationId } = req.body as {
                message?: string;
                conversationId?: string;
            };

            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!message || !message.trim()) {
                return res.status(400).json({ error: "Message is required" });
            }

            const cleanMessage = message.trim();

            const user = await User.findById(userId).select("-password");
            const journals = await Journal.find({ user: userId }).sort({ createdAt: -1 }).limit(8);
            const progress = await Progress.findOne({ userId });

            let conversation = null;
            if (conversationId) {
                conversation = await ChatConversation.findOne({ _id: conversationId, userId });
            }

            if (!conversation) {
                conversation = await ChatConversation.create({
                    userId,
                    title: autoTitle(cleanMessage),
                    messages: [],
                    importantDetails: [],
                    lastMessageAt: new Date(),
                });
            }

            const userMessage = {
                role: "user" as const,
                content: cleanMessage,
                timestamp: new Date(),
            };

            const extracted = extractImportantDetails(cleanMessage);
            const importantDetails = [...conversation.importantDetails, ...extracted].slice(-MAX_IMPORTANT_DETAILS);

            const conversationMessages = [...conversation.messages, userMessage];

            const userContext = {
                userId,
                profile: {
                    name: user?.name,
                    email: user?.email,
                    age: user?.profile?.age,
                    addictionType: user?.addictionTypes,
                    sobrietyStartDate: user?.recoveryStart,
                },
                recentJournals: journals.map((j) => ({
                    date: j.createdAt,
                    mood: j.mood,
                    triggers: j.triggers,
                    copingStrategies: j.copingStrategies,
                    summary: j.content?.slice(0, 240),
                })),
                progress: {
                    currentStreak: progress?.streak || 0,
                    longestStreak: progress?.longestStreak || 0,
                    lastCheckIn: progress?.lastCheckIn || null,
                    recentRelapseCount: progress?.relapseIncidents?.length || 0,
                },
                importantDetails: importantDetails.map((d) => ({
                    type: d.type,
                    value: d.value,
                    source: d.source,
                    createdAt: d.createdAt,
                })),
                recentConversation: buildHistoryPayload(conversationMessages),
            };

            const llmResponse = await axios.post(`${Python_BACKEND_URL}/api/chat/message`, {
                message: cleanMessage,
                userContext,
            });

            const assistantContent: string =
                llmResponse.data?.message || llmResponse.data?.content || llmResponse.data?.response ||
                "I received your message.";

            const assistantMessage = {
                role: "assistant" as const,
                content: assistantContent,
                timestamp: new Date(),
            };

            conversation.messages = [...conversationMessages, assistantMessage];
            conversation.importantDetails = importantDetails;
            conversation.lastMessageAt = new Date();
            conversation.updatedAt = new Date();
            await conversation.save();

            return res.status(200).json({
                response: assistantContent,
                sources: llmResponse.data?.sources || [],
                timestamp: assistantMessage.timestamp,
                conversationId: String(conversation._id),
            });
        } catch (error) {
            console.error("Chat error:", error);
            return res.status(500).json({ error: "Failed to process chat message" });
        }
    },

    async getChatHistory(req: Request, res: Response) {
        try {
            const userId = normalizeObjectId((req as any).user?.id);

            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const conversations = await ChatConversation.find({ userId })
                .sort({ updatedAt: -1 })
                .lean();

            const normalizedConversations = conversations.map((c) => ({
                id: String(c._id),
                title: c.title,
                messages: (c.messages || []).map((m) => ({
                    role: m.role,
                    content: m.content,
                    timestamp: m.timestamp,
                })),
                importantDetails: c.importantDetails || [],
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
            }));

            const flattenedMessages = normalizedConversations
                .flatMap((c) => c.messages)
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            return res.status(200).json({
                userId,
                messages: flattenedMessages,
                conversations: normalizedConversations,
            });
        } catch (error) {
            console.error("Error fetching chat history:", error);
            return res.status(500).json({ error: "Failed to fetch chat history" });
        }
    },
};



