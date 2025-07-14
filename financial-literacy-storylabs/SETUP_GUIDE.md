# 🚀 Financial Literacy StoryLabs Setup Guide (Google-Only Edition)

*The complete step-by-step guide to get your financial literacy story generator running - now with just ONE free API key!*

## 📋 What You'll Need

### 1. Software to Install
- **Docker Desktop** - Handles all the technical setup automatically
- **A web browser** - Chrome, Firefox, Safari, or Edge

### 2. API Keys (FREE!)
- **Google Gemini API Key** - For EVERYTHING (stories, images, and voice) **100% FREE!**
- **ElevenLabs API Key** - Optional, only for premium voices

### 3. Time Required
- **First time setup**: 10-15 minutes (much faster than before!)
- **Running the app**: 2-3 minutes each time after setup

---

## 🔧 Step-by-Step Setup

### Step 1: Install Docker Desktop

1. **Download Docker Desktop**
   - Go to [docker.com/get-started](https://www.docker.com/get-started)
   - Click "Download for Mac" or "Download for Windows"
   - Install and restart your computer

2. **Verify Docker is Running**
   - Look for the Docker whale icon in your system tray/menu bar
   - It should say "Docker Desktop is running"

### Step 2: Get Your FREE Google Gemini API Key 🆓

This is the ONLY API key you need!

1. **Go to Google AI Studio**
   - Visit [aistudio.google.com](https://aistudio.google.com)
   - Sign in with any Google account (Gmail, etc.)

2. **Create Your FREE API Key**
   - Click "Get API Key" button
   - Click "Create API Key in new project"
   - Copy the API key (starts with "AI...")
   - **No payment method required!**

### Step 3: Download the Project

1. **Download the Code**
   ```bash
   # If you have git:
   git clone <your-repo-url>
   cd financial-literacy-storylabs
   
   # Or download ZIP from GitHub and extract it
   ```

### Step 4: Configure Your API Keys

1. **Set Up Backend Environment**
   ```bash
   # Copy the example file
   cp backend/env.example backend/.env
   ```

2. **Edit backend/.env file** (use any text editor)
   ```env
   # Required: Your FREE Gemini API key
   GEMINI_API_KEY=your-gemini-api-key-here
   
   # Required: Choose any password for your app
   ACCESS_CODE=my-secure-password
   
   # Optional: Only needed for premium voices
   ELEVENLABS_API_KEY=your-elevenlabs-key-here
   ```

3. **Set Up Frontend Environment**
   ```bash
   # Copy the example file
   cp frontend/env.local.example frontend/.env.local
   ```

### Step 5: Start the Application

1. **Run the App**
   ```bash
   # Navigate to the project folder
   cd financial-literacy-storylabs
   
   # Start everything (this may take 5-10 minutes the first time)
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Wait for Startup**
   - You'll see lots of text scrolling
   - Wait until you see "Application startup complete"
   - **Backend**: Running on http://localhost:8000
   - **Frontend**: Running on http://localhost:3000

### Step 6: Use Your Financial Literacy App! 🎉

1. **Open Your Browser**
   - Go to http://localhost:3000
   - You should see the Financial Literacy StoryLabs homepage

2. **Enter Your API Key**
   - Click "Show API Keys"
   - Enter your access code (from step 4)
   - Enter your Gemini API key (from step 2)
   - Leave ElevenLabs blank (unless you have one)

3. **Create Your First Story**
   - Fill in child information:
     - Name: "Sarah"
     - Age: "7 years old"
     - Interests: "animals and art"
     - Financial Focus: "Saving money"
   - Click "Create Financial Story"
   - Wait 30-60 seconds for the magic! ✨

---

## 🎯 What Happens When You Generate a Story

### The Process (About 60 seconds total)
1. **Story Creation** (30 seconds) - Gemini writes a personalized story
2. **Image Generation** (20 seconds) - Gemini creates custom illustrations
3. **Audio Generation** (10 seconds) - Google TTS creates narration

### What You Get
- **Personalized Story**: Features the child's name and interests
- **Custom Images**: AI-generated illustrations for each scene
- **Audio Narration**: The story read aloud with natural voices
- **Interactive Elements**: Choices for the child to make
- **Educational Content**: Age-appropriate financial lessons

---

## 🆓 Why This is Amazing (Cost Comparison)

### Old Setup (Multiple Services)
- OpenAI: $15-25/month
- Replicate: $3-10/month  
- ElevenLabs: $5-15/month
- **Total: $25-50/month**
- **API Keys: 3-4 different services**

### New Setup (Google-Only!)
- Google Gemini: **FREE!**
- Google TTS: **FREE!**
- **Total: $0/month**
- **API Keys: Just 1!**

### Free Tier Limits (More Than Enough!)
- **15 stories per minute** (you'll never hit this)
- **1,500 stories per day** (enough for a school!)
- **Stories + Images + Audio: All FREE**

---

## 🔧 Troubleshooting

### Common Issues & Solutions

**❌ "Docker not found"**
- Install Docker Desktop from docker.com
- Restart your computer
- Make sure Docker is running (whale icon in system tray)

**❌ "Gemini API key invalid"**
- Double-check you copied the full key (starts with "AI...")
- Make sure there are no extra spaces
- Try generating a new key from Google AI Studio

**❌ "Port already in use"**
```bash
# Stop any running services
docker-compose -f docker-compose.dev.yml down

# Start fresh
docker-compose -f docker-compose.dev.yml up --build
```

**❌ "Story generation failed"**
- Check your internet connection
- Verify your Gemini API key is correct
- Try a simpler child interest like "animals" or "toys"

**❌ "Images not generating"**
- This is normal - images use the same Gemini API
- If stories work but images don't, check your API key
- Images might take 20-30 seconds to appear

### Getting Help

1. **Check Docker**: Make sure Docker Desktop is running
2. **Check Logs**: Look at the terminal output for error messages
3. **Restart**: `docker-compose down` then `docker-compose up`
4. **Ask for Help**: Create an issue on GitHub with your error message

---

## 🎮 Tips for Best Results

### Story Input Tips
- **Child Interests**: Be specific! "dinosaurs and building blocks" works better than just "toys"
- **Age**: The app automatically adjusts complexity for different ages
- **Financial Focus**: "Let the app choose!" often gives the best results

### Making Stories More Engaging
- **Read Together**: Sit with your child and read the story aloud
- **Discuss Concepts**: Talk about the financial lessons after the story
- **Make Choices**: Let your child choose what the character should do
- **Create Series**: Generate multiple stories with the same character

### For Educators
- **Classroom Use**: Generate stories for different age groups
- **Lesson Plans**: Use stories as starting points for financial discussions
- **Progress Tracking**: Keep notes on which concepts each child has learned

---

## 🔄 Running the App Again

After the initial setup:

```bash
# Navigate to your project folder
cd financial-literacy-storylabs

# Start the app (much faster after first time!)
docker-compose -f docker-compose.dev.yml up

# When you're done:
# Press Ctrl+C to stop the app
```

---

## 🌟 Next Steps

### Explore the Features
- Try different financial focus topics
- Create stories for different age groups
- Experiment with various child interests

### Share with Others
- Teachers: Use in financial literacy curriculum
- Parents: Create bedtime stories that teach money concepts
- Librarians: Offer interactive story sessions

### Customize Further
- Check the `prompts` folder to modify story templates
- Adjust age groups in the configuration
- Add new financial concepts

---

## 🎉 Congratulations!

You now have a completely FREE, AI-powered financial literacy story generator running on your computer! 

**What you accomplished:**
- ✅ Set up a full-stack AI application
- ✅ Connected to Google's powerful AI services
- ✅ Created a tool that can teach kids about money
- ✅ Did it all for FREE with just one API key!

**Ready to create some amazing financial literacy stories? Open http://localhost:3000 and start teaching kids about money through AI-powered storytelling! 💰📚** 