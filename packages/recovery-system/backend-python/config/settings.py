from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"

    # MongoDB
    MONGODB_URI: str

    # Pinecone
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str
    PINECONE_HOST: str = "https://relife-index-bhjhk7z.svc.aped-4627-b74a.pinecone.io"

    # Google Generative AI
    GOOGLE_API_KEY: str
    MODEL_NAME: str = "gemini-2.5-flash"

    # Embeddings
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    # Express Backend
    EXPRESS_BACKEND_URL: str = "http://localhost:5000"

    # RAG Configuration
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    TOP_K_RESULTS: int = 5

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5000"]

    class Config:
        env_file = ".env"

settings = Settings()