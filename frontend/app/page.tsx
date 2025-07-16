'use client'

import { useState } from 'react'
import LandingPage from './components/LandingPage'
import UserInputForm from './components/UserInputForm'
import StoryInterface from './components/StoryInterface'
import { generateStory } from '../src/services/api';
import ProgressBar from './components/ProgressBar';
import { LoadingSpinner } from './components/LoadingSpinner';



export default function Home() {
  const [stage, setStage] = useState('landing')
  const [userInfo, setUserInfo] = useState({ name: '', age: '', interests: '' })
  const [isGenerating, setIsGenerating] = useState(false);
  const [story, setStory] = useState(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleStart = () => setStage('userInput')
  const handleUserInfoSubmit = async (info: typeof userInfo) => {
    console.log('Setting user info that was submitted:', info);
    setUserInfo(info)
    setIsGenerating(true); // Start progress bar
    setGenerationError(null); // Clear any previous errors
    
    const startTime = Date.now();
    
    try {
      console.log('🎬 Calling generateStory API');
      console.log('🔧 About to call generateStory with:', info);
      const { story } = await generateStory(info);
      console.log('✅ Received story response:', story);
      
      const totalTime = Date.now() - startTime;
      console.log('✅ Story generation completed successfully', {
        storyTitle: story?.main?.title || 'N/A',
        hasStory: !!story,
        totalTime: `${totalTime}ms`,
        scenesCount: story?.scenes?.length || 0,
        charactersCount: story?.characters?.length || 0
      });

      setStory(story);
      console.log('🎬 Setting stage to story. Story data:', story);
      setStage('story');
    } catch (error) {
      console.error('Error generating story:', error);
      setGenerationError(error instanceof Error ? error.message : 'An error occurred while generating the story');
      setStage('userInput'); // Go back to user input form on error
    } finally {
      setIsGenerating(false); // Stop progress bar
    }
  }

  const handleStartNewStory = () => {
    setStage('userInput');
    // Note: We keep the existing userInfo state, 
    // which will automatically prefill the form
  };

  // Render different stages
  if (isGenerating) {
    console.log('⏳ Rendering loading state');
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-purple-500">
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
          <p className="ml-2 text-white">Generating your story. This should take less than a minute...</p>
        </div>
      </main>
    );
  }

  // Log the rendering stage before returning
  if (stage === 'landing') {
    console.log('🏠 Rendering landing page');
  } else if (stage === 'userInput') {
    console.log('📝 Rendering user input form', { 
      hasExistingUserInfo: !!(userInfo.name && userInfo.age && userInfo.interests),
      hasError: !!generationError
    });
  } else if (stage === 'story') {
    console.log('📖 Rendering story interface', {
      storyTitle: story?.main?.title || 'N/A',
      userInfo
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-purple-500">
      {stage === 'landing' && (
        <LandingPage onStart={handleStart} />
      )}
      
      {stage === 'userInput' && (
        <UserInputForm 
          onSubmit={handleUserInfoSubmit} 
        />
      )}
      
      {stage === 'story' && (
        <StoryInterface 
          userInfo={userInfo} 
          story={story} 
          generationError={generationError}
          onStartNewStory={handleStartNewStory}
        />
      )}
    </main>
  )
}

