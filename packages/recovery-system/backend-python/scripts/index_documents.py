"""Document indexing script for PDF and JSON data into Pinecone."""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.rag_service import rag_service

# Load environment variables
load_dotenv()

def main():
    pdf_dir = "./data/documents"
    json_dir = "./data/json"

    os.makedirs(pdf_dir, exist_ok=True)
    os.makedirs(json_dir, exist_ok=True)

    pdf_files = list(Path(pdf_dir).glob("*.pdf"))
    json_files = list(Path(json_dir).glob("*.json"))

    if not pdf_files and not json_files:
        print("❌ No source files found to index")
        print(f"   Add PDFs to: {os.path.abspath(pdf_dir)}")
        print(f"   Add JSON files to: {os.path.abspath(json_dir)}")
        return

    print(f"📚 Found {len(pdf_files)} PDF file(s) in {pdf_dir}:")
    for pdf in pdf_files:
        print(f"   - {pdf.name}")

    print(f"🧾 Found {len(json_files)} JSON file(s) in {json_dir}:")
    for jf in json_files:
        print(f"   - {jf.name}")

    print("\n⏳ Indexing documents into Pinecone...")
    try:
        num_chunks = rag_service.load_and_index_documents(pdf_dir, json_dir)
        print(f"✅ Successfully indexed {num_chunks} document chunks into Pinecone!")
        print(f"\n🎉 Your RAG system is now ready to use!")
    except Exception as e:
        print(f"❌ Error indexing documents: {str(e)}")
        print(f"\nMake sure:")
        print(f"  1. PINECONE_API_KEY is set in .env")
        print(f"  2. PINECONE_INDEX_NAME is correct in .env")
        print(f"  3. Your Pinecone index 'recovery-system-rag' is created")
        sys.exit(1)

if __name__ == "__main__":
    main()
