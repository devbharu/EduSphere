"""
YouTube Service Module
Handles YouTube video transcript extraction and summarization
Supports captions, auto-generated subtitles, and Whisper fallback
"""

import os
import subprocess
import tempfile
from typing import Optional, Dict
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable
from faster_whisper import WhisperModel
from groq import Groq


class YouTubeService:
    """Service for YouTube transcript extraction and summarization"""
    
    def __init__(self, groq_api_key: str):
        """
        Initialize YouTube Service
        
        Args:
            groq_api_key: Groq API key for AI summarization
        """
        self.groq_api_key = groq_api_key
        self.client = Groq(api_key=groq_api_key)
        self.whisper_model = None
        
        print("✓ YouTube Service initialized")
    
    def _load_whisper_model(self):
        """Lazy load Whisper model (only when needed)"""
        if self.whisper_model is None:
            print("Loading Whisper model (small)...")
            self.whisper_model = WhisperModel("small", device="cpu")
            print("✓ Whisper model loaded")
        return self.whisper_model
    
    def _extract_video_id(self, youtube_url: str) -> Optional[str]:
        """
        Extract video ID from YouTube URL
        
        Args:
            youtube_url: YouTube video URL
            
        Returns:
            Video ID or None if invalid URL
        """
        try:
            if "watch?v=" in youtube_url:
                video_id = youtube_url.split("watch?v=")[1].split("&")[0]
            elif "youtu.be/" in youtube_url:
                video_id = youtube_url.split("youtu.be/")[1].split("?")[0]
            else:
                return None
            return video_id.strip()
        except:
            return None
    
    def _get_official_transcript(self, video_id: str) -> Optional[str]:
        """
        Try to get official YouTube transcript
        
        Args:
            video_id: YouTube video ID
            
        Returns:
            Transcript text or None
        """
        try:
            print("Trying official transcript...")
            
            # Get list of available transcripts
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Try to find English transcript (manual or auto-generated)
            try:
                transcript = transcript_list.find_transcript(['en'])
                transcript_data = transcript.fetch()
                text = " ".join([t["text"] for t in transcript_data])
                print(f"✓ Official transcript found ({len(text)} characters)")
                return text
            except NoTranscriptFound:
                # Try auto-generated transcripts
                try:
                    transcript = transcript_list.find_generated_transcript(['en'])
                    transcript_data = transcript.fetch()
                    text = " ".join([t["text"] for t in transcript_data])
                    print(f"✓ Auto-generated transcript found ({len(text)} characters)")
                    return text
                except:
                    pass
            
            return None
            
        except TranscriptsDisabled:
            print("⚠ Transcripts are disabled for this video")
            return None
        except VideoUnavailable:
            print("⚠ Video is unavailable")
            return None
        except Exception as e:
            print(f"⚠ No official transcript: {str(e)}")
            return None
    
    def _check_ytdlp_installed(self) -> bool:
        """Check if yt-dlp is installed"""
        try:
            result = subprocess.run(
                ['yt-dlp', '--version'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            return result.returncode == 0
        except FileNotFoundError:
            return False
    
    def _get_subtitles_with_ytdlp(self, youtube_url: str) -> Optional[str]:
        """
        Download and parse subtitles using yt-dlp
        
        Args:
            youtube_url: YouTube video URL
            
        Returns:
            Transcript text or None
        """
        try:
            print("Trying to download subtitles...")
            
            if not self._check_ytdlp_installed():
                print("⚠ yt-dlp is not installed. Install it with: pip install yt-dlp")
                return None
            
            # Create temp directory for subtitles
            with tempfile.TemporaryDirectory() as temp_dir:
                output_path = os.path.join(temp_dir, "captions")
                
                cmd = [
                    "yt-dlp",
                    "--write-auto-sub",
                    "--write-sub",
                    "--sub-lang", "en",
                    "--convert-subs", "vtt",
                    "--skip-download",
                    "-o", output_path,
                    youtube_url
                ]
                
                result = subprocess.run(
                    cmd, 
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.PIPE, 
                    text=True
                )
                
                if result.returncode != 0:
                    print(f"⚠ yt-dlp failed: {result.stderr}")
                    return None
                
                # Find subtitle file
                subtitle_file = None
                for f in os.listdir(temp_dir):
                    if f.endswith(".vtt") or f.endswith(".en.vtt"):
                        subtitle_file = os.path.join(temp_dir, f)
                        break
                
                if not subtitle_file:
                    print("⚠ No subtitle files found")
                    return None
                
                print(f"✓ Subtitle file found: {os.path.basename(subtitle_file)}")
                
                # Parse VTT file
                with open(subtitle_file, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                
                clean_lines = []
                for line in lines:
                    line = line.strip()
                    # Skip timestamps, numbers, and metadata
                    if "-->" in line or line.isdigit() or not line or line.startswith("WEBVTT"):
                        continue
                    # Skip lines with HTML tags
                    if line.startswith("<") and line.endswith(">"):
                        continue
                    clean_lines.append(line)
                
                transcript = " ".join(clean_lines)
                print(f"✓ Transcript extracted from subtitles ({len(transcript)} characters)")
                return transcript
                
        except Exception as e:
            print(f"⚠ Subtitle extraction failed: {str(e)}")
            return None
    
    def _download_audio_and_transcribe(self, youtube_url: str) -> Optional[str]:
        """
        Download audio and transcribe using Whisper (fallback method)
        
        Args:
            youtube_url: YouTube video URL
            
        Returns:
            Transcript text or None
        """
        try:
            print("Downloading audio for Whisper transcription...")
            
            if not self._check_ytdlp_installed():
                print("⚠ yt-dlp is not installed. Install it with: pip install yt-dlp")
                return None
            
            # Create temp directory for audio
            with tempfile.TemporaryDirectory() as temp_dir:
                audio_path = os.path.join(temp_dir, "audio.mp3")
                
                cmd = [
                    "yt-dlp",
                    "-f", "bestaudio",
                    "--extract-audio",
                    "--audio-format", "mp3",
                    "-o", audio_path,
                    youtube_url
                ]
                
                result = subprocess.run(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                
                if result.returncode != 0:
                    print(f"⚠ Audio download failed: {result.stderr}")
                    return None
                
                if not os.path.exists(audio_path):
                    print("⚠ Audio file not found after download")
                    return None
                
                print(f"✓ Audio downloaded ({os.path.getsize(audio_path) / 1024 / 1024:.1f} MB)")
                
                # Transcribe with Whisper
                print("Transcribing with Whisper (this may take a while)...")
                model = self._load_whisper_model()
                segments, info = model.transcribe(audio_path)
                
                transcript = " ".join([segment.text for segment in segments])
                print(f"✓ Whisper transcription complete ({len(transcript)} characters)")
                return transcript
                
        except Exception as e:
            print(f"⚠ Whisper transcription failed: {str(e)}")
            return None
    
    def extract_transcript(self, youtube_url: str) -> Optional[str]:
        """
        Extract transcript from YouTube video using multiple methods
        
        Args:
            youtube_url: YouTube video URL
            
        Returns:
            Transcript text or None if all methods fail
        """
        print(f"\n{'='*60}")
        print(f"📺 Extracting transcript from: {youtube_url}")
        print(f"{'='*60}\n")
        
        # Validate URL and extract video ID
        video_id = self._extract_video_id(youtube_url)
        if not video_id:
            print("❌ Invalid YouTube URL")
            return None
        
        print(f"Video ID: {video_id}\n")
        
        # Method 1: Try official transcript (most reliable)
        transcript = self._get_official_transcript(video_id)
        if transcript:
            return transcript
        
        # Method 2: Try downloading subtitles with yt-dlp
        print("\n⚠ No official transcript, trying yt-dlp subtitles...")
        transcript = self._get_subtitles_with_ytdlp(youtube_url)
        if transcript:
            return transcript
        
        # Method 3: Fallback to Whisper (slowest but most reliable)
        print("\n⚠ No captions available, using Whisper fallback...")
        print("⚠ This will take several minutes for long videos...")
        transcript = self._download_audio_and_transcribe(youtube_url)
        if transcript:
            return transcript
        
        print("\n❌ All transcript extraction methods failed")
        return None
    
    def generate_summary(self, transcript: str, summary_type: str = "detailed") -> str:
        """
        Generate AI summary of transcript
        
        Args:
            transcript: Video transcript text
            summary_type: Type of summary ("bullet", "detailed", "brief")
            
        Returns:
            AI-generated summary
        """
        print(f"\n{'='*60}")
        print(f"📝 Generating {summary_type} summary...")
        print(f"Transcript length: {len(transcript)} characters")
        print(f"{'='*60}\n")
        
        # Limit transcript length to avoid token limits
        max_chars = 8000
        if len(transcript) > max_chars:
            print(f"⚠ Transcript too long ({len(transcript)} chars), truncating to {max_chars} chars")
            transcript = transcript[:max_chars] + "..."
        
        # Create prompt based on summary type
        if summary_type == "bullet":
            prompt = f"""Summarize the following video transcript in clear, concise bullet points. 
Focus on the main ideas and key takeaways:

{transcript}"""
        
        elif summary_type == "brief":
            prompt = f"""Provide a brief 2-3 paragraph summary of this video transcript, 
capturing the main message and key points:

{transcript}"""
        
        else:  # detailed
            prompt = f"""Provide a comprehensive summary of this video transcript. Include:
1. Main topic and purpose
2. Key points and arguments
3. Important details and examples
4. Conclusions or takeaways

Transcript:
{transcript}"""
        
        try:
            # Use Groq API for summarization
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at summarizing educational video content. Provide clear, well-structured summaries."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.3,
                max_tokens=1500
            )
            
            summary = chat_completion.choices[0].message.content
            print("✓ Summary generated successfully\n")
            return summary
            
        except Exception as e:
            print(f"❌ Summary generation failed: {str(e)}")
            return f"Error generating summary: {str(e)}"
    
    def process_youtube_video(
        self, 
        youtube_url: str, 
        summary_type: str = "detailed"
    ) -> Dict[str, any]:
        """
        Complete pipeline: Extract transcript and generate summary
        
        Args:
            youtube_url: YouTube video URL
            summary_type: Type of summary to generate
            
        Returns:
            Dictionary with transcript, summary, and metadata
        """
        result = {
            "success": False,
            "video_url": youtube_url,
            "transcript": None,
            "summary": None,
            "error": None,
            "video_id": None,
            "transcript_length": 0
        }
        
        # Extract video ID
        video_id = self._extract_video_id(youtube_url)
        if not video_id:
            result["error"] = "Invalid YouTube URL"
            return result
        
        result["video_id"] = video_id
        
        # Extract transcript
        transcript = self.extract_transcript(youtube_url)
        if not transcript:
            result["error"] = "Failed to extract transcript. Video may have no captions, be private, or be unavailable."
            return result
        
        result["transcript"] = transcript
        result["transcript_length"] = len(transcript)
        
        # Generate summary
        summary = self.generate_summary(transcript, summary_type)
        result["summary"] = summary
        result["success"] = True
        
        return result