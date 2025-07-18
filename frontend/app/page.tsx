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

// Story selection service for prototype
const selectStoryFromBanks = async (userInfo: { name: string; age: string; hobby: string; theme: string }) => {
  try {
    log('info', 'Selecting story from story banks', { userInfo });
    
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
    
    // Select first story for prototype (can be randomized later)
    const selectedStory = ageGroup.stories[0];
    
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
      age: userAge
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

