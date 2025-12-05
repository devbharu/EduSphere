import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import asyncio
import tempfile

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

# Additional imports for TTS/STT
import edge_tts
import warnings
warnings.filterwarnings("ignore")


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


# ---------- Language Detection for TTS ----------
def detect_language(text):
    """Detect language from text for appropriate TTS voice"""
    text_lower = text.lower()
    
    # Hindi/Indian languages
    if any(char in text for char in ["नमस्ते", "हिंदी", "भारत", "कृषि", "है", "का", "के"]):
        return "hi-IN"
    if any(char in text for char in ["தமிழ்", "வணக்கம்"]):
        return "ta-IN"
    if any(char in text for char in ["తెలుగు", "నమస్కారం"]):
        return "te-IN"
    if any(char in text for char in ["ગુજરાતી", "નમસ્તે"]):
        return "gu-IN"
    if any(char in text for char in ["বাংলা", "নমস্কার"]):
        return "bn-IN"
    if any(char in text for char in ["ਪੰਜਾਬੀ", "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ"]):
        return "pa-IN"
    
    # European languages
    if any(word in text_lower for word in ["bonjour", "français", "merci", "salut"]):
        return "fr-FR"
    if any(word in text_lower for word in ["hola", "español", "gracias", "buenos"]):
        return "es-ES"
    if any(word in text_lower for word in ["ciao", "italiano", "grazie", "buongiorno"]):
        return "it-IT"
    if any(word in text_lower for word in ["hallo", "deutsch", "danke", "guten"]):
        return "de-DE"
    if any(word in text_lower for word in ["olá", "português", "obrigado"]):
        return "pt-PT"
    
    # Asian languages
    if any(char in text for char in ["こんにちは", "日本語", "ありがとう"]):
        return "ja-JP"
    if any(char in text for char in ["你好", "中文", "谢谢"]):
        return "zh-CN"
    if any(char in text for char in ["안녕하세요", "한국어", "감사합니다"]):
        return "ko-KR"
    
    return "en-US"  # Default


# ---------- TTS Generation ----------
async def generate_tts_audio(text, output_path, language=None):
    """Generate TTS audio in specified or detected language"""
    if language is None:
        language = detect_language(text)
    
    # Language-specific voices (560+ languages supported)
    voices = {
        # Indian Languages
        "hi-IN": "hi-IN-SwapnilNeural",
        "ta-IN": "ta-IN-PallaviNeural",
        "te-IN": "te-IN-ShrutiNeural",
        "gu-IN": "gu-IN-DhwaniNeural",
        "bn-IN": "bn-IN-BashkarNeural",
        "pa-IN": "pa-IN-GurdasNeural",
        
        # European Languages
        "fr-FR": "fr-FR-DeniseNeural",
        "es-ES": "es-ES-ElviraNeural",
        "it-IT": "it-IT-ElsaNeural",
        "de-DE": "de-DE-KatjaNeural",
        "pt-PT": "pt-PT-RaquelNeural",
        
        # Asian Languages
        "ja-JP": "ja-JP-NanamiNeural",
        "zh-CN": "zh-CN-XiaoxiaoNeural",
        "ko-KR": "ko-KR-SunHiNeural",
        
        # Default
        "en-US": "en-US-AriaNeural"
    }
    
    voice = voices.get(language, "en-US-AriaNeural")
    
    try:
        tts = edge_tts.Communicate(text, voice=voice)
        await tts.save(output_path)
        return output_path, language
    except Exception as e:
        print(f"TTS error with {voice}, falling back to English: {e}")
        # Fallback to English
        tts = edge_tts.Communicate(text, voice="en-US-AriaNeural")
        await tts.save(output_path)
        return output_path, "en-US"


# ---------- STT using Whisper ----------
def load_whisper_model():
    """Load Whisper model for speech-to-text"""
    try:
        import whisper
        return whisper.load_model("base")  # Options: tiny, base, small, medium, large
    except ImportError:
        print("Whisper not installed. Install with: pip install openai-whisper")
        return None


# Global Whisper model
whisper_model = None


# ---------- API Endpoints (Original) ----------

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        "status": "running",
        "message": "PDF Chatbot API is working!",
        "endpoints": {
            "health": "GET /",
            "upload": "POST /upload",
            "retrieve": "POST /retrieve",
            "tts": "POST /tts",
            "stt": "POST /stt",
            "multilingual": "POST /multilingual"
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


# ---------- NEW API Endpoints (TTS/STT/Multilingual) ----------

@app.route('/tts', methods=['POST'])
def text_to_speech():
    """
    Convert text to speech
    Expects: JSON with 'text' and optional 'language' and optional 'inline' (bool).
    If inline == true -> returns base64 encoded audio in response (audio_base64)
    Otherwise -> returns audio_url pointing to /audio/<file>
    """
    try:
        data = request.get_json()

        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400

        text = data['text']
        language = data.get('language', None)  # Optional: specify language
        inline = bool(data.get('inline', False))

        if not text.strip():
            return jsonify({"error": "Text cannot be empty"}), 400

        print(f"TTS Request: {text[:50]}... (Language: {language or 'auto-detect'}, inline={inline})")

        # Generate audio
        audio_folder = 'audio_outputs'
        os.makedirs(audio_folder, exist_ok=True)

        audio_filename = f"tts_{os.urandom(8).hex()}.mp3"
        audio_path = os.path.join(audio_folder, audio_filename)

        # Generate TTS
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        audio_file, detected_lang = loop.run_until_complete(
            generate_tts_audio(text, audio_path, language)
        )
        loop.close()

        print(f"TTS generated: {audio_filename} (Language: {detected_lang})")

        if inline:
            # return base64 audio inline so frontend can play immediately
            import base64
            with open(audio_path, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("utf-8")
            return jsonify({
                "success": True,
                "audio_base64": b64,
                "detected_language": detected_lang,
                "text": text,
                "audio_url": f"/audio/{audio_filename}"
            }), 200

        # default: return audio_url (file kept on disk)
        return jsonify({
            "success": True,
            "audio_url": f"/audio/{audio_filename}",
            "detected_language": detected_lang,
            "text": text
        }), 200

    except Exception as e:
        print(f"Error in TTS: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/stt', methods=['POST'])
def speech_to_text():
    """
    Convert speech to text using Whisper
    Expects: multipart/form-data with 'audio' field
    Returns: Transcribed text
    """
    global whisper_model
    
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Load Whisper model if not loaded
        if whisper_model is None:
            print("Loading Whisper model...")
            whisper_model = load_whisper_model()
            if whisper_model is None:
                return jsonify({"error": "Whisper model not available"}), 500
        
        # Save audio temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
            audio_file.save(tmp_file.name)
            tmp_path = tmp_file.name
        
        print(f"Transcribing audio: {audio_file.filename}")
        
        # Transcribe
        result = whisper_model.transcribe(tmp_path)
        transcribed_text = result["text"]
        detected_language = result.get("language", "unknown")
        
        # Clean up
        os.remove(tmp_path)
        
        print(f"Transcription: {transcribed_text[:100]}... (Language: {detected_language})")
        
        return jsonify({
            "success": True,
            "text": transcribed_text,
            "detected_language": detected_language
        }), 200
        
    except Exception as e:
        print(f"Error in STT: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/multilingual', methods=['POST'])
def multilingual_detect():
    """
    Detect language and return language info
    Expects: JSON with 'text' field
    Returns: Detected language and available voices
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400
        
        text = data['text']
        
        if not text.strip():
            return jsonify({"error": "Text cannot be empty"}), 400
        
        detected_lang = detect_language(text)
        
        # Available voices info
        voices_info = {
            "hi-IN": {"name": "Hindi", "voice": "SwapnilNeural"},
            "ta-IN": {"name": "Tamil", "voice": "PallaviNeural"},
            "te-IN": {"name": "Telugu", "voice": "ShrutiNeural"},
            "gu-IN": {"name": "Gujarati", "voice": "DhwaniNeural"},
            "bn-IN": {"name": "Bengali", "voice": "BashkarNeural"},
            "pa-IN": {"name": "Punjabi", "voice": "GurdasNeural"},
            "fr-FR": {"name": "French", "voice": "DeniseNeural"},
            "es-ES": {"name": "Spanish", "voice": "ElviraNeural"},
            "it-IT": {"name": "Italian", "voice": "ElsaNeural"},
            "de-DE": {"name": "German", "voice": "KatjaNeural"},
            "pt-PT": {"name": "Portuguese", "voice": "RaquelNeural"},
            "ja-JP": {"name": "Japanese", "voice": "NanamiNeural"},
            "zh-CN": {"name": "Chinese", "voice": "XiaoxiaoNeural"},
            "ko-KR": {"name": "Korean", "voice": "SunHiNeural"},
            "en-US": {"name": "English", "voice": "AriaNeural"},
        }
        
        language_info = voices_info.get(detected_lang, voices_info["en-US"])
        
        return jsonify({
            "success": True,
            "detected_language": detected_lang,
            "language_name": language_info["name"],
            "voice": language_info["voice"],
            "text": text
        }), 200
        
    except Exception as e:
        print(f"Error in multilingual detection: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/audio/<filename>', methods=['GET'])
def serve_audio(filename):
    """Serve generated audio files"""
    try:
        audio_path = os.path.join('audio_outputs', filename)
        
        if not os.path.exists(audio_path):
            return jsonify({"error": "Audio file not found"}), 404
        
        return send_file(
            audio_path,
            mimetype='audio/mpeg',
            as_attachment=False,
            download_name=filename
        )
    except Exception as e:
        print(f"Error serving audio: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ---------- MAIN ----------
if __name__ == "__main__":
    print("\n" + "="*60)
    print("Starting PDF Chatbot API on http://localhost:8000")
    print("="*60)
    print("\n📚 Available endpoints:")
    print("  GET  /              - Health check")
    print("  POST /upload        - Upload and process PDF file")
    print("  POST /retrieve      - Ask questions about uploaded PDF")
    print("\n🎤 Audio Features:")
    print("  POST /tts           - Text to Speech (560+ languages)")
    print("  POST /stt           - Speech to Text (Whisper)")
    print("  POST /multilingual  - Detect language from text")
    print("  GET  /audio/<file>  - Serve audio files")
    print("\n" + "="*60 + "\n")
    
    app.run(host='0.0.0.0', port=8000, debug=True)