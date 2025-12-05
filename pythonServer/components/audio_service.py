"""
Audio Service Module
Handles TTS (Text-to-Speech), STT (Speech-to-Text), and multilingual support
"""

import os
import asyncio
import tempfile
import warnings
import edge_tts

warnings.filterwarnings("ignore")


class AudioService:
    """Service class for audio operations"""
    
    def __init__(self):
        """Initialize audio service"""
        self.whisper_model = None
        print("Audio Service initialized")
    
    @staticmethod
    def detect_language(text):
        """
        Detect language from text for appropriate TTS voice
        
        Args:
            text: Input text
            
        Returns:
            str: Language code (e.g., 'hi-IN', 'en-US')
        """
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
    
    @staticmethod
    def get_voice_for_language(language):
        """
        Get appropriate voice for language
        
        Args:
            language: Language code
            
        Returns:
            str: Voice name
        """
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
        
        return voices.get(language, "en-US-AriaNeural")
    
    async def generate_tts_audio(self, text, output_path, language=None):
        """
        Generate TTS audio in specified or detected language
        
        Args:
            text: Text to convert to speech
            output_path: Path to save audio file
            language: Optional language code
            
        Returns:
            tuple: (audio_path, detected_language)
        """
        if language is None:
            language = self.detect_language(text)
        
        voice = self.get_voice_for_language(language)
        
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
    
    def text_to_speech(self, text, output_path, language=None):
        """
        Synchronous wrapper for TTS generation
        
        Args:
            text: Text to convert
            output_path: Output file path
            language: Optional language code
            
        Returns:
            tuple: (audio_path, detected_language)
        """
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            self.generate_tts_audio(text, output_path, language)
        )
        loop.close()
        return result
    
    def load_whisper_model(self):
        """Load Whisper model for speech-to-text"""
        if self.whisper_model is not None:
            return self.whisper_model
        
        try:
            import whisper
            self.whisper_model = whisper.load_model("base")
            print("Whisper model loaded successfully")
            return self.whisper_model
        except ImportError:
            print("Whisper not installed. Install with: pip install openai-whisper")
            return None
    
    def speech_to_text(self, audio_path):
        """
        Convert speech to text using Whisper
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            dict: {text, detected_language}
        """
        if self.whisper_model is None:
            self.whisper_model = self.load_whisper_model()
            if self.whisper_model is None:
                raise Exception("Whisper model not available")
        
        try:
            result = self.whisper_model.transcribe(audio_path)
            return {
                "text": result["text"],
                "detected_language": result.get("language", "unknown")
            }
        except Exception as e:
            raise Exception(f"Error in speech-to-text: {str(e)}")
    
    @staticmethod
    def get_language_info(language_code):
        """
        Get detailed information about a language
        
        Args:
            language_code: Language code
            
        Returns:
            dict: Language information
        """
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
        
        return voices_info.get(language_code, voices_info["en-US"])