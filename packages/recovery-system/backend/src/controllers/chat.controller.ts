import {Request, Response} from "express";
import axios from "axios";
import User from "../models/User";
import Journal from "../models/Journal";
import Progress from "../models/Progress";


const Python_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

export const chatController = {
    async sendMessage(req: Request, res: Response) {
        try{
            const userId = (req as any).user.id;

            const { message } = req.body;

            if (!message) {
                return res.status(400).json({ error: "Message is required" });  
            }

            const user = await User.findById(userId).select("-password");
            const journals = await Journal.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10);
            const progress = await Progress.findOne({ userId });

                  // Prepare user context
            const userContext = {
                userId: userId,
                profile: {
                name: user?.name,
                email: user?.email,
                age: user?.profile?.age,
                addictionType: user?.addictionTypes,
                sobrietyStartDate: user?.recoveryStart,
                // Add other relevant user fields
                },
                recentJournals: journals.map((j) => ({
                date: j.createdAt,
                mood: j.mood,
                // entry: j.entry,
                triggers: j.triggers,
                })),
                progress: {
                currentStreak: progress?.streak || 0,
                longestStreak: progress?.longestStreak || 0,
                // totalDaysSober: progress?.totalDaysSober || 0,
                // milestonesAchieved: progress?.milestonesAchieved || [],
                },
            };

             // Forward request to Python backend
            const response = await axios.post(
                `${Python_BACKEND_URL}/api/chat/message`,
                {
                message,
                userContext,
                },
            );

            return res.status(200).json(response.data);

            } catch (error) {
                console.error("Chat error:", error);
            return res.status(500).json(
                { error: "Failed to process chat message" }
            );
            }
        },

        async getChatHistory(req: Request, res: Response) {
            try {
            const userId = (req as any).user.id; // BetterAuth stores user in session

            // Forward request to Python backend
            const response = await axios.get(
                `${Python_BACKEND_URL}/api/chat/history/${userId}`,
            );

            return res.status(200).json(response.data);

            } catch (error) {
            console.error("Error fetching chat history:", error);
            return res.status(500).json(
                { error: "Failed to fetch chat history" }
            );
            }
        },
};



