"""
RAG Service Module
Handles PDF processing, embeddings, and question-answering
"""

import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough


class RAGService:
    """Service class for RAG operations"""
    
    def __init__(self, groq_api_key):
        """Initialize RAG service with API key"""
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY is required")
        
        self.groq_api_key = groq_api_key
        self.current_rag_chain = None
        
        # Initialize embeddings
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"}
        )
        
        print("RAG Service initialized")
    
    def process_pdf(self, pdf_path):
        """
        Load and process PDF file into chunks
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            retriever: FAISS retriever object
        """
        try:
            # Load PDF
            loader = PyPDFLoader(pdf_path)
            docs = loader.load()
            
            # Split into chunks
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=800,
                chunk_overlap=100
            )
            chunks = splitter.split_documents(docs)
            
            print(f"PDF split into {len(chunks)} chunks")
            
            # Create vector store
            store = FAISS.from_documents(chunks, self.embeddings)
            
            # Create retriever with improved settings
            retriever = store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 8}
            )
            
            return retriever
            
        except Exception as e:
            raise Exception(f"Error processing PDF: {str(e)}")
    
    def build_rag_chain(self, retriever):
        """
        Build RAG chain with retriever and LLM
        
        Args:
            retriever: FAISS retriever object
            
        Returns:
            rag_chain: Complete RAG chain
        """
        try:
            # Initialize LLM
            llm = ChatGroq(
                groq_api_key=self.groq_api_key,
                model="llama-3.3-70b-versatile"
            )
            
            # Create prompt template
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
            
            # Format retrieved documents
            def format_docs(docs):
                return "\n\n".join(doc.page_content for doc in docs)
            
            # Build RAG chain
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
            
            self.current_rag_chain = rag_chain
            print("RAG chain built successfully")
            
            return rag_chain
            
        except Exception as e:
            raise Exception(f"Error building RAG chain: {str(e)}")
    
    def upload_and_process(self, pdf_path):
        """
        Complete workflow: process PDF and build RAG chain
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            bool: Success status
        """
        try:
            retriever = self.process_pdf(pdf_path)
            self.build_rag_chain(retriever)
            return True
        except Exception as e:
            raise Exception(f"Error in upload and process: {str(e)}")
    
    def get_answer(self, question):
        """
        Get answer for a question using current RAG chain
        
        Args:
            question: User's question
            
        Returns:
            str: Answer from RAG chain
        """
        if self.current_rag_chain is None:
            raise Exception("No PDF uploaded yet. Please upload a PDF first.")
        
        if not question or not question.strip():
            raise Exception("Question cannot be empty")
        
        try:
            print(f"Processing question: {question}")
            answer = self.current_rag_chain.invoke(question)
            print(f"Answer generated: {answer.content[:100]}...")
            return answer.content
        except Exception as e:
            raise Exception(f"Error getting answer: {str(e)}")
    
    def is_ready(self):
        """Check if RAG chain is ready"""
        return self.current_rag_chain is not None