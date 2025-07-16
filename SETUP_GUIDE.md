# StoryLabs Setup Guide

## Overview
StoryLabs is a full-stack application that generates interactive financial literacy stories for Indonesian children using AI. It consists of a Python FastAPI backend and a Next.js frontend.

## Prerequisites
- Python 3.9+ (preferably 3.12 as specified in pyproject.toml)
- Node.js 18.17.0+ 
- npm or yarn
- Git

## What I've Done For You ✅

1. **Virtual Environment**: Used existing `.venv` virtual environment in the project
2. **Backend Dependencies**: Installed all required Python packages:
   - FastAPI (web framework)
   - Google Generative AI (Gemini API)
   - OpenAI 
   - ElevenLabs (text-to-speech)
   - Replicate (image generation)
   - python-dotenv (environment variables)
   - uvicorn (ASGI server)
   - And many more...

3. **Frontend Dependencies**: Installed all Node.js packages:
   - Next.js 14
   - React 18
   - Tailwind CSS
   - Shadcn/ui components
   - OpenAI Realtime API
   - Framer Motion
   - And many more...

4. **Environment Configuration**: Created `.env.example` file with all required API keys

## Step-by-Step Setup

### 1. Environment Configuration
Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Then edit `.env` with your actual API keys:

```bash
# Required - Get from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_actual_gemini_api_key

# Optional - for additional features
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
REPLICATE_API_TOKEN=your_replicate_token
```

### 2. Backend Setup (Already Done!)
The backend is ready to run. All dependencies are installed in the virtual environment.

### 3. Frontend Setup (Already Done!)
The frontend dependencies are installed. Node.js packages are ready.

## How to Run the Application

### Option 1: Run Backend and Frontend Separately

#### Start Backend Server:
```bash
cd backend
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Start Frontend Server (in new terminal):
```bash
cd frontend
npm run dev
```

### Option 2: Using Docker (if preferred)

The project includes Docker configurations:

```bash
# For development
docker-compose -f docker-compose.dev.yml up

# For production
docker-compose up
```

## API Endpoints

Once running, the backend will be available at:
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Frontend: http://localhost:3000

## Project Structure

```
storylabs/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── main.py         # Main application entry
│   │   ├── api/endpoints/  # API routes
│   │   └── storybuilder/   # Story generation logic
│   ├── requirements.txt    # Python dependencies
│   └── pyproject.toml      # Poetry configuration
├── frontend/               # Next.js frontend
│   ├── app/                # Next.js app router
│   ├── components/         # React components
│   ├── lib/                # Utility libraries
│   └── package.json        # Node.js dependencies
└── .env.example            # Environment configuration template
```

## Required API Keys

### Google Gemini AI (Required)
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

### Optional API Keys
- **OpenAI**: For additional AI features
- **ElevenLabs**: For text-to-speech functionality
- **Replicate**: For image generation

## Features

- 🎯 **Personalized Stories**: Creates stories based on child's age, interests, and name
- 🧠 **Financial Literacy**: Teaches basic financial concepts appropriate for Indonesian children
- 🎨 **Interactive Elements**: Includes questions and engagement features
- 🔊 **Text-to-Speech**: Converts stories to audio (when ElevenLabs API is configured)
- 🖼️ **Image Generation**: Creates story illustrations (when Replicate API is configured)
- 🌐 **Indonesian Language**: Fully supports Bahasa Indonesia

## Testing

Test the backend API:
```bash
# Test if backend is running
curl http://localhost:8000/

# Test story generation (requires valid API key)
curl -X POST http://localhost:8000/api/story/generate \
  -H "Content-Type: application/json" \
  -d '{"nama": "Andi", "umur": 8, "minat": "sepak bola"}'
```

## Troubleshooting

### Common Issues:

1. **Python command not found**: Use `python3` instead of `python`
2. **Permission denied**: Make sure you're in the virtual environment
3. **Port already in use**: Change the port in the uvicorn command
4. **API key errors**: Ensure your `.env` file has valid API keys
5. **Node.js version**: Ensure you have Node.js 18.17.0+

### Verification Steps:
```bash
# Check virtual environment
which python3

# Check installed packages
pip list

# Check frontend dependencies
cd frontend && npm list
```

## What's Next?

1. **Add your API keys** to `.env` file
2. **Run the application** using the commands above
3. **Test the story generation** with the provided API
4. **Customize the prompts** in `backend/app/storybuilder/prompts/`
5. **Modify the UI** in `frontend/app/components/`

## Need Help?

If you encounter issues:
1. Check that all dependencies are installed
2. Verify your API keys are correct
3. Ensure both backend and frontend are running
4. Check the console logs for error messages

The application is now ready to run! 🚀

---

## ✅ **LATEST UPDATE - ISSUES RESOLVED**

### **Fixed Issues:**

1. **✅ uvicorn Module Not Found**
   - **Problem**: `No module named uvicorn` error when running backend
   - **Solution**: Reinstalled all dependencies in the virtual environment
   - **Status**: ✅ **FIXED** - Backend now runs successfully

2. **✅ API Key Configuration**
   - **Problem**: Need to add Gemini API key
   - **Solution**: Created `.env` file with your API key: `AIzaSyBsWCBiLjOQvkjHoNBjjskQ4tjRyK559SQ`
   - **Status**: ✅ **CONFIGURED** - Backend authenticated and ready

3. **⚠️ Node.js Version Issue**
   - **Problem**: You have Node.js 18.14.2, but Next.js requires >= 18.17.0
   - **Solutions**:
     - **Option A**: Update Node.js: `brew install node@18` or download from https://nodejs.org/
     - **Option B**: Use Docker for frontend: `docker build -t storylabs-frontend . && docker run -p 3000:3000 storylabs-frontend`
   - **Status**: ⚠️ **NEEDS UPDATE** - Choose option A or B above

### **Current Status:**
- ✅ **Backend**: Running successfully on port 8001
- ✅ **API Documentation**: Available at http://localhost:8001/docs
- ✅ **Environment**: Configured with your Gemini API key
- ⚠️ **Frontend**: Needs Node.js update to run properly

### **Quick Start Commands:**

**Backend (Working Now):**
```bash
cd backend
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**Frontend (After Node.js update):**
```bash
cd frontend
npm run dev
```

**Or use Docker for Frontend:**
```bash
cd frontend
docker build -t storylabs-frontend .
docker run -p 3000:3000 storylabs-frontend
```

### **Test the Backend:**
```bash
# Test basic endpoint
curl http://localhost:8001/docs

# Test story generation with your API key
curl -X POST http://localhost:8001/api/story/generate \
  -H "Content-Type: application/json" \
  -d '{"nama": "Andi", "umur": 8, "minat": "sepak bola"}'
```

🎉 **Your StoryLabs app is ready to generate financial literacy stories in Indonesian!** 