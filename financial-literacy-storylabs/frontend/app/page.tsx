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
  const [userInfo, setUserInfo] = useState({ name: '', age: '', interests: '', financialFocus: '' })
  const [isGenerating, setIsGenerating] = useState(false);
  const [story, setStory] = useState(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleStart = () => setStage('userInput')
  
  const handleUserInfoSubmit = async (info: typeof userInfo) => {
    console.log('Setting user info that was submitted:', info);
    setUserInfo(info)
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      const { story } = await generateStory(info);
      console.log('Financial literacy story generated:', {story});
      setStory(story);
      console.log('Story set:', {story});
      setStage('story');
    } catch (error) {
      console.error('Error generating financial literacy story:', error);
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate story');
    } finally {
      setIsGenerating(false);
    }
  }

  const handleStartNewStory = () => {
    setStage('userInput');
    setStory(null);
    setGenerationError(null);
    // Keep the existing userInfo state for convenience
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <div className="mt-4 text-lg font-medium text-gray-700">
            Creating your financial literacy story...
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Teaching {userInfo.name} about money management!
          </div>
          <ProgressBar />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {stage === 'landing' && <LandingPage onStart={handleStart} />}
      {stage === 'userInput' && (
        <UserInputForm 
          onSubmit={handleUserInfoSubmit} 
          initialData={userInfo}
          isFinancialLiteracy={true}
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
    </div>
  )
} 