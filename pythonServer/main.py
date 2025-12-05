"""
Main Flask Application
Handles API endpoints and routes requests to appropriate services
"""

import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import tempfile
import base64

# Import service modules from components package
from components import RAGService, AudioService


# Load environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("Please add GROQ_API_KEY to your .env file")


# ---------- Flask App Setup ----------
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Initialize services
rag_service = RAGService(GROQ_API_KEY)
audio_service = AudioService()


# ---------- Utility Functions ----------

def create_upload_folder():
    """Create uploads folder if it doesn't exist"""
    upload_folder = 'uploads'
    os.makedirs(upload_folder, exist_ok=True)
    return upload_folder


def create_audio_folder():
    """Create audio outputs folder if it doesn't exist"""
    audio_folder = 'audio_outputs'
    os.makedirs(audio_folder, exist_ok=True)
    return audio_folder


# ---------- API Endpoints ----------

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        "status": "running",
        "message": "EduSphere PDF Chatbot API is working!",
        "services": {
            "rag": "Ready",
            "audio": "Ready"
        },
        "endpoints": {
            "health": "GET /",
            "upload": "POST /upload",
            "retrieve": "POST /retrieve",
            "tts": "POST /tts",
            "stt": "POST /stt",
            "multilingual": "POST /multilingual",
            "audio": "GET /audio/<filename>"
        }
    }), 200


# ---------- RAG Endpoints ----------

@app.route('/upload', methods=['POST'])
def upload():
    """
    Upload and process a PDF file
    Expects: multipart/form-data with 'file' field
    Returns: Success message with filename
    """
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if not file.filename.endswith('.pdf'):
            return jsonify({"error": "Only PDF files are allowed"}), 400
        
        # Save uploaded file temporarily
        upload_folder = create_upload_folder()
        pdf_path = os.path.join(upload_folder, file.filename)
        file.save(pdf_path)
        
        print(f"Processing PDF: {file.filename}")
        
        # Process PDF using RAG service
        rag_service.upload_and_process(pdf_path)
        
        # Clean up uploaded file
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
    Returns: Answer from RAG chain
    """
    try:
        if not rag_service.is_ready():
            return jsonify({
                "error": "No PDF uploaded yet. Please upload a PDF first."
            }), 400
        
        data = request.get_json()
        
        if not data or 'question' not in data:
            return jsonify({"error": "No question provided"}), 400
        
        question = data['question']
        
        if not question.strip():
            return jsonify({"error": "Question cannot be empty"}), 400
        
        # Get answer from RAG service
        answer = rag_service.get_answer(question)
        
        return jsonify({
            "success": True,
            "question": question,
            "answer": answer
        }), 200
        
    except Exception as e:
        print(f"Error retrieving answer: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ---------- Audio Endpoints ----------

@app.route('/tts', methods=['POST'])
def text_to_speech():
    """
    Convert text to speech
    Expects: JSON with 'text' and optional 'language' and 'inline' (bool)
    Returns: Audio URL or base64 encoded audio
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400
        
        text = data['text']
        language = data.get('language', None)
        inline = bool(data.get('inline', False))
        
        if not text.strip():
            return jsonify({"error": "Text cannot be empty"}), 400
        
        print(f"TTS Request: {text[:50]}... (Language: {language or 'auto-detect'}, inline={inline})")
        
        # Generate audio using audio service
        audio_folder = create_audio_folder()
        audio_filename = f"tts_{os.urandom(8).hex()}.mp3"
        audio_path = os.path.join(audio_folder, audio_filename)
        
        audio_file, detected_lang = audio_service.text_to_speech(
            text, audio_path, language
        )
        
        print(f"TTS generated: {audio_filename} (Language: {detected_lang})")
        
        if inline:
            # Return base64 encoded audio
            with open(audio_path, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("utf-8")
            
            return jsonify({
                "success": True,
                "audio_base64": b64,
                "detected_language": detected_lang,
                "text": text,
                "audio_url": f"/audio/{audio_filename}"
            }), 200
        
        # Return audio URL
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
    Returns: Transcribed text and detected language
    """
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        
        if audio_file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Save audio temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
            audio_file.save(tmp_file.name)
            tmp_path = tmp_file.name
        
        print(f"Transcribing audio: {audio_file.filename}")
        
        # Transcribe using audio service
        result = audio_service.speech_to_text(tmp_path)
        
        # Clean up
        os.remove(tmp_path)
        
        print(f"Transcription: {result['text'][:100]}... (Language: {result['detected_language']})")
        
        return jsonify({
            "success": True,
            "text": result['text'],
            "detected_language": result['detected_language']
        }), 200
        
    except Exception as e:
        print(f"Error in STT: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/multilingual', methods=['POST'])
def multilingual_detect():
    """
    Detect language and return language info
    Expects: JSON with 'text' field
    Returns: Detected language and voice information
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400
        
        text = data['text']
        
        if not text.strip():
            return jsonify({"error": "Text cannot be empty"}), 400
        
        # Detect language using audio service
        detected_lang = audio_service.detect_language(text)
        language_info = audio_service.get_language_info(detected_lang)
        
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
    """
    Serve generated audio files
    Args: filename - Audio file name
    Returns: Audio file
    """
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


# ---------- Error Handlers ----------

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({"error": "Internal server error"}), 500


# ---------- MAIN ----------

if __name__ == "__main__":
    print("\n" + "="*70)
    print("🚀 Starting EduSphere PDF Chatbot API on http://localhost:8000")
    print("="*70)
    print("\n📚 RAG Endpoints:")
    print("  GET  /              - Health check")
    print("  POST /upload        - Upload and process PDF file")
    print("  POST /retrieve      - Ask questions about uploaded PDF")
    print("\n🎤 Audio Endpoints:")
    print("  POST /tts           - Text to Speech (560+ languages)")
    print("  POST /stt           - Speech to Text (Whisper)")
    print("  POST /multilingual  - Detect language from text")
    print("  GET  /audio/<file>  - Serve audio files")
    print("\n" + "="*70)
    print("✨ Services initialized:")
    print(f"  • RAG Service: {'✓' if rag_service else '✗'}")
    print(f"  • Audio Service: {'✓' if audio_service else '✗'}")
    print("="*70 + "\n")
    
    app.run(host='0.0.0.0', port=8000, debug=True)