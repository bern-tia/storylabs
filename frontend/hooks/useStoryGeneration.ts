import { useState, useEffect } from 'react';
import type { Story } from '../lib/story/types';
import { API_URL } from '../src/services/api';

// Enhanced logging function with timestamps
const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const emoji = level === 'info' ? '📝' : level === 'warn' ? '⚠️' : '❌';
  console[level](`${emoji} [${timestamp}] [useStoryGeneration] ${message}`, data ? data : '');
};

interface UseStoryGenerationProps {
  userInfo: {
    name: string;
    age: string;
    interests: string;
  };
}

export function useStoryGeneration({ userInfo }: UseStoryGenerationProps) {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    log('info', 'useEffect triggered - starting story generation process', {
      userInfo,
      currentStory: !!story,
      isLoading,
      error
    });

    async function generateStory() {
      const startTime = Date.now();
      log('info', '🎬 Beginning story generation', {
        name: userInfo.name,
        age: userInfo.age,
        interests: userInfo.interests,
        apiUrl: `${API_URL}/api/story/generate`
      });

      setIsLoading(true);
      setError(null);
      
      try {
        log('info', '📡 Sending story generation request');
        const response = await fetch(`${API_URL}/api/story/generate`, {          
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            child_name: userInfo.name,
            child_age: userInfo.age,
            child_interests: userInfo.interests
          })
        });

        const responseTime = Date.now() - startTime;
        log('info', '📥 Story generation response received', {
          status: response.status,
          statusText: response.statusText,
          responseTime: `${responseTime}ms`,
          ok: response.ok
        });

        if (!response.ok) {
          const errorText = await response.text();
          log('error', 'Story generation request failed', {
            status: response.status,
            statusText: response.statusText,
            errorText,
            responseTime: `${responseTime}ms`
          });
          throw new Error(`Failed to generate story: ${response.status} - ${errorText}`);
        }
        
        const storyData = await response.json();
        const totalTime = Date.now() - startTime;
        
        log('info', '✅ Story generation completed successfully', {
          storyTitle: storyData.story?.main?.title || 'N/A',
          hasStory: !!storyData.story,
          hasMetadata: !!storyData.metadata,
          storyId: storyData.metadata?.id,
          totalTime: `${totalTime}ms`,
          scenesCount: storyData.story?.scenes?.length || 0,
          charactersCount: storyData.story?.characters?.length || 0
        });

        setStory(storyData);
        
      } catch (err) {
        const totalTime = Date.now() - startTime;
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate story';
        
        log('error', '💥 Story generation failed', {
          error: errorMessage,
          errorType: err instanceof Error ? err.constructor.name : 'Unknown',
          totalTime: `${totalTime}ms`,
          userInfo
        });
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
        log('info', '🏁 Story generation process completed', {
          success: !error,
          hasStory: !!story,
          isLoading: false
        });
      }
    }

    if (userInfo.name && userInfo.age && userInfo.interests) {
      generateStory();
    } else {
      log('warn', 'Incomplete user info provided - skipping story generation', {
        hasName: !!userInfo.name,
        hasAge: !!userInfo.age,
        hasInterests: !!userInfo.interests
      });
    }
  }, [userInfo]);

  log('info', 'Hook state update', {
    hasStory: !!story,
    isLoading,
    hasError: !!error,
    storyTitle: story?.story?.main?.title
  });

  return { story, isLoading, error };
}