'use client'

import { useState } from 'react'
import LandingPage from './components/LandingPage'
import UserInputForm from './components/UserInputForm'
import StoryInterface from './components/StoryInterface'
import { generateStory } from '../src/services/api';
import ProgressBar from './components/ProgressBar';
import { LoadingSpinner } from './components/LoadingSpinner';

// Enhanced logging function with timestamps
const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const emoji = level === 'info' ? '📝' : level === 'warn' ? '⚠️' : '❌';
  console[level](`${emoji} [${timestamp}] [HomePage] ${message}`, data ? data : '');
};

export default function Home() {
  const [stage, setStage] = useState('landing')
  const [userInfo, setUserInfo] = useState({ name: '', age: '', interests: '' })
  const [isGenerating, setIsGenerating] = useState(false);
  const [story, setStory] = useState(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  log('info', 'Home component rendered', {
    stage,
    hasUserInfo: !!(userInfo.name && userInfo.age && userInfo.interests),
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
    log('info', '📝 User submitted info - starting story generation process', {
      userInfo: info,
      previousStage: stage
    });

    setUserInfo(info);
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      log('info', '🎬 Calling generateStory API');
      const { story } = await generateStory(info);
      
      const totalTime = Date.now() - startTime;
      log('info', '✅ Story generation completed successfully', {
        storyTitle: story?.main?.title || 'N/A',
        hasStory: !!story,
        totalTime: `${totalTime}ms`,
        scenesCount: story?.scenes?.length || 0,
        charactersCount: story?.characters?.length || 0
      });

      setStory(story);
      setStage('story');
      
    } catch (error) {
      const totalTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      log('error', '💥 Story generation failed in main component', {
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
      log('info', '🏁 Story generation process finished', {
        success: !generationError,
        stage: story ? 'story' : 'userInput',
        isGenerating: false
      });
    }
  };

  const handleStartNewStory = () => {
    log('info', '🔄 User requested new story', {
      previousStory: story?.main?.title || 'N/A',
      keepingUserInfo: !!(userInfo.name && userInfo.age && userInfo.interests)
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-purple-500">
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
          <p className="ml-2 text-white">Generating your story. This should take less than a minute...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-purple-500">
      {stage === 'landing' && (
        <>
          {log('info', '🏠 Rendering landing page')}
          <LandingPage onStart={handleStart} />
        </>
      )}
      
      {stage === 'userInput' && (
        <>
          {log('info', '📝 Rendering user input form', { 
            hasExistingUserInfo: !!(userInfo.name && userInfo.age && userInfo.interests),
            hasError: !!generationError
          })}
          <UserInputForm 
            onSubmit={handleUserInfoSubmit} 
          />
        </>
      )}
      
      {stage === 'story' && (
        <>
          {log('info', '📖 Rendering story interface', {
            storyTitle: story?.main?.title || 'N/A',
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

