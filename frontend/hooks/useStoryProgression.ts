import { useState, useCallback, useRef } from 'react';
import { playAudio } from '@/src/services/api';

// Enhanced logging function with timestamps
const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const emoji = level === 'info' ? '📝' : level === 'warn' ? '⚠️' : '❌';
  console[level](`${emoji} [${timestamp}] [useStoryProgression] ${message}`, data ? data : '');
};

interface StoryEvent {
  type: 'narrate' | 'speak' | 'input';
  character: string;
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  content?: string;
  emotion: string;
  id: string;
  order: number;
}

interface Scene {
  events: StoryEvent[];
  id: string;
  name: string;
}

export function useStoryProgression(
  story: { scenes: Scene[] }, 
  audioProvider: 'openai' | 'elevenlabs' = 'elevenlabs'
) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const hasInitializedRef = useRef(false);
  const playingRequestRef = useRef<Promise<void> | null>(null);

  log('info', 'Hook initialized', {
    totalScenes: story.scenes.length,
    currentSceneIndex,
    currentEventIndex,
    audioProvider,
    hasInitialized: hasInitializedRef.current
  });

  const currentScene = story.scenes[currentSceneIndex];
  const currentEvent = currentScene?.events[currentEventIndex];

  const playCurrentEvent = useCallback(async (eventToPlay = currentEvent) => {
    if (!eventToPlay || isPlaying || eventToPlay.type === 'input' || playingRequestRef.current) {
      log('warn', 'Cannot play event - conditions not met', {
        hasEvent: !!eventToPlay,
        isPlaying,
        eventType: eventToPlay?.type,
        hasPlayingRequest: !!playingRequestRef.current
      });
      return;
    }

    const startTime = Date.now();
    log('info', '🎭 Starting event playback', {
      sceneIndex: currentSceneIndex,
      eventIndex: currentEventIndex,
      sceneId: currentScene?.id,
      sceneName: currentScene?.name,
      eventType: eventToPlay.type,
      isInitialized: hasInitializedRef.current,
      character: eventToPlay.character || 'Narrator',
      textLength: eventToPlay.content?.length || 0,
      textPreview: eventToPlay.content?.substring(0, 50) + (eventToPlay.content && eventToPlay.content.length > 50 ? '...' : ''),
      voice: eventToPlay.voice,
      emotion: eventToPlay.emotion
    });

    setIsPlaying(true);
    try {
      log('info', '📡 Requesting audio generation and playback');
      playingRequestRef.current = playAudio(eventToPlay.content || '', eventToPlay.voice, audioProvider);
      
      await playingRequestRef.current;
      
      const duration = Date.now() - startTime;
      log('info', '✅ Event playback completed successfully', {
        duration: `${duration}ms`,
        sceneIndex: currentSceneIndex,
        eventIndex: currentEventIndex,
        eventId: eventToPlay.id,
        textLength: eventToPlay.content?.length || 0
      });

      hasInitializedRef.current = true;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('error', '💥 Event playback failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        duration: `${duration}ms`,
        sceneIndex: currentSceneIndex,
        eventIndex: currentEventIndex,
        eventId: eventToPlay.id,
        audioProvider
      });
    } finally {
      setIsPlaying(false);
      playingRequestRef.current = null;
      log('info', '🏁 Event playback process finished', {
        isPlaying: false,
        hasInitialized: hasInitializedRef.current
      });
    }
  }, [currentEvent, isPlaying, audioProvider, currentScene?.id, currentSceneIndex, currentEventIndex]);

  const initializeFirstEvent = useCallback(async () => {
    log('info', '🚀 Attempting to initialize first event', {
      hasInitialized: hasInitializedRef.current,
      hasCurrentEvent: !!currentEvent,
      hasPlayingRequest: !!playingRequestRef.current,
      currentEventContent: currentEvent?.content?.substring(0, 50)
    });

    if (!hasInitializedRef.current && currentEvent && !playingRequestRef.current) {
      log('info', '▶️ Starting first event initialization');
      await playCurrentEvent();
    } else {
      log('warn', 'First event initialization skipped', {
        reason: hasInitializedRef.current ? 'Already initialized' : 
                !currentEvent ? 'No current event' : 
                'Playing request in progress'
      });
    }
  }, [currentEvent, playCurrentEvent]);

  const handleNext = useCallback(async () => {
    log('info', '⏭️ Handle next requested', {
      isPlaying,
      hasPlayingRequest: !!playingRequestRef.current,
      currentSceneIndex,
      currentEventIndex,
      totalScenesInCurrentScene: currentScene?.events.length || 0,
      totalScenes: story.scenes.length
    });

    if (isPlaying || playingRequestRef.current) {
      log('warn', 'Cannot progress - audio is currently playing');
      return;
    }

    if (currentEventIndex < currentScene.events.length - 1) {
      const nextEventIndex = currentEventIndex + 1;
      const nextEvent = currentScene.events[nextEventIndex];

      log('info', '⏭️ Moving to next event in current scene', {
        fromIndex: currentEventIndex,
        toIndex: nextEventIndex,
        totalEvents: currentScene.events.length,
        nextEventContent: nextEvent.content?.substring(0, 50) + '...',
        nextEventType: nextEvent.type,
        nextEventCharacter: nextEvent.character
      });
      
      setCurrentEventIndex(nextEventIndex);
      
      await playCurrentEvent(nextEvent);
      
    } else if (currentSceneIndex < story.scenes.length - 1) {
      const nextSceneIndex = currentSceneIndex + 1;
      const nextScene = story.scenes[nextSceneIndex];
      const firstEvent = nextScene.events[0];

      log('info', '📺 Moving to next scene', {
        fromScene: currentSceneIndex,
        toScene: nextSceneIndex,
        fromSceneName: currentScene?.name,
        toSceneName: nextScene?.name,
        firstEventContent: firstEvent.content?.substring(0, 50) + '...',
        firstEventType: firstEvent.type
      });
      
      setCurrentSceneIndex(nextSceneIndex);
      setCurrentEventIndex(0);
      
      await playCurrentEvent(firstEvent);
    } else {
      log('info', '🎉 Story completed - reached end of all scenes', {
        totalScenes: story.scenes.length,
        totalEventsInLastScene: currentScene?.events.length || 0
      });
    }
  }, [
    currentEventIndex, 
    currentScene?.events, 
    currentSceneIndex, 
    story.scenes, 
    isPlaying, 
    playCurrentEvent,
    playingRequestRef.current
  ]);

  const canProgress = !isPlaying && hasInitializedRef.current && (
    currentEventIndex < currentScene?.events.length - 1 || 
    currentSceneIndex < story.scenes.length - 1
  );

  log('info', 'Hook state update', {
    canProgress,
    isPlaying,
    hasInitialized: hasInitializedRef.current,
    currentSceneIndex,
    currentEventIndex,
    currentSceneName: currentScene?.name,
    currentEventType: currentEvent?.type
  });

  const progress = {
    scene: currentSceneIndex + 1,
    totalScenes: story.scenes.length,
    event: currentEventIndex + 1,
    totalEvents: currentScene?.events.length || 0,
    overallProgress: Math.round(
      ((currentSceneIndex * 100) + 
       ((currentEventIndex / (currentScene?.events.length || 1)) * 100)) / 
      story.scenes.length
    )
  };

  return {
    currentScene,
    currentEvent,
    isPlaying,
    initializeFirstEvent,
    handleNext,
    canProgress,
    progress
  };
}
