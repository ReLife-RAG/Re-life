from typing import List, Dict, Any
from datetime import datetime
from config.database import Database

class MemoryService:
    def __init__(self):
        self.db = Database.connect()
        self.collection = Database.get_collection("chat_history")

    def save_message(self, user_id: str, role: str, content: str, metadata: Dict[str, Any] = None):
        """Save a chat message to MongoDB"""
        message = {
            "userId": user_id,
            "role": role,  # 'user' or 'assistant'
            "content": content,
            "metadata": metadata or {},
            "timestamp": datetime.now()
        }

        self.collection.insert_one(message)

    def get_conversation_history(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve conversation history for a user"""
        messages = self.collection.find(
            {"userId": user_id}
        ).sort("timestamp", -1).limit(limit)

        history = []
        for msg in messages:
            history.append({
                "role": msg["role"],
                "content": msg["content"],
                "timestamp": msg["timestamp"],
                "metadata": msg.get("metadata", {})
            })

        return list(reversed(history))  # Return in chronological order

    def get_recent_context(self, user_id: str, num_messages: int = 10) -> str:
        """Get recent conversation history formatted as context"""
        history = self.get_conversation_history(user_id, limit=num_messages)

        context = "Recent Conversation History:\n"
        for msg in history:
            role = "User" if msg["role"] == "user" else "Assistant"
            context += f"{role}: {msg['content']}\n\n"

        return context

    def clear_history(self, user_id: str):
        """Clear chat history for a user"""
        self.collection.delete_many({"userId": user_id})

# Initialize global memory service
memory_service = MemoryService()