import json
import hashlib
from pathlib import Path
from typing import List, Dict, Any
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI
from pinecone import Pinecone
from config.settings import settings

class RAGService:
    def __init__(self):
        # Initialize Pinecone
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index_name = settings.PINECONE_INDEX_NAME

        # Use a lightweight local embedding backend to avoid heavyweight torch installs in cloud builds.
        configured_model = settings.EMBEDDING_MODEL
        if configured_model == "sentence-transformers/all-MiniLM-L6-v2":
            configured_model = "BAAI/bge-small-en-v1.5"

        self.embeddings = FastEmbedEmbeddings(model_name=configured_model)

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

    def _load_pdf_documents(self, directory_path: str) -> List[Document]:
        if not Path(directory_path).exists():
            return []
        loader = PyPDFDirectoryLoader(directory_path)
        return loader.load()

    def _to_text(self, value: Any) -> str:
        if isinstance(value, str):
            return value
        if isinstance(value, (dict, list)):
            return json.dumps(value, ensure_ascii=False)
        return str(value)

    def _normalize_json_record(self, record: Any) -> str:
        if not isinstance(record, dict):
            return self._to_text(record)

        priority_fields = ["title", "question", "prompt", "category", "summary", "content", "answer"]
        lines: List[str] = []

        for field in priority_fields:
            if field in record and record[field] not in (None, "", []):
                lines.append(f"{field}: {self._to_text(record[field])}")

        for key, value in record.items():
            if key in priority_fields:
                continue
            if value in (None, "", []):
                continue
            lines.append(f"{key}: {self._to_text(value)}")

        return "\n".join(lines) if lines else self._to_text(record)

    def _load_json_documents(self, directory_path: str) -> List[Document]:
        docs: List[Document] = []
        json_dir = Path(directory_path)

        if not json_dir.exists():
            return docs

        for json_file in sorted(json_dir.glob("*.json")):
            try:
                with json_file.open("r", encoding="utf-8") as f:
                    data = json.load(f)
            except Exception:
                continue

            if isinstance(data, list):
                for i, item in enumerate(data):
                    docs.append(
                        Document(
                            page_content=self._normalize_json_record(item),
                            metadata={"source": json_file.name, "type": "json", "record": i},
                        )
                    )
            else:
                docs.append(
                    Document(
                        page_content=self._normalize_json_record(data),
                        metadata={"source": json_file.name, "type": "json"},
                    )
                )

        return docs

    def _build_stable_chunk_id(self, doc: Document, chunk_index: int) -> str:
        source = str(doc.metadata.get("source", "unknown"))
        doc_type = str(doc.metadata.get("type", "pdf"))
        page = str(doc.metadata.get("page", "na"))
        record = str(doc.metadata.get("record", "na"))
        fingerprint_input = f"{source}|{doc_type}|{page}|{record}|{doc.page_content}".encode("utf-8", errors="ignore")
        digest = hashlib.sha1(fingerprint_input).hexdigest()[:16]
        return f"{source}:{doc_type}:{chunk_index}:{digest}"

    def load_and_index_documents(self, pdf_directory_path: str = "./data/documents", json_directory_path: str = "./data/json"):
        """Load PDF and JSON documents and create embeddings in Pinecone."""
        pdf_documents = self._load_pdf_documents(pdf_directory_path)
        json_documents = self._load_json_documents(json_directory_path)
        documents = pdf_documents + json_documents

        if not documents:
            return 0

        # Split documents
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )
        splits = text_splitter.split_documents(documents)

        # Use deterministic IDs so re-running ingestion upserts instead of duplicating vectors.
        vector_ids = [self._build_stable_chunk_id(doc, i) for i, doc in enumerate(splits)]
        self.vector_store.add_documents(splits, ids=vector_ids)

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

        addiction_type = profile.get('addictionType', 'N/A')
        if addiction_type == 'N/A':
            addiction_types = profile.get('addictionTypes', [])
            if isinstance(addiction_types, list) and addiction_types:
                addiction_type = ', '.join([str(item) for item in addiction_types])

        sobriety_start = profile.get('sobrietyStartDate', profile.get('recoveryStart', 'N/A'))

        milestones = progress.get('milestonesAchieved', [])
        if not isinstance(milestones, list):
            milestones = []

        context_text = f"""
Name: {profile.get('name', 'N/A')}
Addiction Type: {addiction_type}
Sobriety Start Date: {sobriety_start}
Current Streak: {progress.get('currentStreak', 0)} days
Longest Streak: {progress.get('longestStreak', 0)} days
Total Days Sober: {progress.get('totalDaysSober', 0)} days
Milestones: {', '.join([str(item) for item in milestones])}

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