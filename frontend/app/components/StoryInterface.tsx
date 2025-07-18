'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronRight, RotateCcw } from 'lucide-react'

// Enhanced logging function with timestamps
const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const emoji = level === 'info' ? '📝' : level === 'warn' ? '⚠️' : '❌';
  console[level](`${emoji} [${timestamp}] [StoryInterface] ${message}`, data ? data : '');
};

interface StoryPart {
  part: number;
  type: 'story' | 'interactive_question' | 'moral_value';
  content?: string;
  question?: string;
  image_source?: string;
}

interface Story {
  title: string;
  story: StoryPart[];
}

interface StoryInterfaceProps {
  userInfo: {
    name: string;
    age: string;
    interests: string;
    hobby: string;
    theme: string;
  };
  story: Story;
  generationError: string | null;
  onStartNewStory: () => void;
}

export default function StoryInterface({ userInfo, story, generationError, onStartNewStory }: StoryInterfaceProps) {
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const autoAdvanceTimer = useRef<NodeJS.Timeout | null>(null);

  log('info', 'StoryInterface component mounted', {
    userInfo,
    hasStory: !!story,
    storyTitle: story?.title,
    partsCount: story?.story?.length || 0,
    hasError: !!generationError
  });

  const currentPart = story?.story[currentPartIndex];
  const totalParts = story?.story?.length || 0;
  const isLastPart = currentPartIndex >= totalParts - 1;

  const handleNext = () => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }

    if (isLastPart) {
      setIsCompleted(true);
      log('info', '🎉 Story completed');
    } else {
      setCurrentPartIndex(prev => prev + 1);
      log('info', '⏭️ Advanced to next part', { 
        newPartIndex: currentPartIndex + 1,
        partType: story?.story[currentPartIndex + 1]?.type
      });
    }
  };

  // Handle auto-advance for story parts (optional)
  useEffect(() => {
    if (currentPart?.type === 'story') {
      // Clear any existing timer
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
      
      // Set auto-advance timer for 10 seconds (optional feature)
      const timer = setTimeout(() => {
        // Use current values to avoid stale closure
        setCurrentPartIndex(prevIndex => {
          const currentStory = story?.story;
          const currentItem = currentStory?.[prevIndex];
          const isLast = prevIndex >= (currentStory?.length || 0) - 1;
          
          if (!isLast && currentItem?.type === 'story') {
            return prevIndex + 1;
          }
          
          if (isLast) {
            setIsCompleted(true);
            log('info', '🎉 Story completed (auto-advance)');
          }
          
          return prevIndex;
        });
      }, 10000); // 10 seconds

      autoAdvanceTimer.current = timer;
    }

    return () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = null;
      }
    };
  }, [currentPartIndex, currentPart, isLastPart]);

  const getPartContent = (part: StoryPart) => {
    if (!part) return '';
    switch (part.type) {
      case 'story':
        return part.content || '';
      case 'interactive_question':
        return part.question || '';
      case 'moral_value':
        return part.content || '';
      default:
        return '';
    }
  };

  const getPartImage = (part: StoryPart) => {
    if (!part) return '/assets/scenes/default.jpg';
    if (part.image_source) {
      return `/assets/${part.image_source}`;
    }
    return '/assets/scenes/default.jpg';
  };

  const getPartIcon = (part: StoryPart) => {
    if (!part) return '📝';
    switch (part.type) {
      case 'story':
        return '📖';
      case 'interactive_question':
        return '🤔';
      case 'moral_value':
        return '💡';
      default:
        return '📝';
    }
  };

  const getPartTitle = (part: StoryPart) => {
    if (!part) return 'Bagian Cerita';
    switch (part.type) {
      case 'story':
        return 'Cerita';
      case 'interactive_question':
        return 'Pertanyaan untukmu';
      case 'moral_value':
        return 'Pelajaran Moral';
      default:
        return 'Bagian Cerita';
    }
  };

  if (generationError) {
    log('error', '💥 Rendering error state', { error: generationError });
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full text-center">
        <div className="text-red-500 text-center p-4">
          <strong>Error:</strong> {generationError}
        </div>
        <Button onClick={onStartNewStory} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (!story) {
    log('warn', '⚠️ No story provided to StoryInterface');
    return null;
  }

  if (isCompleted) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="text-6xl">🎉</div>
          <h2 className="text-3xl font-bold text-orange-800">
            Cerita Selesai!
          </h2>
          <p className="text-lg text-gray-600">
            Bagus sekali, {userInfo.name}! Kamu sudah menyelesaikan cerita "{story.title}".
          </p>
          <p className="text-md text-gray-500">
            Semoga kamu belajar banyak tentang {userInfo.theme.replace(/_/g, ' ')}!
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={onStartNewStory} className="bg-orange-600 hover:bg-orange-700">
              <RotateCcw className="mr-2 h-4 w-4" />
              Buat Cerita Baru
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full min-h-[600px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-orange-800">
          {story.title}
        </h2>
        <div className="text-sm text-gray-600">
          Bagian {currentPartIndex + 1} dari {totalParts}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-orange-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentPartIndex + 1) / totalParts) * 100}%` }}
        ></div>
      </div>

      {/* Story Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPartIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="min-h-[300px]"
        >
          {currentPart && (
            <>
              {/* Part Type Header */}
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">{getPartIcon(currentPart)}</span>
                <h3 className="text-xl font-semibold text-gray-700">
                  {getPartTitle(currentPart)}
                </h3>
              </div>

              {/* Image Section */}
              <div className="relative h-64 mb-6 rounded-lg overflow-hidden bg-white">
                <motion.img
                  key={currentPartIndex}
                  src={getPartImage(currentPart)}
                  alt={getPartTitle(currentPart)}
                  className="w-full h-full object-contain"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  onError={(e) => {
                    log('warn', 'Image failed to load, using fallback', {
                      partIndex: currentPartIndex,
                      imageUrl: getPartImage(currentPart)
                    });
                    (e.target as HTMLImageElement).src = '/assets/scenes/default.jpg';
                  }}
                />
              </div>

              {/* Part Content */}
              <div className={`text-lg leading-relaxed mb-6 p-6 rounded-lg ${
                currentPart.type === 'story' ? 'bg-blue-50 border-l-4 border-blue-400' :
                currentPart.type === 'interactive_question' ? 'bg-yellow-50 border-l-4 border-yellow-400' :
                'bg-green-50 border-l-4 border-green-400'
              }`}>
                {getPartContent(currentPart)}
              </div>

              {/* Special styling for interactive questions */}
              {currentPart.type === 'interactive_question' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center p-4 bg-yellow-100 rounded-lg border border-yellow-300"
                >
                  <p className="text-sm text-yellow-700 italic">
                    💭 Pikirkan jawabanmu dalam hati, ya!
                  </p>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8">
        <div className="text-sm text-gray-500">
          {currentPart && currentPart.type === 'story' && (
            <span>Cerita akan lanjut otomatis dalam 10 detik...</span>
          )}
        </div>
        
        <div className="flex space-x-4">
                      <Button 
              onClick={handleNext}
              className="bg-orange-600 hover:bg-orange-700"
            >
            {isLastPart ? 'Selesai' : 'Lanjut'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button 
            onClick={onStartNewStory}
            variant="outline"
            className="border-orange-600 text-orange-600 hover:bg-orange-50"
          >
            Cerita Baru
          </Button>
        </div>
      </div>
    </div>
  )
}
