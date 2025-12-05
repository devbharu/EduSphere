"""
OCR Service Module
Handles image text extraction and question answering using OCR + LLM
"""

import os
import easyocr
import numpy as np
from PIL import Image
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate


class OCRService:
    """Service class for OCR and image-based question answering"""
    
    def __init__(self, groq_api_key):
        """
        Initialize OCR service with API key
        
        Args:
            groq_api_key: GROQ API key for LLM
        """
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY is required")
        
        self.groq_api_key = groq_api_key
        self.reader = None
        self.llm = None
        
        print("OCR Service initialized")
    
    def load_ocr_reader(self, languages=['en', 'hi']):
        """
        Load EasyOCR reader with specified languages
        
        Args:
            languages: List of language codes (e.g., ['en', 'hi', 'ta'])
            
        Returns:
            reader: EasyOCR Reader object
        """
        if self.reader is None:
            try:
                print(f"Loading OCR model for languages: {languages}")
                self.reader = easyocr.Reader(
                    languages,
                    gpu=False,  # Set to True if you have CUDA-enabled GPU
                    verbose=False
                )
                print("OCR model loaded successfully")
            except Exception as e:
                raise Exception(f"Error loading OCR model: {str(e)}")
        
        return self.reader
    
    def extract_text_from_image(self, image_path):
        """
        Extract text from image using OCR
        
        Args:
            image_path: Path to image file
            
        Returns:
            str: Extracted text from image
        """
        try:
            # Load OCR reader if not already loaded
            if self.reader is None:
                self.load_ocr_reader()
            
            # Read image
            image = Image.open(image_path)
            
            # Convert PIL image to numpy array
            image_np = np.array(image)
            
            print(f"Processing image: {os.path.basename(image_path)}")
            
            # Extract text using EasyOCR
            results = self.reader.readtext(image_np)
            
            # Combine all detected text
            extracted_text = ""
            for detection in results:
                text = detection[1]
                confidence = detection[2]
                
                # Only include text with confidence > 0.3
                if confidence > 0.3:
                    extracted_text += text + " "
            
            extracted_text = extracted_text.strip()
            
            if not extracted_text:
                raise Exception("No text could be extracted from the image")
            
            print(f"Extracted text: {extracted_text[:100]}...")
            print(f"Total characters extracted: {len(extracted_text)}")
            
            return extracted_text
            
        except Exception as e:
            raise Exception(f"Error extracting text from image: {str(e)}")
    
    def load_llm(self):
        """Load LLM for question answering"""
        if self.llm is None:
            try:
                self.llm = ChatGroq(
                    groq_api_key=self.groq_api_key,
                    model="llama-3.3-70b-versatile",
                    temperature=0.7
                )
                print("LLM loaded successfully")
            except Exception as e:
                raise Exception(f"Error loading LLM: {str(e)}")
        
        return self.llm
    
    def answer_question(self, extracted_text, user_question):
        """
        Answer user's question based on extracted text from image
        
        Args:
            extracted_text: Text extracted from image via OCR
            user_question: User's question about the image
            
        Returns:
            str: AI-generated answer
        """
        try:
            # Load LLM if not already loaded
            if self.llm is None:
                self.load_llm()
            
            # Create prompt template
            prompt = ChatPromptTemplate.from_template("""
            You are an intelligent AI assistant helping students understand questions from images.
            
            The following text was extracted from an image using OCR:
            
            --------------------
            Extracted Text:
            {extracted_text}
            --------------------
            
            Student's Question:
            {user_question}
            
            Instructions:
            1. If the extracted text contains a mathematical problem, solve it step-by-step
            2. If it's a conceptual question, provide a clear explanation
            3. If the OCR text seems incomplete or unclear, work with what's available and mention any assumptions
            4. Provide examples where helpful
            5. Break down complex problems into simple steps
            6. If the question cannot be answered from the extracted text, say so clearly
            
            Answer:
            """)
            
            # Create chain
            chain = prompt | self.llm
            
            print(f"Processing question: {user_question[:100]}...")
            
            # Get answer
            response = chain.invoke({
                "extracted_text": extracted_text,
                "user_question": user_question
            })
            
            answer = response.content
            
            print(f"Answer generated: {answer[:100]}...")
            
            return answer
            
        except Exception as e:
            raise Exception(f"Error answering question: {str(e)}")
    
    def process_image_and_question(self, image_path, user_question, languages=['en', 'hi']):
        """
        Complete workflow: Extract text from image and answer question
        
        Args:
            image_path: Path to image file
            user_question: User's question
            languages: OCR languages to use
            
        Returns:
            dict: {extracted_text, answer}
        """
        try:
            # Load OCR reader with specified languages
            self.load_ocr_reader(languages)
            
            # Extract text from image
            extracted_text = self.extract_text_from_image(image_path)
            
            # Answer the question
            answer = self.answer_question(extracted_text, user_question)
            
            return {
                "extracted_text": extracted_text,
                "answer": answer,
                "success": True
            }
            
        except Exception as e:
            raise Exception(f"Error in OCR processing: {str(e)}")
    
    def get_supported_languages(self):
        """
        Get list of commonly supported languages for OCR
        
        Returns:
            dict: Language codes and names
        """
        return {
            "en": "English",
            "hi": "Hindi",
            "ta": "Tamil",
            "te": "Telugu",
            "kn": "Kannada",
            "ml": "Malayalam",
            "gu": "Gujarati",
            "pa": "Punjabi",
            "bn": "Bengali",
            "mr": "Marathi",
            "or": "Oriya",
            "as": "Assamese",
            "ur": "Urdu",
            "sa": "Sanskrit",
            "es": "Spanish",
            "fr": "French",
            "de": "German",
            "ja": "Japanese",
            "ko": "Korean",
            "zh": "Chinese (Simplified)",
            "ar": "Arabic",
            "ru": "Russian",
            "pt": "Portuguese",
            "it": "Italian"
        }
    
    def cleanup(self):
        """Clean up resources"""
        self.reader = None
        self.llm = None
        print("OCR Service resources cleaned up")