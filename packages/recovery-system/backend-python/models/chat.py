from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatMessage(BaseModel):
    message: str
    userContext: Dict[str, Any]

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = []
    timestamp: datetime = datetime.now()

class ChatHistory(BaseModel):
    userId: str
    messages: List[Dict[str, Any]]