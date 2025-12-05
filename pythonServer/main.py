import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough


# Load env variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("Please add GROQ_API_KEY to your .env file")


# ---------- Flask App Setup ----------
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Global variables to store the RAG chain
current_rag_chain = None


# ---------- Embeddings ----------
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"}
)


# ---------- Load + Chunk PDF ----------
def process_pdf(pdf_path):
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    chunks = splitter.split_documents(docs)

    print(f"PDF split into {len(chunks)} chunks")

    store = FAISS.from_documents(chunks, embeddings)

    # Improved retriever → better context → fewer "I don't know"
    retriever = store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 8}
    )

    return retriever


# ---------- Build RAG Chain ----------
def build_rag(retriever):
    llm = ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model="llama-3.3-70b-versatile"
    )

    # Better prompt → fewer "I don't know"
    prompt = ChatPromptTemplate.from_template("""
    You are a PDF question-answering assistant.

    Use ONLY the provided context to answer.
    If the answer is not present in the context, say:
    "The answer is not available in the document."

    --------------------
    Context:
    {context}
    --------------------

    Question:
    {question}

    Answer:
    """)

    # Format retrieved documents into a single string
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    # NEW LangChain 1.x Runnable RAG pipeline
    rag_chain = (
        RunnableParallel(
            {
                "context": retriever | format_docs,
                "question": RunnablePassthrough(),
            }
        )
        | prompt
        | llm
    )

    return rag_chain


# ---------- API Endpoints ----------

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        "status": "running",
        "message": "PDF Chatbot API is working!",
        "endpoints": {
            "health": "GET /",
            "upload": "POST /upload",
            "retrieve": "POST /retrieve"
        }
    }), 200


@app.route('/upload', methods=['POST'])
def upload():
    """
    Upload and process a PDF file
    Expects: multipart/form-data with 'file' field
    """
    global current_rag_chain
    
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not file.filename.endswith('.pdf'):
            return jsonify({"error": "Only PDF files are allowed"}), 400
        
        # Save the uploaded file temporarily
        upload_folder = 'uploads'
        os.makedirs(upload_folder, exist_ok=True)
        pdf_path = os.path.join(upload_folder, file.filename)
        file.save(pdf_path)
        
        print(f"Processing PDF: {file.filename}")
        
        # Process the PDF
        retriever = process_pdf(pdf_path)
        current_rag_chain = build_rag(retriever)
        
        # Clean up the uploaded file
        os.remove(pdf_path)
        
        print(f"PDF processed successfully: {file.filename}")
        
        return jsonify({
            "success": True,
            "message": "PDF uploaded and processed successfully",
            "filename": file.filename
        }), 200
        
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/retrieve', methods=['POST'])
def retrieve():
    """
    Retrieve answer based on uploaded PDF
    Expects: JSON with 'question' field
    """
    global current_rag_chain
    
    try:
        if current_rag_chain is None:
            return jsonify({
                "error": "No PDF uploaded yet. Please upload a PDF first."
            }), 400
        
        data = request.get_json()
        
        if not data or 'question' not in data:
            return jsonify({"error": "No question provided"}), 400
        
        question = data['question']
        
        if not question.strip():
            return jsonify({"error": "Question cannot be empty"}), 400
        
        print(f"Question: {question}")
        
        # Get answer from RAG chain
        answer = current_rag_chain.invoke(question)
        
        print(f"Answer: {answer.content}")
        
        return jsonify({
            "success": True,
            "question": question,
            "answer": answer.content
        }), 200
        
    except Exception as e:
        print(f"Error retrieving answer: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ---------- MAIN ----------
if __name__ == "__main__":
    print("\n" + "="*60)
    print("Starting PDF Chatbot API on http://localhost:8000")
    print("="*60)
    print("\nAvailable endpoints:")
    print("  GET  /         - Health check")
    print("  POST /upload   - Upload and process PDF file")
    print("  POST /retrieve - Ask questions about uploaded PDF")
    print("\n" + "="*60 + "\n")
    
    app.run(host='0.0.0.0', port=8000, debug=True)