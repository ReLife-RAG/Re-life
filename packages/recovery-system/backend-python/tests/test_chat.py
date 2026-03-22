from datetime import datetime
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from models.chat import ChatHistory, ChatMessage, ChatResponse


def test_chat_message_model_parses_required_fields():
    payload = ChatMessage(
        message="Need support today",
        userContext={"userId": "user-1", "profile": {"name": "Test"}},
    )

    assert payload.message == "Need support today"
    assert payload.userContext["userId"] == "user-1"


def test_chat_response_defaults_sources_to_empty_list():
    response = ChatResponse(response="You are doing great")

    assert response.response == "You are doing great"
    assert isinstance(response.timestamp, datetime)
    assert response.sources == []


def test_chat_history_model_keeps_message_order():
    history = ChatHistory(
        userId="abc123",
        messages=[
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi there"},
        ],
    )

    assert history.userId == "abc123"
    assert history.messages[0]["role"] == "user"
    assert history.messages[1]["role"] == "assistant"
