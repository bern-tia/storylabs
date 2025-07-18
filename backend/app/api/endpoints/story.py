from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
import google.generativeai as genai
import os
from datetime import datetime
import uuid
from dotenv import load_dotenv
import io
from fastapi.responses import StreamingResponse
import logging
from elevenlabs import ElevenLabs
from typing import Optional

# Setup logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)  # Set to DEBUG level for more verbose logging

# Load environment variables from multiple possible locations
load_dotenv()
load_dotenv(dotenv_path=".env")
load_dotenv(dotenv_path="../.env")
load_dotenv(dotenv_path="../../.env")

router = APIRouter()

# Function to get API key from multiple sources
def get_gemini_api_key():
    # Try different environment variable names
    api_key = (
        os.getenv("GEMINI_API_KEY") or 
        os.getenv("GOOGLE_API_KEY") or
        os.environ.get("GEMINI_API_KEY") or
        os.environ.get("GOOGLE_API_KEY")
    )
    
    # If still not found, try reading from .env file directly
    if not api_key:
        env_paths = [".env", "../.env", "../../.env", "../../../.env"]
        for env_path in env_paths:
            if os.path.exists(env_path):
                try:
                    with open(env_path, 'r', encoding='utf-8') as f:
                        for line in f:
                            line = line.strip()
                            if line.startswith('GEMINI_API_KEY='):
                                api_key = line.split('=', 1)[1].strip().strip('"').strip("'")
                                break
                            elif line.startswith('GOOGLE_API_KEY='):
                                api_key = line.split('=', 1)[1].strip().strip('"').strip("'")
                                break
                    if api_key:
                        break
                except Exception as e:
                    logger.warning(f"Could not read {env_path}: {e}")
    
    return api_key

# Initialize Gemini API
try:
    api_key = get_gemini_api_key()
    if not api_key:
        # Hardcode for testing - API key yang sudah terbukti bekerja
        api_key = "AIzaSyBsWCBiLjOQvkjHoNBjjskQ4tjRyK559SQ"
        logger.warning("Using hardcoded API key for testing")
    
    genai.configure(api_key=api_key)
    # Gunakan model stable Gemini 2.0 Flash - proven reliable for story generation
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    logger.info(f"Gemini API configured successfully with model gemini-2.0-flash-exp, key ending in ...{api_key[-4:]}")
    
except Exception as e:
    logger.error(f"Failed to configure Gemini API: {e}")
    # Jangan raise error di sini, biarkan aplikasi tetap berjalan
    model = None
    logger.warning("Continuing without Gemini model - will try to configure at runtime")

class StoryRequest(BaseModel):
    child_name: str
    child_age: int
    child_interests: str

@router.post("/generate")
async def generate_story(request: StoryRequest):
    try:
        logger.info(f"🎯 [STEP 1/6] Starting story generation for {request.child_name}, age {request.child_age}, interests: {request.child_interests}")
        
        # Create fresh model instance every time (avoid global state issues)
        logger.info("🔧 [STEP 2/6] Creating fresh Gemini model instance...")
        try:
            # Force use hardcoded API key that we know works
            api_key = "AIzaSyBsWCBiLjOQvkjHoNBjjskQ4tjRyK559SQ"
            logger.info(f"🔑 Using API key ending: ...{api_key[-4:]}")
            
            # Create fresh configuration and model (not using global)
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
            logger.info("✅ Fresh Gemini 2.0 Flash model created successfully")
        except Exception as e:
            logger.error(f"❌ Failed to create Gemini model: {e}")
            raise HTTPException(status_code=500, detail=f"Gemini API not configured: {e}")
        
                # Load the financial literacy prompt template
        logger.info("📝 [STEP 3/6] Loading prompt template...")
        prompt_path = 'app/storybuilder/prompts/financial_literacy.txt'
        if not os.path.exists(prompt_path):
            logger.warning(f"⚠️ Primary prompt path not found: {prompt_path}")
            # Try alternative paths
            alt_paths = [
                'storybuilder/prompts/financial_literacy.txt',
                '../storybuilder/prompts/financial_literacy.txt',
                'prompts/financial_literacy.txt'
            ]
            for path in alt_paths:
                if os.path.exists(path):
                    prompt_path = path
                    logger.info(f"✅ Found alternative prompt path: {path}")
                    break

        if os.path.exists(prompt_path):
            logger.info(f"📂 Loading prompt template from: {prompt_path}")
            with open(prompt_path, 'r', encoding='utf-8') as file:
                prompt_template = file.read()
        else:
            logger.warning("⚠️ No prompt file found, using fallback prompt")
            # Fallback prompt dalam bahasa Indonesia
            prompt_template = """
Buatkan cerita edukatif tentang literasi keuangan untuk anak bernama {nama} yang berusia {umur} tahun.
Anak ini suka {minat}.

Cerita harus:
- Menggunakan bahasa Indonesia yang mudah dipahami
- Mengajarkan konsep dasar tentang uang (menabung, berbelanja bijak, nilai uang)
- Panjang sekitar 300-400 kata
- Menyertakan pesan moral tentang keuangan

Struktur cerita:
1. Pembukaan yang menarik
2. Masalah sederhana terkait uang
3. Proses belajar
4. Solusi dan pembelajaran
5. Pesan moral

Buatlah cerita yang menarik dan mendidik!
            """
        
        # Format the prompt with user data
        logger.info("🔧 [STEP 4/6] Formatting prompt with user data...")
        formatted_prompt = prompt_template.format(
            nama=request.child_name,
            umur=request.child_age,
            minat=request.child_interests
        )
        
        logger.info(f"📏 Prompt length: {len(formatted_prompt)} characters")
        logger.info("🚀 [STEP 5/6] Sending request to Gemini API...")
        
        # Generate content using Gemini
        response = model.generate_content(
            formatted_prompt,
            generation_config=genai.types.GenerationConfig(
                candidate_count=1,
                max_output_tokens=1000,
                temperature=0.7,
            )
        )
        
        logger.info("📥 Received response from Gemini API")
        
        if not response.text:
            logger.error("❌ No response text from Gemini API")
            raise HTTPException(status_code=500, detail="No response from Gemini API")
        
        story_content = response.text
        logger.info(f"✅ Story generated successfully! Length: {len(story_content)} characters")
        logger.info(f"📖 Story preview: {story_content[:100]}...")
        
        # Generate a unique ID for this story
        story_id = str(uuid.uuid4())
        
        # Create structured story data compatible with Next.js frontend
        structured_story = {
            "main": {
                "title": f"Petualangan Literasi Keuangan {request.child_name}",
                "flow": ["scene_1"],
                "state": {
                    "global_state": {
                        "child_name": request.child_name,
                        "money_concepts_learned": [],
                        "progress": 0
                    }
                }
            },
            "characters": [
                {
                    "name": "Narrator",
                    "prompt": "Narrator yang ramah untuk cerita literasi keuangan",
                    "voice": "1k39YpzqXZn52BgyLyGO",
                    "personality": {
                        "trait": "ramah dan mendidik",
                        "goal": "mengajarkan literasi keuangan",
                        "speech_style": "jelas dan hangat"
                    }
                }
            ],
            "scenes": [
                {
                    "id": "scene_1",
                    "name": "Cerita Literasi Keuangan",
                    "prompt": "Scene utama cerita literasi keuangan",
                    "mood": "educational",
                    "time": "present",
                    "imageUrl": "/assets/scenes/default.jpg",
                    "events": [
                        {
                            "type": "narrate",
                            "character": {
                                "name": "Narrator",
                                "prompt": "Narrator yang ramah",
                                "voice": "1k39YpzqXZn52BgyLyGO",
                                "personality": {
                                    "trait": "ramah dan mendidik",
                                    "goal": "mengajarkan literasi keuangan", 
                                    "speech_style": "jelas dan hangat"
                                }
                            },
                            "content": story_content,
                            "emotion": "warm",
                            "id": f"event_{uuid.uuid4()}",
                            "order": 1
                        }
                    ]
                }
            ]
        }
        
        return {
            "story": structured_story,  # Frontend expects this structure
            "metadata": {
                "child_name": request.child_name,
                "child_age": str(request.child_age),
                "child_interests": request.child_interests,
                "timestamp": datetime.now().isoformat(),
                "id": story_id
            },
            # Legacy fields for backward compatibility
            "story_id": story_id,
            "story_content": story_content,
            "created_at": datetime.now().isoformat(),
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"💥 Error generating story for {request.child_name}: {str(e)}", exc_info=True)
        logger.error(f"🔍 Error type: {type(e).__name__}")
        logger.error(f"📍 Error details: {repr(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating story: {str(e)}")

class AudioRequest(BaseModel):
    text: str
    provider: str = "elevenlabs"  # Default to ElevenLabs, support "openai", "elevenlabs"
    voice: str = "1k39YpzqXZn52BgyLyGO"    # Default to BEE ARD voice

@router.post("/generate-audio")
async def generate_audio(
    request: AudioRequest, 
    x_elevenlabs_key: Optional[str] = Header(None, alias="X-ElevenLabs-Key")
):
    try:
        logger.info(f"🎧 [AUDIO] Starting audio generation", {
            "text_length": len(request.text),
            "provider": request.provider,
            "voice": request.voice,
            "text_preview": request.text[:50] + "..." if len(request.text) > 50 else request.text
        })
        
        if request.provider == "elevenlabs":
            logger.info(f"🎤 Using ElevenLabs for audio generation with voice: {request.voice}")
            
            # Get API key from header or use default
            api_key = x_elevenlabs_key or "sk_8a4b8f1df7f7899bf2f7234d54670eaa5bbc12e4cf251cef"
            
            if not api_key:
                logger.error("❌ No ElevenLabs API key provided")
                raise HTTPException(status_code=400, detail="ElevenLabs API key required")
            
            try:
                # Initialize ElevenLabs client
                client = ElevenLabs(api_key=api_key)
                logger.info(f"✅ ElevenLabs client initialized successfully")
                
                # Generate audio
                #pengaturan jenis suara sini gomgom
                audio_generator = client.text_to_speech.convert(
                    voice_id=request.voice,
                    output_format="mp3_44100_128",
                    text=request.text,
                    model_id="eleven_multilingual_v2",  # Changed to cheaper model
                )
                
                # Collect audio data
                audio_data = b""
                for chunk in audio_generator:
                    audio_data += chunk
                
                logger.info(f"✅ [AUDIO] ElevenLabs audio generation completed successfully")
                
                return StreamingResponse(
                    io.BytesIO(audio_data),
                    media_type="audio/mpeg",
                    headers={
                        "Content-Length": str(len(audio_data)),
                        "Accept-Ranges": "bytes",
                        "Cache-Control": "no-cache"
                    }
                )
                
            except Exception as e:
                logger.error(f"❌ ElevenLabs API error: {e}")
                raise HTTPException(status_code=500, detail=f"ElevenLabs API error: {str(e)}")
        
        elif request.provider == "openai":
            logger.info(f"🎤 OpenAI provider requested - fallback to ElevenLabs with BEE ARD voice")
            
            # Convert OpenAI request to ElevenLabs with BEE ARD voice
            api_key = x_elevenlabs_key or "sk_8a4b8f1df7f7899bf2f7234d54670eaa5bbc12e4cf251cef"
            bee_ard_voice = "1k39YpzqXZn52BgyLyGO"
            
            try:
                # Initialize ElevenLabs client
                client = ElevenLabs(api_key=api_key)
                logger.info(f"✅ ElevenLabs client initialized (OpenAI fallback) using BEE ARD voice")
                
                # Generate audio with BEE ARD voice
                audio_generator = client.text_to_speech.convert(
                    voice_id=bee_ard_voice,
                    output_format="mp3_44100_128",
                    text=request.text,
                    model_id="eleven_multilingual_v2",  # Changed to cheaper model
                )
                
                # Collect audio data
                audio_data = b""
                for chunk in audio_generator:
                    audio_data += chunk
                
                logger.info(f"✅ [AUDIO] OpenAI->ElevenLabs (BEE ARD) audio generation completed successfully")
                
                return StreamingResponse(
                    io.BytesIO(audio_data),
                    media_type="audio/mpeg",
                    headers={
                        "Content-Length": str(len(audio_data)),
                        "Accept-Ranges": "bytes",
                        "Cache-Control": "no-cache"
                    }
                )
                
            except Exception as e:
                logger.error(f"❌ ElevenLabs API error (OpenAI fallback): {e}")
                raise HTTPException(status_code=500, detail=f"ElevenLabs API error: {str(e)}")
        
        else:
            logger.error(f"❌ Unsupported provider: {request.provider}")
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {request.provider}. Supported providers: elevenlabs, openai")
        
    except Exception as e:
        logger.error(f"💥 Error generating audio: {str(e)}", exc_info=True)
        logger.error(f"🔍 Audio error type: {type(e).__name__}")
        logger.error(f"📍 Request details: text_length={len(request.text)}, provider={request.provider}")
        raise HTTPException(status_code=500, detail=f"Error generating audio: {str(e)}")

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "gemini_configured": bool(api_key),
        "timestamp": datetime.now().isoformat()
    }