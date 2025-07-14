# Financial Literacy StoryLabs 💰📚

An interactive AI-powered storytelling platform that teaches financial literacy to children through engaging, personalized stories. **Now COMPLETELY powered by Google services - FREE and simple!**

## What This Does 🎯

This app creates personalized interactive stories that teach kids about money, saving, spending, and financial responsibility through:
- **Personalized Characters**: Stories feature the child's name and interests
- **Age-Appropriate Concepts**: Financial lessons tailored to different age groups
- **Interactive Elements**: Voice-based choices and engagement
- **Multimedia Experience**: Generated images, audio narration, and text
- **Completely FREE**: Powered entirely by Google's free tier services!

## Financial Literacy Topics by Age 📊

### Ages 4-6: Basic Money Concepts
- What is money?
- Coins and bills recognition
- Needs vs. wants
- Simple saving concepts
- Sharing and being generous

### Ages 7-9: Money Management Basics
- Earning money through chores
- Smart spending decisions
- Setting financial goals
- Banking basics
- Budgeting concepts

### Ages 10-12: Advanced Financial Concepts
- Entrepreneurship basics
- Investment concepts
- Comparison shopping
- Financial planning
- Money and emotions

## 🆓 Completely Google-Powered & FREE!

### Why This is Amazing:
- **Story Generation**: Google Gemini (FREE tier!)
- **Image Generation**: Google Gemini (FREE tier!)
- **Voice Synthesis**: Google Text-to-Speech (FREE!)
- **Total Monthly Cost**: $0 for basic usage
- **Setup Complexity**: Only ONE API key needed!

### Previous vs. Now:
| Feature | Before | Now |
|---------|--------|-----|
| Story Generation | OpenAI ($15-25/month) | Google Gemini (FREE!) |
| Image Generation | Replicate ($3-10/month) | Google Gemini (FREE!) |
| Voice Synthesis | ElevenLabs ($5-15/month) | Google TTS (FREE!) |
| **Total Cost** | **$25-50/month** | **$0/month** |
| API Keys Needed | 3-4 different services | 1 (just Gemini!) |

## Tech Stack 🛠️

### Backend
- **FastAPI** - Modern Python web framework
- **Google Gemini** - Story generation AND image generation
- **Google Text-to-Speech** - Voice synthesis
- **Poetry** - Dependency management

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Development environment

## Prerequisites 📋

### Required (FREE!)
1. **Google Gemini API Key** - Get free at [aistudio.google.com](https://aistudio.google.com)
   - No payment method required
   - Generous free tier
   - Handles both stories AND images

### Optional
1. **ElevenLabs API Key** - For premium voices (basic plan $5/month)
   - We use Google TTS by default (free)
   - Only needed if you want premium voice quality

### Software
1. **Docker Desktop** - For easy setup
2. **Git** - To clone the repository

## Quick Start 🚀

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd financial-literacy-storylabs
```

### 2. Get Your FREE Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click "Get API Key"
3. Create a new project (free)
4. Copy your API key

### 3. Set Up Environment
```bash
# Copy environment files
cp backend/env.example backend/.env
cp frontend/env.local.example frontend/.env.local

# Edit backend/.env and add:
GEMINI_API_KEY=your-gemini-api-key-here
ACCESS_CODE=your-chosen-password-here
```

### 4. Run with Docker
```bash
# Start the application
docker-compose -f docker-compose.dev.yml up --build

# The app will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

## Usage Guide 💡

### Creating Stories
1. Open http://localhost:3000
2. Click "Show API Keys" and enter:
   - Access Code: (your chosen password)
   - Gemini API Key: (your free Google API key)
3. Fill in child information:
   - Name, age (4-12), interests
   - Choose a financial focus topic
4. Click "Create Financial Story"
5. Watch as the app generates:
   - Personalized story text
   - Custom illustrations
   - Audio narration

### Features
- **Interactive Stories**: Choose-your-own-adventure style
- **Educational Content**: Age-appropriate financial concepts
- **Multimedia**: Text, images, and audio
- **Personalization**: Based on child's name, age, and interests
- **Progress Tracking**: Stories build on previous concepts

## Cost Breakdown 💰

### Google Gemini (FREE Tier Limits)
- **Text Generation**: 15 requests per minute, 1500 per day
- **Image Generation**: 15 requests per minute, 1500 per day
- **Cost**: $0/month for typical usage

### For Heavy Usage (if you exceed free tier)
- **Gemini Pro**: ~$0.001 per 1K characters
- **Typical Story**: ~2K characters = $0.002
- **Image Generation**: ~$0.002 per image
- **Total per story**: ~$0.004 (less than 1 cent!)

## Development 🔧

### Local Development Setup
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

### Project Structure
```
financial-literacy-storylabs/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/        # API routes
│   │   ├── storybuilder/         # Story generation logic
│   │   └── main.py              # FastAPI app
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile              # Backend container
├── frontend/
│   ├── app/                    # Next.js app directory
│   ├── components/             # React components
│   ├── src/                    # Services and utilities
│   └── package.json           # Node dependencies
└── docker-compose.dev.yml     # Development environment
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Support 💬

- **Documentation**: Check the SETUP_GUIDE.md for detailed setup instructions
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Questions**: Use GitHub Discussions for general questions

## Acknowledgments 🙏

- **Google** for providing amazing free AI services
- **FastAPI** and **Next.js** communities
- **Financial literacy educators** who inspired this project

---

**Ready to teach kids about money through engaging AI stories? Get started with just one free API key! 🎉** 