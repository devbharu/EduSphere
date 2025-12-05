import os
from dotenv import load_dotenv

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


# ---------- MAIN ----------
if __name__ == "__main__":
    pdf_path = input("Enter path to PDF file: ").strip('"')

    retriever = process_pdf(pdf_path)
    rag_chain = build_rag(retriever)

    print("\nPDF Chatbot Ready! Type 'exit' to quit.\n")

    while True:
        question = input("You: ")
        if question.lower() in ["exit", "quit"]:
            break

        answer = rag_chain.invoke(question)
        print("\nAssistant:", answer.content)
        print("-" * 50) 