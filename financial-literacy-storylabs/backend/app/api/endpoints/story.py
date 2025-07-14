from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
import google.generativeai as genai
from elevenlabs import ElevenLabs
import os
from datetime import datetime
import uuid
from dotenv import load_dotenv
from app.storybuilder.config import model, AGE_GROUPS, FINANCIAL_CONCEPTS_PER_STORY
from ..models.story_generation import Story
import logging
from fastapi.responses import StreamingResponse
from io import BytesIO
from pathlib import Path
import time
from typing import Optional, Literal
import json
from gtts import gTTS
import tempfile
import base64
from PIL import Image

logger = logging.getLogger(__name__)
load_dotenv()
router = APIRouter()

class StoryRequest(BaseModel):
    child_name: str
    child_age: int
    child_interests: str
    financial_focus: Optional[str] = None  # Optional specific financial topic focus

class ImageRequest(BaseModel):
    prompt: str
    aspect_ratio: str = "1:1"
    output_format: str = "png"
    seed: Optional[int] = None

class AudioRequest(BaseModel):
    text: str
    provider: Literal["google", "elevenlabs"] = "google"
    voice: Optional[str] = None

# Credential validation
def validate_credentials(
    x_access_code: Optional[str] = Header(None),
    x_gemini_key: Optional[str] = Header(None),
    x_elevenlabs_key: Optional[str] = Header(None)
):
    # Check access code
    expected_access_code = os.getenv("ACCESS_CODE")
    if expected_access_code and x_access_code != expected_access_code:
        raise HTTPException(status_code=401, detail="Invalid access code")
    
    # Get API keys from headers or environment
    credentials = {
        "gemini_key": x_gemini_key or os.getenv("GEMINI_API_KEY"),
        "elevenlabs_key": x_elevenlabs_key or os.getenv("ELEVENLABS_API_KEY")
    }
    
    # Validate required credentials
    if not credentials["gemini_key"]:
        raise HTTPException(status_code=401, detail="Gemini API key is required")
    
    return credentials

def get_age_group(age: int) -> str:
    """Determine age group for financial literacy concepts"""
    if 4 <= age <= 6:
        return "4-6"
    elif 7 <= age <= 9:
        return "7-9"
    elif 10 <= age <= 12:
        return "10-12"
    else:
        # Default to closest age group
        if age < 4:
            return "4-6"
        else:
            return "10-12"

def load_financial_concepts(age_group: str) -> dict:
    """Load financial concepts for the specified age group"""
    try:
        concepts_file = Path("app/storybuilder/financial_concepts/concepts_by_age.json")
        with open(concepts_file, 'r') as f:
            concepts_data = json.load(f)
        return concepts_data["age_groups"][age_group]
    except Exception as e:
        logger.error(f"Error loading financial concepts: {e}")
        return {}

def parse_gemini_response(response_text: str) -> dict:
    """Parse Gemini response and convert to Story format"""
    try:
        # Try to extract JSON from the response
        import re
        json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # If no JSON block, try to find JSON in the response
            json_str = response_text.strip()
        
        # Parse the JSON
        story_data = json.loads(json_str)
        return story_data
    except Exception as e:
        logger.error(f"Error parsing Gemini response: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse story response")

@router.post("/generate")
async def generate_story(
    request: StoryRequest,
    credentials: dict = Depends(validate_credentials)
):
    try:
        # Validate child age
        if request.child_age < 4 or request.child_age > 12:
            raise HTTPException(
                status_code=400, 
                detail="Child age must be between 4 and 12 years old"
            )
        
        # Configure Gemini
        genai.configure(api_key=credentials["gemini_key"])
        model_instance = genai.GenerativeModel('gemini-1.5-flash')
        
        # Determine age group and load appropriate financial concepts
        age_group = get_age_group(request.child_age)
        financial_concepts = load_financial_concepts(age_group)
        
        # Load the financial literacy generator prompt
        with open('app/storybuilder/prompts/financial_literacy_generator.txt', 'r') as file:
            generator_prompt = file.read()
        
        # Create enhanced user prompt with financial literacy focus
        user_prompt = f"""
        Generate a financial literacy story for {request.child_name}, age {request.child_age}.
        
        Child's interests: {request.child_interests}
        Age group: {age_group} ({financial_concepts.get('title', 'Financial Concepts')})
        Financial focus: {request.financial_focus or 'age-appropriate financial concepts'}
        
        Please create an engaging story that teaches {FINANCIAL_CONCEPTS_PER_STORY} financial concepts 
        appropriate for a {request.child_age}-year-old child, incorporating their interest in {request.child_interests}.
        
        The story should be educational, fun, and interactive with clear learning objectives.
        
        IMPORTANT: Generate ALL story content in Bahasa Indonesia (Indonesian language).
        Use Indonesian currency (Rupiah) and cultural context appropriate for Indonesian children.
        All character dialogue, narration, and descriptions must be in Indonesian.
        
        IMPORTANT: Return ONLY a valid JSON response matching the exact format shown in the system prompt example.
        """
        
        logger.info(f"Generating financial literacy story for {request.child_name}, age {request.child_age}")
        
        # Generate story with Gemini
        full_prompt = f"{generator_prompt}\n\nUser Request:\n{user_prompt}"
        response = model_instance.generate_content(full_prompt)
        
        # Parse the response
        story_data = parse_gemini_response(response.text)
        
        logger.info(f"Financial literacy story generation completed for {request.child_name}")
        
        return {
            "story": story_data,
            "metadata": {
                "child_name": request.child_name,
                "child_age": request.child_age,
                "child_interests": request.child_interests,
                "financial_focus": request.financial_focus,
                "age_group": age_group,
                "financial_concepts_covered": financial_concepts.get("title", "Financial Concepts"),
                "timestamp": datetime.now().isoformat(),
                "id": uuid.uuid4().hex
            }
        }

    except Exception as e:
        logger.error(f"Error generating financial literacy story: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Story generation failed: {str(e)}")

@router.post("/generate-image")
async def generate_image(
    request: ImageRequest,
    credentials: dict = Depends(validate_credentials)
):
    try:
        # Configure Gemini
        genai.configure(api_key=credentials["gemini_key"])
        
        # Use Gemini 2.0 Flash for image generation
        model_instance = genai.GenerativeModel('gemini-2.0-flash-preview-image-generation')
        
        # Enhance prompt for financial literacy and child safety
        enhanced_prompt = f"{request.prompt}. {IMAGE_STYLE}. {IMAGE_SAFETY_PROMPT}. Sesuai untuk pendidikan keuangan anak-anak Indonesia."
        
        logger.info(f"Generating image with Gemini: {enhanced_prompt}")
        
        # Generate image with Gemini
        response = model_instance.generate_content(
            enhanced_prompt,
            generation_config=genai.types.GenerationConfig(
                response_modalities=["TEXT", "IMAGE"]
            )
        )
        
        # Extract image from response
        image_data = None
        for part in response.candidates[0].content.parts:
            if part.inline_data:
                image_data = part.inline_data.data
                break
        
        if not image_data:
            raise HTTPException(status_code=500, detail="No image generated in response")
        
        # Convert base64 to bytes and save
        image_bytes = base64.b64decode(image_data)
        
        # Save the image to a local file
        file_path = f"images/{int(time.time())}.png"
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(image_bytes)

        logger.info(f"Financial literacy image generated successfully with Gemini: {file_path}")
        
        # Return the file path as JSON
        return {"image_path": file_path}
        
    except Exception as e:
        logger.error(f"Error generating image with Gemini: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

def save_audio_from_generator(audio_generator):
    """Save audio generator to BytesIO"""
    audio_stream = BytesIO()
    for chunk in audio_generator:
        audio_stream.write(chunk)
    audio_stream.seek(0)
    return audio_stream

@router.post("/generate-audio")
async def generate_audio(
    request: AudioRequest,
    credentials: dict = Depends(validate_credentials)
):
    try:
        if request.provider == "google":
            # Use Google Text-to-Speech (gTTS) with Indonesian language
            tts = gTTS(text=request.text, lang='id', slow=False)
            
            # Create a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
                tts.save(temp_file.name)
                
                # Read the file content into BytesIO
                with open(temp_file.name, 'rb') as audio_file:
                    audio_stream = BytesIO(audio_file.read())
                
                # Clean up the temporary file
                os.unlink(temp_file.name)
                
            audio_stream.seek(0)

        else:  # elevenlabs
            # Use ElevenLabs (if available)
            if not credentials["elevenlabs_key"]:
                raise HTTPException(status_code=400, detail="ElevenLabs API key required for this voice provider")
            
            client = ElevenLabs(api_key=credentials["elevenlabs_key"])
            audio_generator = client.text_to_speech.convert(
                voice_id="cgSgspJ2msm6clMCkdW9",  # Default voice ID for ElevenLabs
                output_format="mp3_44100_128",
                text=request.text,
                model_id="eleven_multilingual_v2",
            )
            audio_stream = save_audio_from_generator(audio_generator)

        logger.info(f"Audio generated successfully using {request.provider}")
        
        return StreamingResponse(
            audio_stream,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=financial_story_audio.mp3"}
        )
        
    except Exception as e:
        logger.error(f"Error generating audio: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")

@router.get("/financial-concepts/{age_group}")
async def get_financial_concepts(age_group: str):
    """Get financial concepts for a specific age group"""
    try:
        if age_group not in AGE_GROUPS:
            raise HTTPException(status_code=400, detail="Invalid age group")
        
        concepts = load_financial_concepts(age_group)
        return {"age_group": age_group, "concepts": concepts}
        
    except Exception as e:
        logger.error(f"Error loading financial concepts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load concepts: {str(e)}")

@router.get("/story-templates")
async def get_story_templates():
    """Get available story templates"""
    try:
        concepts_file = Path("app/storybuilder/financial_concepts/concepts_by_age.json")
        with open(concepts_file, 'r') as f:
            concepts_data = json.load(f)
        return {"templates": concepts_data["story_templates"]}
        
    except Exception as e:
        logger.error(f"Error loading story templates: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load templates: {str(e)}")

# Import required constants from config
from app.storybuilder.config import IMAGE_STYLE, IMAGE_SAFETY_PROMPT, AUDIO_SPEED 