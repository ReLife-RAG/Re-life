/**
 * Chat Client - Routes to Python backend (RAG/LLM service)
 * Uses a separate endpoint from the main Node.js backend
 */
const CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || "http://localhost:8000";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  response: string;
  sources?: string[];
  timestamp?: string;
  conversationId?: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  importantDetails?: Array<{
    type: string;
    value: string;
    source: "user" | "assistant";
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const chatService = {
  async sendMessage(
    message: string,
    userId: string,
    history?: ChatHistoryItem[],
    conversationId?: string
  ): Promise<ChatResponse> {
    if (!userId) {
      throw new Error("User ID is required to send chat messages");
    }

    const response = await fetch(`${CHAT_API_URL}/api/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Send cookies for authentication
      body: JSON.stringify({
        message,
        userContext: {
          userId,
          history,
          conversationId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    return response.json();
  },

  async getChatHistory(userId: string): Promise<{ messages: ChatMessage[]; conversations?: ChatConversation[] }> {
    if (!userId) {
      return { messages: [] };
    }

    const response = await fetch(`${CHAT_API_URL}/api/chat/history/${encodeURIComponent(userId)}`, {
      credentials: "include", // Send cookies for authentication
    });

    if (!response.ok) {
      throw new Error("Failed to fetch chat history");
    }

    return response.json();
  },
};
