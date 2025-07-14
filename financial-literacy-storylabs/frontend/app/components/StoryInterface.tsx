// Placeholder StoryInterface component
export default function StoryInterface({ story, generationError, onStartNewStory }: any) {
  if (generationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{generationError}</p>
          <button
            onClick={onStartNewStory}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your financial literacy story...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {story.main?.title || 'Your Financial Literacy Story'}
            </h1>
            <p className="text-gray-600">
              Learning about money through interactive storytelling
            </p>
          </div>

          <div className="space-y-6">
            {story.characters && story.characters.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Meet the Characters:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {story.characters.map((character: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded-lg">
                      <div className="font-medium text-gray-800">{character.name}</div>
                      <div className="text-sm text-gray-600">{character.personality?.trait}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {story.scenes && story.scenes.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Story Scenes:</h3>
                {story.scenes.map((scene: any, index: number) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">{scene.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{scene.prompt}</p>
                    {scene.events && scene.events.length > 0 && (
                      <div className="space-y-2">
                        {scene.events.slice(0, 3).map((event: any, eventIndex: number) => (
                          <div key={eventIndex} className="text-sm p-2 bg-white rounded">
                            <strong className="text-purple-600">{event.character}:</strong> {event.content}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {story.main?.state?.global_state?.money_concepts_learned && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">What You'll Learn:</h3>
                <div className="space-y-2">
                  {story.main.state.global_state.money_concepts_learned.map((concept: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded-lg">
                      <div className="font-medium text-gray-800">{concept.concept}</div>
                      <div className="text-sm text-gray-600">{concept.definition}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={onStartNewStory}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 mr-4"
            >
              Create Another Story
            </button>
            <p className="text-sm text-gray-500 mt-4">
              * Full interactive story experience coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 