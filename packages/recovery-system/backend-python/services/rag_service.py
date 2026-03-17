import os
from typing import List, Dict, Any
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI
from pinecone import Pinecone
from config.settings import settings

class RAGService:
    def __init__(self):
        # Initialize Pinecone
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index_name = settings.PINECONE_INDEX_NAME

        # Initialize embeddings
        self.embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL
        )

        # Initialize vector store
        self.vector_store = PineconeVectorStore(
            index_name=self.index_name,
            embedding=self.embeddings,
            pinecone_api_key=settings.PINECONE_API_KEY
        )

        # Initialize LLM
        self.llm = ChatGoogleGenerativeAI(
            model=settings.MODEL_NAME,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.7,
            convert_system_message_to_human=True
        )

    def load_and_index_documents(self, directory_path: str = "./data/documents"):
        """Load PDF documents and create embeddings in Pinecone"""
        # Load PDFs
        loader = PyPDFDirectoryLoader(directory_path)
        documents = loader.load()

        # Split documents
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )
        splits = text_splitter.split_documents(documents)

        # Add to vector store
        self.vector_store.add_documents(splits)

        return len(splits)

    def retrieve_context(self, query: str, k: int = None) -> List[Dict[str, Any]]:
        """Retrieve relevant documents from Pinecone"""
        k = k or settings.TOP_K_RESULTS
        results = self.vector_store.similarity_search_with_score(query, k=k)

        return [
            {
                "content": doc.page_content,
                "metadata": doc.metadata,
                "score": score
            }
            for doc, score in results
        ]

    def generate_response(self, query: str, context: str, user_context: Dict[str, Any]) -> str:
        """Generate response using LLM with retrieved context and user information"""

        # Build comprehensive prompt with user context
        user_info = self._format_user_context(user_context)

        prompt = f"""You are a compassionate and knowledgeable AI counselor for the Re-life Recovery System.
You help individuals on their recovery journey from addiction.

USER INFORMATION:
{user_info}

KNOWLEDGE BASE CONTEXT:
{context}

USER QUESTION: {query}

Please provide a helpful, empathetic, and personalized response considering:
1. The user's specific situation and recovery journey
2. Their current progress and challenges
3. Evidence-based recovery information from the knowledge base
4. Encouragement and support tailored to their stage of recovery

Keep your response conversational, supportive, and actionable. Remember all the user's information provided above throughout this conversation.
"""

        response = self.llm.invoke(prompt)
        return response.content

    def _format_user_context(self, user_context: Dict[str, Any]) -> str:
        """Format user context into readable text for the LLM"""
        profile = user_context.get('profile', {})
        progress = user_context.get('progress', {})
        journals = user_context.get('recentJournals', [])

        context_text = f"""
Name: {profile.get('name', 'N/A')}
Addiction Type: {profile.get('addictionType', 'N/A')}
Sobriety Start Date: {profile.get('sobrietyStartDate', 'N/A')}
Current Streak: {progress.get('currentStreak', 0)} days
Longest Streak: {progress.get('longestStreak', 0)} days
Total Days Sober: {progress.get('totalDaysSober', 0)} days
Milestones: {', '.join(progress.get('milestonesAchieved', []))}

Recent Journal Entries:
"""

        for i, journal in enumerate(journals[:5], 1):
            context_text += f"\n{i}. Date: {journal.get('date', 'N/A')} | Mood: {journal.get('mood', 'N/A')}"
            context_text += f"\n   Entry: {journal.get('entry', '')[:200]}..."
            if journal.get('triggers'):
                context_text += f"\n   Triggers: {', '.join(journal.get('triggers', []))}"

        return context_text

# Initialize global RAG service
rag_service = RAGService()