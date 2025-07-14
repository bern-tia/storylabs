from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import story
import logging
import os
import sys

# Configure comprehensive logging
logging.basicConfig(
    level=logging.DEBUG,  # Changed from INFO to DEBUG for more verbose logging
    format='%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.StreamHandler(sys.stdout),  # Ensure logs go to stdout
        logging.StreamHandler(sys.stderr)   # Also send to stderr for errors
    ]
)

# Set specific loggers
logger = logging.getLogger(__name__)
uvicorn_logger = logging.getLogger("uvicorn")
uvicorn_error_logger = logging.getLogger("uvicorn.error")
uvicorn_access_logger = logging.getLogger("uvicorn.access")

# Set levels for uvicorn loggers
uvicorn_logger.setLevel(logging.DEBUG)
uvicorn_error_logger.setLevel(logging.DEBUG)
uvicorn_access_logger.setLevel(logging.INFO)

logger.info("🚀 Initializing StoryLabs Application...")

app = FastAPI(
    title="StoryLabs Financial Literacy API", 
    description="API untuk membuat cerita literasi keuangan anak-anak Indonesia",
    debug=True  # Enable debug mode
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enhanced middleware with error logging
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"🔄 Incoming request: {request.method} {request.url}")
    logger.debug(f"📋 Headers: {dict(request.headers)}")
    
    try:
        response = await call_next(request)
        logger.info(f"✅ Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"❌ Error processing request {request.method} {request.url}: {str(e)}", exc_info=True)
        raise

# Include routers
app.include_router(story.router, prefix="/api/story", tags=["story"])

@app.on_event("startup")
async def startup_event():
    logger.info("🎬 Starting FastAPI application...")
    
    # Log environment info
    logger.info(f"🐍 Python version: {sys.version}")
    logger.info(f"🔧 Working directory: {os.getcwd()}")
    
    # Log Gemini API key status (last 3 chars only for security)
    gemini_key = "AIzaSyBsWCBiLjOQvkjHoNBjjskQ4tjRyK559SQ"
    if gemini_key:
        logger.info(f"🔑 GEMINI_API_KEY is SET (ends with ...{gemini_key[-3:]})")
    else:
        logger.error("❌ NO GEMINI API KEY FOUND! Please check your .env file")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"💥 Unhandled exception for {request.method} {request.url}: {str(exc)}", exc_info=True)
    return {"error": "Internal server error", "detail": str(exc)}

@app.get("/")
async def root():
    logger.info("📍 Root endpoint accessed")
    return {"message": "StoryLabs API is running!", "status": "healthy"}