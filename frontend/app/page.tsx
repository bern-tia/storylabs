'use client'

import { useState } from 'react'
import LandingPage from './components/LandingPage'
import UserInputForm from './components/UserInputForm'
import StoryInterface from './components/StoryInterface'
import ProgressBar from './components/ProgressBar';
import { LoadingSpinner } from './components/LoadingSpinner';

// Enhanced logging function with timestamps
const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const emoji = level === 'info' ? '📝' : level === 'warn' ? '⚠️' : '❌';
  console[level](`${emoji} [${timestamp}] [HomePage] ${message}`, data ? data : '');
};

// Story selection service for prototype with hobby-based selection
const selectStoryFromBanks = async (userInfo: { name: string; age: string; hobby: string; theme: string }) => {
  try {
    log('info', 'Selecting story from story banks with hobby consideration', { userInfo });
    
    // Load story banks
    const response = await fetch('/story_banks.json');
    const storyBanks = await response.json();
    
    // Find theme in story banks
    const themeData = storyBanks.themes.find((t: any) => t.name === userInfo.theme);
    if (!themeData) {
      throw new Error(`Theme not found: ${userInfo.theme}`);
    }
    
    // Find appropriate age group
    const userAge = parseInt(userInfo.age);
    const ageGroup = themeData.age_groups.find((group: any) => 
      group.ages.includes(userAge)
    );
    
    if (!ageGroup || !ageGroup.stories.length) {
      throw new Error(`No stories found for age ${userAge} in theme ${userInfo.theme}`);
    }
    
    // First, try to find a story that matches the user's hobby exactly
    let selectedStory = ageGroup.stories.find((story: any) => 
      story.hobby && story.hobby.toLowerCase() === userInfo.hobby.toLowerCase()
    );
    
    // If no exact match, try to find a story with similar hobby
    if (!selectedStory) {
      // Create a mapping of hobby variations
      const hobbyVariations: { [key: string]: string[] } = {
        'menggambar': ['menggambar', 'lukis', 'seni'],
        'membaca buku': ['membaca buku', 'membaca', 'buku'],
        'berkebun': ['berkebun', 'tanam', 'kebun'],
        'olahraga': ['olahraga', 'sepak bola', 'badminton', 'berenang'],
        'main musik': ['main musik', 'musik', 'gitar', 'piano'],
        'fotografi': ['fotografi', 'foto', 'memotret'],
        'mobil-mobilan': ['mobil-mobilan', 'mobil', 'mainan mobil']
      };
      
      // Find matching hobby variation
      for (const [baseHobby, variations] of Object.entries(hobbyVariations)) {
        if (variations.some(v => userInfo.hobby.toLowerCase().includes(v))) {
          selectedStory = ageGroup.stories.find((story: any) => 
            story.hobby && story.hobby.toLowerCase() === baseHobby.toLowerCase()
          );
          if (selectedStory) break;
        }
      }
    }
    
    // If still no match found, use the first story as fallback
    if (!selectedStory) {
      selectedStory = ageGroup.stories[0];
      log('info', 'No hobby-specific story found, using fallback story', {
        requestedHobby: userInfo.hobby,
        selectedStoryTitle: selectedStory.title,
        fallback: true,
        availableHobbies: ageGroup.stories.map((s: any) => s.hobby)
      });
    } else {
      log('info', 'Found hobby-specific story', {
        requestedHobby: userInfo.hobby,
        selectedStoryTitle: selectedStory.title,
        hobbyMatch: true,
        matchedHobby: selectedStory.hobby
      });
    }
    
    // Replace <nama> placeholder with actual name
    const processedStory = {
      ...selectedStory,
      title: selectedStory.title.replace(/<nama>/g, userInfo.name),
      story: selectedStory.story.map((part: any) => ({
        ...part,
        content: part.content?.replace(/<nama>/g, userInfo.name),
        question: part.question?.replace(/<nama>/g, userInfo.name)
      }))
    };
    
    log('info', 'Story selected successfully', { 
      storyTitle: processedStory.title,
      partsCount: processedStory.story.length,
      theme: userInfo.theme,
      age: userAge,
      hobby: userInfo.hobby,
      hobbyMatched: !!selectedStory.hobby
    });
    
    return processedStory;
    
  } catch (error) {
    log('error', 'Failed to select story', { error });
    throw error;
  }
};

export default function Home() {
  const [stage, setStage] = useState('landing')
  const [userInfo, setUserInfo] = useState({ name: '', age: '', interests: '', hobby: '', theme: '' })
  const [isGenerating, setIsGenerating] = useState(false);
  const [story, setStory] = useState(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  log('info', 'Home component rendered', {
    stage,
    hasUserInfo: !!(userInfo.name && userInfo.age && userInfo.hobby),
    isGenerating,
    hasStory: !!story,
    hasError: !!generationError
  });

  const handleStart = () => {
    log('info', '🚀 User clicked start button');
    setStage('userInput');
  };

  const handleUserInfoSubmit = async (info: typeof userInfo) => {
    const startTime = Date.now();
    log('info', '📝 User submitted info - starting story selection process', {
      userInfo: info,
      previousStage: stage
    });

    setUserInfo(info);
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      log('info', '📚 Selecting story from story banks');
      const selectedStory = await selectStoryFromBanks(info);
      
      const totalTime = Date.now() - startTime;
      log('info', '✅ Story selection completed successfully', {
        storyTitle: selectedStory?.title || 'N/A',
        hasStory: !!selectedStory,
        totalTime: `${totalTime}ms`,
        partsCount: selectedStory?.story?.length || 0
      });

      setStory(selectedStory);
      setStage('story');
      
    } catch (error) {
      const totalTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      log('error', '💥 Story selection failed', {
        error: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        totalTime: `${totalTime}ms`,
        userInfo: info
      });
      
      setGenerationError(errorMessage);
      
      // Stay on userInput stage to allow retry
      log('info', 'Staying on userInput stage for retry');
      
    } finally {
      setIsGenerating(false);
      log('info', '🏁 Story selection process finished', {
        success: !generationError,
        stage: story ? 'story' : 'userInput',
        isGenerating: false
      });
    }
  };

  const handleStartNewStory = () => {
    log('info', '🔄 User requested new story', {
      previousStory: story?.title || 'N/A',
      keepingUserInfo: !!(userInfo.name && userInfo.age && userInfo.hobby)
    });
    
    setStage('userInput');
    setStory(null);
    setGenerationError(null);
    
    log('info', 'Reset complete - returning to userInput stage');
  };

  // Render different stages
  if (isGenerating) {
    log('info', '⏳ Rendering loading state');
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-orange-400 to-blue-600">
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
          <p className="ml-2 text-white">Memilih cerita yang tepat untukmu...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-orange-400 to-blue-600">
      {stage === 'landing' && (
        <>
          {log('info', '🏠 Rendering landing page')}
          <LandingPage onStart={handleStart} />
        </>
      )}
      
      {stage === 'userInput' && (
        <>
          {log('info', '📝 Rendering user input form', { 
            hasExistingUserInfo: !!(userInfo.name && userInfo.age && userInfo.hobby),
            hasError: !!generationError
          })}
          <UserInputForm 
            onSubmit={handleUserInfoSubmit} 
          />
          {generationError && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {generationError}
            </div>
          )}
        </>
      )}
      
      {stage === 'story' && (
        <>
          {log('info', '📖 Rendering story interface', {
            storyTitle: story?.title || 'N/A',
            userInfo
          })}
          <StoryInterface 
            userInfo={userInfo} 
            story={story} 
            generationError={generationError}
            onStartNewStory={handleStartNewStory}
          />
        </>
      )}
    </main>
  )
}

