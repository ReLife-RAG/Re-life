from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from models.chat import ChatMessage, ChatResponse
from services.rag_service import rag_service
from services.memory_service import memory_service

router = APIRouter()

@router.post("/message", response_model=ChatResponse)
async def send_message(chat_message: ChatMessage):
    """Process chat message with RAG and user context"""
    try:
        user_id = chat_message.userContext.get('userId')
        message = chat_message.message

        if not user_id or not message:
            raise HTTPException(status_code=400, detail="User ID and message are required")

        # Get recent conversation history for context continuity
        conversation_context = memory_service.get_recent_context(user_id, num_messages=10)

        # Retrieve relevant documents from Pinecone
        try:
            retrieved_docs = rag_service.retrieve_context(message)
            knowledge_context = "\n\n".join([doc["content"] for doc in retrieved_docs])
        except Exception as e:
            print(f"Warning: Failed to retrieve from Pinecone: {str(e)}")
            retrieved_docs = []
            knowledge_context = ""

        # Combine retrieved context
        full_context = conversation_context
        if knowledge_context:
            full_context = f"{conversation_context}\n\nKNOWLEDGE BASE:\n{knowledge_context}"

        # Generate response with LLM
        response = rag_service.generate_response(
            query=message,
            context=full_context,
            user_context=chat_message.userContext
        )

        # Save messages to memory
        memory_service.save_message(user_id, "user", message)
        memory_service.save_message(
            user_id,
            "assistant",
            response,
            metadata={"sources": [doc["metadata"] for doc in retrieved_docs]}
        )

        # Extract source documents
        sources = [doc.get("metadata", {}).get("source", "Unknown") for doc in retrieved_docs]

        return ChatResponse(
            response=response,
            sources=list(set(sources))  # Remove duplicates
        )

    except Exception as e:
        print(f"Error in chat message processing: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{user_id}")
async def get_chat_history(user_id: str):
    """Get chat history for a user"""
    try:
        history = memory_service.get_conversation_history(user_id)
        return {"userId": user_id, "messages": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/history/{user_id}")
async def clear_chat_history(user_id: str):
    """Clear chat history for a user"""
    try:
        memory_service.clear_history(user_id)
        return {"message": "Chat history cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/index-documents")
async def index_documents():
    """Index PDF documents into Pinecone (admin endpoint)"""
    try:
        num_docs = rag_service.load_and_index_documents()
        return {"message": f"Successfully indexed {num_docs} document chunks"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))