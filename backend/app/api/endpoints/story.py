from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import json
import base64
import uuid
import tempfile
import io
import re
from datetime import datetime
from typing import Optional
import logging
from PIL import Image, ImageDraw, ImageFont
from gtts import gTTS
from openai import OpenAI
from elevenlabs import Voice, VoiceSettings
from elevenlabs.client import ElevenLabs
import replicate
import requests
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/test")
async def test_endpoint():
    """Test endpoint to verify OpenAI integration"""
    return {"message": "OpenAI integration active!", "status": "working"}

class StoryRequest(BaseModel):
    child_name: str
    child_age: int
    child_interests: str

@router.post("/generate")
async def generate_story(request: StoryRequest):
    """Generate a structured story with multiple scenes"""
    try:
        print("✨ USING GEMINI VERSION!")
        logger.info("✨ USING GEMINI VERSION!")
        logger.info(f"🎯 [STEP 1/6] Starting story generation for {request.child_name}, age {request.child_age}, interests: {request.child_interests}")
        
        # Configure Gemini API
        logger.info("🔧 [STEP 2/6] Configuring Gemini API...")
        try:
            # Use environment variable - no fallback for security
            gemini_api_key = os.getenv("GEMINI_API_KEY")
            if not gemini_api_key:
                raise HTTPException(status_code=500, detail="GEMINI_API_KEY environment variable not set")
            logger.info(f"🔑 Using Gemini API key ending: ...{gemini_api_key[-4:]}")
            
            genai.configure(api_key=gemini_api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            logger.info("✅ Gemini API configured successfully")
        except Exception as e:
            logger.error(f"❌ Failed to configure Gemini API: {e}")
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
        
        try:
            with open(prompt_path, 'r', encoding='utf-8') as file:
                prompt_template = file.read()
                logger.info(f"📄 Prompt template loaded successfully from: {prompt_path}")
        except Exception as e:
            logger.error(f"❌ Failed to load prompt template: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to load prompt template: {e}")
        
        # Format the prompt
        logger.info("🔧 [STEP 4/6] Formatting prompt with user data...")
        formatted_prompt = prompt_template.format(
            nama=request.child_name,
            umur=request.child_age,
            minat=request.child_interests
        )
        
        logger.info(f"📏 Prompt length: {len(formatted_prompt)} characters")
        logger.info("🚀 [STEP 5/6] Sending request to Gemini API...")
        logger.info(f"🔍 DEBUG: About to call Gemini with model: {model}")
        
        # Generate content using Gemini
        system_prompt = "You are a professional Indonesian children's story writer specializing in financial literacy education. Always respond in valid JSON format as requested."
        full_prompt = f"{system_prompt}\n\n{formatted_prompt}"
        
        response = model.generate_content(
            full_prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=2000,
                temperature=0.7,
            )
        )
        
        logger.info("📥 Received response from Gemini API")
        
        if not response.text:
            logger.error("❌ No response text from Gemini API")
            raise HTTPException(status_code=500, detail="No response from Gemini API")
        
        story_content = response.text
        logger.info(f"✅ Story generated successfully! Length: {len(story_content)} characters")
        logger.info(f"📖 Story preview: {story_content[:200]}...")
        
        # Parse JSON response from Gemini
        try:
            story_data = parse_json_response(story_content)
            logger.info("✅ Successfully parsed JSON response")
        except Exception as json_error:
            logger.warning(f"⚠️ Failed to parse JSON response: {json_error}")
            # Fallback to plain text format
            story_data = {
                "title": f"Petualangan Literasi Keuangan {request.child_name}",
                "scenes": [
                    {
                        "id": "scene_1",
                        "title": "Cerita Literasi Keuangan",
                        "content": story_content,
                        "question": "Apa yang bisa dipelajari dari cerita ini?",
                        "image_description": f"Ilustrasi cerita {request.child_name} dengan tema {request.child_interests}"
                    }
                ],
                "moral": "Menabung dan mengatur uang adalah keterampilan penting untuk dipelajari sejak dini."
            }
        
        # Generate a unique ID for this story
        story_id = str(uuid.uuid4())
        
        # Generate AI image using Replicate (not Gemini)
        logger.info("🎨 [STEP 6/6] Generating AI image using Replicate...")
        try:
            # Create image description for Indonesian financial literacy story
            image_description = generate_image_description(
                story_data.get("title", ""), 
                request.child_name, 
                request.child_interests
            )
            
            # Generate AI image using Replicate FLUX model
            logger.info("🚀 Generating AI image with Replicate FLUX model...")
            custom_image_url = await generate_ai_image(image_description)
            
            if not custom_image_url:
                logger.info("🔄 AI failed, using fallback image generation")
                custom_image_url = create_fallback_image(image_description)
            
            if custom_image_url:
                logger.info("✅ Fallback image generated successfully")
            else:
                logger.warning("⚠️ Using default fallback")
                custom_image_url = "/assets/scenes/default.jpg"
                
        except Exception as e:
            logger.error(f"💥 Error generating image: {e}")
            # Always create fallback image on any error
            try:
                image_description = generate_image_description(
                    story_data.get("title", ""), 
                    request.child_name, 
                    request.child_interests
                )
                custom_image_url = create_fallback_image(image_description)
            except Exception as fallback_error:
                logger.error(f"💥 Fallback image creation failed: {fallback_error}")
                custom_image_url = "/assets/scenes/default.jpg"
        
        # Create structured story data compatible with Next.js frontend
        scenes = []
        flow = []
        
        # Create scenes from the JSON data
        for i, scene_data in enumerate(story_data.get("scenes", [])):
            scene_id = scene_data.get("id", f"scene_{i+1}")
            flow.append(scene_id)
            
            # Generate individual image for each scene
            try:
                scene_image_description = f"Ilustrasi scene {i+1}: {scene_data.get('image_description', '')} untuk cerita anak Indonesia tentang literasi keuangan"
                # Generate AI image for scene using Replicate
                logger.info(f"🚀 [SCENE {i+1}] Generating AI image with Replicate...")
                scene_image_url = await generate_ai_image(scene_image_description)
                
                if not scene_image_url:
                    logger.info(f"🔄 [SCENE {i+1}] AI failed, using fallback image")
                    scene_image_url = create_fallback_image(scene_image_description)
                if not scene_image_url:
                    scene_image_url = custom_image_url  # Use main image as fallback
            except Exception as e:
                logger.warning(f"⚠️ Failed to generate scene {i+1} image: {e}")
                try:
                    scene_image_description = f"Ilustrasi scene {i+1}: {scene_data.get('image_description', '')} untuk cerita anak Indonesia tentang literasi keuangan"
                    scene_image_url = create_fallback_image(scene_image_description)
                    if not scene_image_url:
                        scene_image_url = custom_image_url  # Use main image as fallback
                except Exception as fallback_error:
                    logger.error(f"💥 Scene {i+1} fallback image creation failed: {fallback_error}")
                    scene_image_url = custom_image_url
            
            scene = {
                "id": scene_id,
                "name": scene_data.get("title", f"Scene {i+1}"),
                "prompt": scene_data.get("image_description", f"Scene {i+1} cerita literasi keuangan"),
                "mood": "educational",
                "time": "present",
                "imageUrl": scene_image_url,
                "events": [
                    {
                        "type": "narrate",
                        "character": {
                            "name": "Narrator",
                            "prompt": "Narrator yang ramah",
                            "voice": "alloy",
                            "personality": {
                                "trait": "ramah dan mendidik",
                                "goal": "mengajarkan literasi keuangan", 
                                "speech_style": "jelas dan hangat"
                            }
                        },
                        "content": scene_data.get("content", ""),
                        "emotion": "warm",
                        "id": f"event_{uuid.uuid4()}",
                        "order": 1
                    }
                ]
            }
            
            # Add interactive question as a second event
            if scene_data.get("question"):
                scene["events"].append({
                    "type": "input",
                    "character": {
                        "name": "Narrator",
                        "prompt": "Narrator yang ramah",
                        "voice": "alloy",
                        "personality": {
                            "trait": "ramah dan mendidik",
                            "goal": "mengajarkan literasi keuangan", 
                            "speech_style": "jelas dan hangat"
                        }
                    },
                    "content": scene_data.get("question", ""),
                    "emotion": "curious",
                    "id": f"event_{uuid.uuid4()}",
                    "order": 2
                })
            
            scenes.append(scene)
        
        # Fallback if no scenes were created
        if not scenes:
            scenes = [
                {
                    "id": "scene_1",
                    "name": "Cerita Literasi Keuangan",
                    "prompt": "Scene utama cerita literasi keuangan",
                    "mood": "educational",
                    "time": "present",
                    "imageUrl": custom_image_url,
                    "events": [
                        {
                            "type": "narrate",
                            "character": {
                                "name": "Narrator",
                                "prompt": "Narrator yang ramah",
                                "voice": "alloy",
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
            flow = ["scene_1"]
        
        structured_story = {
            "main": {
                "title": story_data.get("title", f"Petualangan Literasi Keuangan {request.child_name}"),
                "flow": flow,
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
                    "voice": "alloy",
                    "personality": {
                        "trait": "ramah dan mendidik",
                        "goal": "mengajarkan literasi keuangan",
                        "speech_style": "jelas dan hangat"
                    }
                }
            ],
            "scenes": scenes
        }
        
        return {
            "story": structured_story,
            "metadata": {
                "child_name": request.child_name,
                "child_age": request.child_age,
                "child_interests": request.child_interests,
                "timestamp": datetime.now().isoformat(),
                "id": story_id
            },
            # Properly structured story data for frontend
            "title": story_data.get("title", f"Petualangan Literasi Keuangan {request.child_name}"),
            "scenes": story_data.get("scenes", []),
            "moral": story_data.get("moral", ""),
            "story_id": story_id,
            "created_at": datetime.now().isoformat(),
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"💥 Error generating story for {request.child_name}: {str(e)}", exc_info=True)
        logger.error(f"🔍 Error type: {type(e).__name__}")
        logger.error(f"📍 Error details: {repr(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating story: {str(e)}")

async def generate_ai_image(image_description: str) -> Optional[str]:
    """Generate AI image using Gemini's native image generation"""
    try:
        logger.info(f"🎨 [AI IMAGE] Generating image with Gemini: {image_description[:100]}...")
        
        # Configure Gemini API key
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            logger.error("❌ [AI IMAGE] GEMINI_API_KEY environment variable not set")
            return create_fallback_image(image_description)
        genai.configure(api_key=gemini_api_key)
        
        # Try native Gemini image generation first
        try:
            logger.info("🖼️ [AI IMAGE] Using Gemini native image generation...")
            
            # Enhanced prompt for Indonesian children's book illustration
            enhanced_prompt = f"""
            Create a colorful Indonesian children's book illustration: {image_description}
            
            Style: Bright, cheerful, cartoon-style illustration perfect for children aged 3-12
            Cultural elements: Indonesian setting, characters, and cultural context
            Theme: Financial literacy story with educational and fun elements
            Colors: Vibrant, warm, and appealing to children
            Quality: High-quality, professional children's book illustration
            """
            
            # Use Gemini's experimental image generation model
            model = genai.GenerativeModel('gemini-2.0-flash-preview-image-generation')
            response = model.generate_content(enhanced_prompt)
            
            # Process the response
            if response.candidates and len(response.candidates) > 0:
                candidate = response.candidates[0]
                if candidate.content and candidate.content.parts:
                    for part in candidate.content.parts:
                        if hasattr(part, 'inline_data') and part.inline_data:
                            # Got image data - save it
                            image_data = part.inline_data.data
                            image_filename = f"generated_image_{uuid.uuid4().hex[:8]}.png"
                            image_path = f"/tmp/{image_filename}"
                            
                            # Decode and save the image
                            import base64
                            with open(image_path, 'wb') as f:
                                f.write(base64.b64decode(image_data))
                            
                            logger.info(f"✅ [AI IMAGE] Gemini image generated successfully: {image_path}")
                            return image_path
                        elif hasattr(part, 'text') and part.text:
                            logger.info(f"🎯 [AI IMAGE] Gemini text response: {part.text[:100]}...")
            
            # If no image data, fall back to enhanced description
            logger.info("🔄 [AI IMAGE] No image data in response, creating enhanced fallback...")
            
        except Exception as gemini_image_error:
            logger.error(f"❌ [AI IMAGE] Gemini image generation failed: {gemini_image_error}")
        
        # Fallback to text enhancement and create custom image
        try:
            logger.info("📝 [AI IMAGE] Using Gemini to enhance image description...")
            
            model = genai.GenerativeModel('gemini-1.5-flash')
            enhanced_prompt = f"""
            Enhance this image description for creating a colorful Indonesian children's book illustration:
            "{image_description}"
            
            Make it more detailed and suitable for a children's financial literacy story.
            Focus on Indonesian cultural elements, bright colors, and friendly characters.
            Keep it under 100 words.
            """
            
            response = model.generate_content(enhanced_prompt)
            enhanced_description = response.text if response.text else image_description
            logger.info(f"✅ [AI IMAGE] Gemini enhanced description: {enhanced_description[:100]}...")
            
            # Create enhanced fallback image with Gemini's improved description
            return create_enhanced_fallback_image(enhanced_description, image_description)
            
        except Exception as gemini_error:
            logger.error(f"❌ [AI IMAGE] Gemini enhancement failed: {gemini_error}")
            return create_fallback_image(image_description)
            
    except Exception as e:
        logger.error(f"❌ [AI IMAGE] General error in Gemini image generation: {e}")
        return create_fallback_image(image_description)

def create_fallback_image(description: str) -> str:
    """Create a simple illustrated fallback image when AI generation fails"""
    try:
        # Create a simple illustrated image
        width, height = 600, 400
        image = Image.new('RGB', (width, height), color='#E8F4FD')
        draw = ImageDraw.Draw(image)
        
        # Create gradient background
        for i in range(height):
            r = int(232 + (255 - 232) * i / height)
            g = int(244 + (255 - 244) * i / height)
            b = int(253 + (200 - 253) * i / height)
            color = (r, g, b)
            draw.line([(0, i), (width, i)], fill=color)
        
        # Draw simple house
        draw.rectangle([200, 200, 400, 350], fill='#8D6E63', outline='#5D4037', width=2)
        draw.polygon([(180, 200), (300, 150), (420, 200)], fill='#FF5722', outline='#D84315')
        draw.rectangle([270, 280, 330, 350], fill='#6D4C41', outline='#3E2723', width=2)
        
        # Draw character
        draw.ellipse([100, 150, 150, 200], fill='#FFAB91', outline='#FF8A65', width=2)
        draw.rectangle([110, 200, 140, 250], fill='#FF7043', outline='#FF5722', width=2)
        
        # Draw piggy bank
        draw.ellipse([450, 250, 520, 300], fill='#F8BBD0', outline='#E91E63', width=2)
        draw.ellipse([470, 260, 480, 270], fill='#000000')
        draw.ellipse([490, 260, 500, 270], fill='#000000')
        
        # Draw coins
        draw.ellipse([50, 300, 80, 330], fill='#FFD54F', outline='#FF8F00', width=2)
        draw.ellipse([520, 150, 550, 180], fill='#FFD54F', outline='#FF8F00', width=2)
        
        # Draw trees
        draw.rectangle([50, 250, 70, 350], fill='#8D6E63', outline='#5D4037', width=2)
        draw.ellipse([30, 230, 90, 280], fill='#4CAF50', outline='#2E7D32', width=2)
        
        draw.rectangle([530, 260, 550, 350], fill='#8D6E63', outline='#5D4037', width=2)
        draw.ellipse([510, 240, 570, 290], fill='#4CAF50', outline='#2E7D32', width=2)
        
        # Draw sun
        draw.ellipse([500, 50, 550, 100], fill='#FFD54F', outline='#FF8F00', width=2)
        
        # Draw clouds
        draw.ellipse([100, 70, 150, 110], fill='#FFFFFF', outline='#E0E0E0', width=1)
        draw.ellipse([120, 60, 170, 100], fill='#FFFFFF', outline='#E0E0E0', width=1)
        
        # Save to temporary file and convert to base64
        temp_dir = tempfile.gettempdir()
        image_path = os.path.join(temp_dir, f"fallback_illustration_{uuid.uuid4()}.png")
        image.save(image_path)
        
        with open(image_path, 'rb') as img_file:
            img_data = img_file.read()
            img_base64 = base64.b64encode(img_data).decode('utf-8')
        
        # Clean up
        os.unlink(image_path)
        
        logger.info("✅ [AI IMAGE] Fallback illustration created successfully")
        return f"data:image/png;base64,{img_base64}"
        
    except Exception as e:
        logger.error(f"❌ [AI IMAGE] Fallback illustration creation failed: {e}")
        return "/assets/scenes/default.jpg"

def create_enhanced_fallback_image(enhanced_description: str, original_description: str) -> str:
    """Create an enhanced illustrated fallback image using Gemini's improved description"""
    try:
        # Create a more colorful image with proper illustration elements
        width, height = 600, 400
        image = Image.new('RGB', (width, height), color='#E3F2FD')
        draw = ImageDraw.Draw(image)
        
        # Create a sky-like gradient background
        for i in range(height):
            if i < height // 3:  # Sky
                r = int(227 + (135 - 227) * i / (height // 3))
                g = int(242 + (206 - 242) * i / (height // 3))
                b = int(253 + (250 - 253) * i / (height // 3))
            elif i < 2 * height // 3:  # Middle ground
                r = int(135 + (76 - 135) * (i - height // 3) / (height // 3))
                g = int(206 + (175 - 206) * (i - height // 3) / (height // 3))
                b = int(250 + (80 - 250) * (i - height // 3) / (height // 3))
            else:  # Ground
                r = int(76 + (139 - 76) * (i - 2 * height // 3) / (height // 3))
                g = int(175 + (195 - 175) * (i - 2 * height // 3) / (height // 3))
                b = int(80 + (74 - 80) * (i - 2 * height // 3) / (height // 3))
            
            color = (r, g, b)
            draw.line([(0, i), (width, i)], fill=color)
        
        # Draw simple illustrations based on description
        # Draw a house (representing Indonesian home)
        house_color = '#8D6E63'
        roof_color = '#FF5722'
        
        # House base
        draw.rectangle([50, 250, 200, 350], fill=house_color, outline='#5D4037', width=2)
        
        # Roof
        draw.polygon([(30, 250), (125, 180), (220, 250)], fill=roof_color, outline='#D84315')
        
        # Door
        draw.rectangle([100, 300, 150, 350], fill='#6D4C41', outline='#3E2723', width=2)
        
        # Windows
        draw.rectangle([70, 280, 90, 300], fill='#81C784', outline='#388E3C', width=2)
        draw.rectangle([160, 280, 180, 300], fill='#81C784', outline='#388E3C', width=2)
        
        # Draw a character (Indonesian child)
        # Head
        draw.ellipse([350, 180, 400, 230], fill='#FFAB91', outline='#FF8A65', width=2)
        
        # Body
        draw.rectangle([360, 230, 390, 280], fill='#FF7043', outline='#FF5722', width=2)
        
        # Arms
        draw.rectangle([340, 240, 360, 270], fill='#FFAB91', outline='#FF8A65', width=2)
        draw.rectangle([390, 240, 410, 270], fill='#FFAB91', outline='#FF8A65', width=2)
        
        # Legs
        draw.rectangle([365, 280, 375, 320], fill='#5D4037', outline='#3E2723', width=2)
        draw.rectangle([380, 280, 390, 320], fill='#5D4037', outline='#3E2723', width=2)
        
        # Draw financial elements around the character
        # Piggy bank
        draw.ellipse([450, 300, 520, 340], fill='#F8BBD0', outline='#E91E63', width=2)
        draw.ellipse([470, 310, 480, 320], fill='#000000')  # Eye
        draw.ellipse([490, 310, 500, 320], fill='#000000')  # Eye
        draw.ellipse([480, 325, 490, 330], fill='#000000')  # Nose
        
        # Money symbols
        draw.text((280, 120), "💰", font=ImageFont.load_default())
        draw.text((320, 130), "🪙", font=ImageFont.load_default())
        draw.text((360, 125), "💳", font=ImageFont.load_default())
        
        # Draw clouds
        draw.ellipse([100, 50, 150, 90], fill='#FFFFFF', outline='#E0E0E0', width=1)
        draw.ellipse([120, 40, 170, 80], fill='#FFFFFF', outline='#E0E0E0', width=1)
        draw.ellipse([140, 50, 190, 90], fill='#FFFFFF', outline='#E0E0E0', width=1)
        
        draw.ellipse([400, 60, 450, 100], fill='#FFFFFF', outline='#E0E0E0', width=1)
        draw.ellipse([420, 50, 470, 90], fill='#FFFFFF', outline='#E0E0E0', width=1)
        draw.ellipse([440, 60, 490, 100], fill='#FFFFFF', outline='#E0E0E0', width=1)
        
        # Draw sun
        draw.ellipse([500, 30, 550, 80], fill='#FFD54F', outline='#FF8F00', width=2)
        
        # Draw trees
        draw.rectangle([250, 300, 270, 350], fill='#8D6E63', outline='#5D4037', width=2)  # Tree trunk
        draw.ellipse([230, 280, 290, 320], fill='#4CAF50', outline='#2E7D32', width=2)  # Tree leaves
        
        # Save to temporary file and convert to base64
        temp_dir = tempfile.gettempdir()
        image_path = os.path.join(temp_dir, f"enhanced_illustration_{uuid.uuid4()}.png")
        image.save(image_path)
        
        with open(image_path, 'rb') as img_file:
            img_data = img_file.read()
            img_base64 = base64.b64encode(img_data).decode('utf-8')
        
        # Clean up
        os.unlink(image_path)
        
        logger.info("✅ [AI IMAGE] Enhanced illustration created successfully")
        return f"data:image/png;base64,{img_base64}"
        
    except Exception as e:
        logger.error(f"❌ [AI IMAGE] Enhanced illustration creation failed: {e}")
        # Fall back to regular fallback image
        return create_fallback_image(original_description)

def generate_image_description(story_title: str, child_name: str, child_interests: str) -> str:
    """Generate optimized image description for Indonesian financial literacy story"""
    try:
        # Base description for Indonesian children's financial literacy
        description = f"Ilustrasi cerita anak Indonesia yang menunjukkan {child_name} "
        
        # Add interests-based elements
        if "sepak bola" in child_interests.lower() or "football" in child_interests.lower():
            description += "bermain sepak bola sambil belajar tentang uang, "
        elif "buku" in child_interests.lower() or "membaca" in child_interests.lower():
            description += "membaca buku sambil belajar tentang uang, "
        elif "game" in child_interests.lower():
            description += "bermain sambil belajar tentang uang, "
        elif "menggambar" in child_interests.lower():
            description += "menggambar sambil belajar tentang uang, "
        else:
            description += "belajar tentang uang dengan cara yang menyenangkan, "
        
        # Add financial literacy context
        description += "dengan elemen keuangan seperti celengan, uang koin, dan rupiah, "
        description += "suasana hangat dan edukatif, gaya ilustrasi anak-anak Indonesia, "
        description += "karakter kartun yang ramah dan ekspresif, "
        description += "warna-warna cerah dan menarik, "
        description += "latar belakang Indonesia yang familiar seperti rumah atau sekolah, "
        description += "tidak ada teks atau tulisan dalam gambar"
        
        return description
        
    except Exception as e:
        logger.error(f"Error generating image description: {e}")
        return f"Ilustrasi cerita anak Indonesia dengan {child_name} belajar tentang literasi keuangan, suasana ramah dan edukatif, tanpa teks"

def parse_json_response(response_text: str) -> dict:
    """Parse JSON response from Gemini, handling various formats"""
    try:
        # Function to find balanced JSON braces
        def extract_json_from_text(text):
            # Look for the start of JSON
            start_pos = text.find('{')
            if start_pos == -1:
                return None
            
            # Find the matching closing brace
            brace_count = 0
            in_string = False
            escaped = False
            
            for i, char in enumerate(text[start_pos:], start_pos):
                if escaped:
                    escaped = False
                    continue
                
                if char == '\\':
                    escaped = True
                    continue
                
                if char == '"':
                    in_string = not in_string
                    continue
                
                if not in_string:
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            return text[start_pos:i+1]
            return None
        
        # Try to find JSON within markdown code blocks
        json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            json_content = extract_json_from_text(json_match.group(1))
            if json_content:
                return json.loads(json_content)
        
        # Try to find JSON content without markdown
        json_content = extract_json_from_text(response_text)
        if json_content:
            return json.loads(json_content)
        
        raise ValueError("No valid JSON found in response")
        
    except Exception as e:
        logger.error(f"Error parsing JSON response: {e}")
        raise

def enhance_text_for_speech(text: str) -> str:
    """Enhance text with natural speech patterns for ElevenLabs"""
    enhanced_text = text
    
    # Add natural speech patterns
    enhanced_text = re.sub(r'Dulu kala', 'Dulu kala...', enhanced_text)
    enhanced_text = re.sub(r'Pada suatu hari', 'Pada suatu hari...', enhanced_text)
    enhanced_text = re.sub(r'Akhirnya', 'Akhirnya...', enhanced_text)
    enhanced_text = re.sub(r'Kemudian', 'Kemudian...', enhanced_text)
    
    # Add emotional cues
    enhanced_text = re.sub(r'senang', 'senang sekali', enhanced_text)
    enhanced_text = re.sub(r'sedih', 'sedih sekali', enhanced_text)
    enhanced_text = re.sub(r'takut', 'takut sekali', enhanced_text)
    
    # Add pauses for dramatic effect
    enhanced_text = re.sub(r'\.(?!\.\.)(?!\d)', '...', enhanced_text)
    enhanced_text = re.sub(r'\?(?!\.\.)(?!\d)', '?...', enhanced_text)
    enhanced_text = re.sub(r'!(?!\.\.)(?!\d)', '!...', enhanced_text)
    
    return enhanced_text

@router.post("/generate-audio")
async def generate_audio(request: dict):
    """Generate audio using ElevenLabs Indonesian female voice"""
    try:
        text = request.get("text", "")
        voice_id = request.get("voice_id", "21m00Tcm4TlvDq8ikWAM")  # Default Indonesian female voice
        
        logger.info(f"🎤 [AUDIO] Generating audio with ElevenLabs for text: {text[:100]}...")
        
        if not text:
            raise ValueError("No text provided for audio generation")
        
        # Enhance text for natural speech
        enhanced_text = enhance_text_for_speech(text)
        
        
        # Generate audio with ElevenLabs
        try:
            elevenlabs_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
            audio = elevenlabs_client.generate(
                text=enhanced_text,
                voice=Voice(
                    voice_id=voice_id,
                    settings=VoiceSettings(
                        stability=0.75,
                        similarity_boost=0.75,
                        style=0.5,
                        use_speaker_boost=True
                    )
                ),
                model="eleven_multilingual_v2"
            )
            
            # Convert to base64 for response
            audio_base64 = base64.b64encode(audio).decode('utf-8')
            
            logger.info("✅ [AUDIO] ElevenLabs audio generated successfully")
            return {
                "audio_url": f"data:audio/mp3;base64,{audio_base64}",
                "status": "success",
                "provider": "elevenlabs",
                "voice_id": voice_id
            }
            
        except Exception as e:
            logger.error(f"❌ [AUDIO] ElevenLabs generation failed: {e}")
            return await generate_fallback_audio(text)
        
    except Exception as e:
        logger.error(f"💥 Error generating audio: {str(e)}")
        return {
            "audio_url": None,
            "status": "error",
            "error": str(e)
        }

async def generate_fallback_audio(text: str):
    """Generate audio using Google TTS as fallback"""
    try:
        logger.info("🔄 [AUDIO] Using Google TTS as fallback")
        
        # Create TTS audio using Google TTS
        tts = gTTS(text=text, lang='id', slow=False)
        
        # Save to temporary file
        temp_audio = io.BytesIO()
        tts.write_to_fp(temp_audio)
        temp_audio.seek(0)
        
        # Convert to base64
        audio_base64 = base64.b64encode(temp_audio.getvalue()).decode('utf-8')
        
        logger.info("✅ [AUDIO] Fallback audio generated successfully")
        return {
            "audio_url": f"data:audio/mp3;base64,{audio_base64}",
            "status": "success",
            "provider": "google_tts"
        }
        
    except Exception as e:
        logger.error(f"❌ [AUDIO] Fallback audio generation failed: {e}")
        return {
            "audio_url": None,
            "status": "error",
            "error": str(e)
        }

@router.post("/generate-image")
async def generate_image(request: dict):
    """Generate image using Replicate AI image generation"""
    try:
        prompt = request.get("prompt", "")
        logger.info(f"🎨 [IMAGE] Starting AI image generation with prompt: {prompt[:100]}...")
        
        # Extract story elements if available
        story_content = request.get("story_content", "")
        child_name = request.get("child_name", "Anak")
        child_interests = request.get("child_interests", "belajar")
        
        # Generate optimized image description
        if prompt:
            image_description = prompt
        else:
            image_description = generate_image_description(
                story_title=f"Cerita {child_name}", 
                child_name=child_name, 
                child_interests=child_interests
            )
        
        # Generate AI image using Replicate
        image_url = await generate_ai_image(image_description)
        
        if image_url:
            logger.info("✅ [IMAGE] AI image generated successfully")
            return {
                "image_url": image_url,
                "image_path": image_url,
                "status": "success",
                "provider": "replicate_ai"
            }
        else:
            logger.warning("⚠️ [IMAGE] AI image generation failed, using fallback")
            return {
                "image_url": "/assets/scenes/default.jpg",
                "image_path": "/assets/scenes/default.jpg", 
                "status": "fallback"
            }
        
    except Exception as e:
        logger.error(f"💥 Error generating image: {str(e)}", exc_info=True)
        return {
            "image_url": "/assets/scenes/default.jpg",
            "image_path": "/assets/scenes/default.jpg",
            "status": "error",
            "error": str(e)
        }