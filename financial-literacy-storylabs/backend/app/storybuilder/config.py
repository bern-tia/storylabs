"""
Configuration settings for Financial Literacy StoryLabs (Gemini Version)
"""

# Google Gemini model configuration
model = "gemini-1.5-flash"  # Google Gemini model for story generation
image_model = "gemini-2.0-flash-preview-image-generation"  # Gemini model for image generation
fallback_model = "gemini-1.5-pro"  # Fallback model if primary is unavailable

# Story generation settings
MAX_STORY_LENGTH = 15  # Maximum story length in minutes
MIN_STORY_LENGTH = 8   # Minimum story length in minutes
MAX_CHARACTERS = 4     # Maximum number of characters in a story
MIN_CHARACTERS = 2     # Minimum number of characters (including Financial Guide)

# Financial literacy settings
FINANCIAL_CONCEPTS_PER_STORY = 2  # Number of financial concepts to teach per story
MAX_CHILD_AGE = 12               # Maximum age for stories
MIN_CHILD_AGE = 4                # Minimum age for stories

# Age group mappings
AGE_GROUPS = {
    "4-6": "Kesadaran Keuangan Awal",
    "7-9": "Dasar Pengelolaan Uang", 
    "10-12": "Konsep Keuangan Lanjutan"
}

# Default characters for financial literacy stories
DEFAULT_CHARACTERS = [
    {
        "name": "Panduan Keuangan",
        "role": "Narator yang membantu menjelaskan konsep keuangan",
        "personality": "bijak, sabar, mendorong",
        "voice": "hangat dan edukatif"
    },
    {
        "name": "Penny Si Celengan",
        "role": "Karakter celengan yang mengajarkan tentang menabung",
        "personality": "antusias, bertanggung jawab, berorientasi pada tujuan",
        "voice": "ceria dan memotivasi"
    },
    {
        "name": "Rupiah Si Anjing",
        "role": "Karakter yang mengajarkan tentang menghasilkan dan berbelanja bijak",
        "personality": "praktis, pekerja keras, cerdas",
        "voice": "percaya diri dan ramah"
    }
]

# Image generation settings for Gemini
IMAGE_STYLE = "Gaya ilustrasi yang ramah anak, berwarna-warni, seperti kartun, edukatif, cerah dan menarik, dengan konteks budaya Indonesia"
IMAGE_SAFETY_PROMPT = "Aman untuk anak-anak, konten edukatif, tidak ada elemen yang menakutkan atau tidak pantas, sesuai dengan budaya Indonesia"

# Audio generation settings
AUDIO_SPEED = 1.0  # Normal speed for text-to-speech
AUDIO_VOLUME = 0.8          # Volume level
PREFERRED_AUDIO_PROVIDER = "google"  # "google" or "elevenlabs"

# Story validation settings
REQUIRED_STORY_ELEMENTS = [
    "financial_concept_explanation",
    "interactive_choice",
    "positive_reinforcement",
    "real_world_application",
    "learning_summary"
]

# Error handling
MAX_RETRIES = 3
RETRY_DELAY = 1  # seconds

# API rate limiting
MAX_REQUESTS_PER_MINUTE = 10
MAX_REQUESTS_PER_HOUR = 100 