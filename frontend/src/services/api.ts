// Directly set API URL based on environment
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://storylabs-api.onrender.com'  // Production URL
  : 'http://localhost:8002';              // Development URL (updated to port 8002)

// Enhanced logging function with timestamps
const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const emoji = level === 'info' ? '📝' : level === 'warn' ? '⚠️' : '❌';
  console[level](`${emoji} [${timestamp}] ${message}`, data ? data : '');
};

log('info', 'API Service initialized', { 
  environment: process.env.NODE_ENV,
  apiUrl: API_URL,
  timestamp: new Date().toISOString()
});

export const getStoredKeys = () => {
  try {
    log('info', '🔐 Retrieving stored keys from localStorage');
    const keys = localStorage.getItem('storylabs_keys');
    if (!keys) {
      log('warn', 'No stored keys found in localStorage');
      return null;
    }
    
    const parsedKeys = JSON.parse(keys);
    log('info', 'Successfully retrieved stored keys', {
      accessCode: parsedKeys.accessCode ? 'Present' : 'Not present',
      openaiKey: parsedKeys.openaiKey ? 'Present' : 'Not present',
      elevenLabsKey: parsedKeys.elevenLabsKey ? 'Present' : 'Not present',
      replicateToken: parsedKeys.replicateToken ? 'Present' : 'Not present'
    });
    return parsedKeys;
  } catch (error) {
    log('error', 'Error parsing stored keys', error);
    localStorage.removeItem('storylabs_keys');
    return null;
  }
};

// Add error handling for API key validation
const validateApiResponse = async (response: Response) => {
  log('info', `🔍 Validating API response`, {
    status: response.status,
    statusText: response.statusText,
    url: response.url
  });

  if (!response.ok) {
    let errorDetail;
    try {
      errorDetail = await response.json();
      log('error', 'API response validation failed', {
        status: response.status,
        statusText: response.statusText,
        errorDetail
      });
    } catch (parseError) {
      errorDetail = { detail: 'Unknown error - could not parse response' };
      log('error', 'Failed to parse error response', parseError);
    }

    if (response.status === 403) {
      log('warn', 'Authentication failed - clearing stored keys');
      localStorage.removeItem('storylabs_keys');
    }
    throw new Error(errorDetail.detail || 'Request failed');
  }
  
  log('info', '✅ API response validation passed');
  return response;
};

export const generateStory = async (userInfo: {
  name: string;
  age: string;
  interests: string;
}) => {
  const startTime = Date.now();
  log('info', '🎬 Starting story generation request', {
    userInfo,
    apiUrl: `${API_URL}/api/story/generate`
  });

  try {
    log('info', '📡 Sending HTTP request to story generation endpoint');
    const response = await fetch(`${API_URL}/api/story/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        child_name: userInfo.name,
        child_age: parseInt(userInfo.age),
        child_interests: userInfo.interests
      })
    });

    const responseTime = Date.now() - startTime;
    log('info', `📥 Received response from story generation`, {
      status: response.status,
      statusText: response.statusText,
      responseTime: `${responseTime}ms`
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Story generation failed', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        responseTime: `${responseTime}ms`
      });
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    log('info', '✅ Story generated successfully', {
      storyTitle: data.story?.main?.title || 'N/A',
      hasStory: !!data.story,
      hasMetadata: !!data.metadata,
      responseTime: `${responseTime}ms`,
      storyId: data.metadata?.id
    });

    return {
      story: data.story,
      metadata: data.metadata
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    log('error', '💥 Story generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${responseTime}ms`,
      userInfo
    });
    throw error;
  }
};

export async function fetchGeneratedImage(prompt: string, keys: any): Promise<string> {
  const startTime = Date.now();
  log('info', '🖼️ Starting image generation request', {
    prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
    promptLength: prompt.length,
    hasKeys: {
      accessCode: !!keys.accessCode,
      openaiKey: !!keys.openaiKey,
      elevenLabsKey: !!keys.elevenLabsKey,
      replicateToken: !!keys.replicateToken
    }
  });

  try {
    const response = await fetch(`${API_URL}/api/story/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(keys.accessCode && { 'X-Access-Code': keys.accessCode }),
        ...(keys.openaiKey && { 'X-OpenAI-Key': keys.openaiKey }),
        ...(keys.elevenLabsKey && { 'X-ElevenLabs-Key': keys.elevenLabsKey }),
        ...(keys.replicateToken && { 'X-Replicate-Token': keys.replicateToken }),
      },
      body: JSON.stringify({ prompt: prompt }),
    });

    const responseTime = Date.now() - startTime;
    log('info', '📥 Image generation response received', {
      status: response.status,
      statusText: response.statusText,
      responseTime: `${responseTime}ms`
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Image generation failed', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        responseTime: `${responseTime}ms`
      });
      throw new Error(`Failed to generate image: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const imagePath = data.image_path;
    const imageUrl = `${API_URL}/${imagePath}`;
    
    log('info', '✅ Image generated successfully', {
      imagePath,
      imageUrl,
      responseTime: `${responseTime}ms`
    });
    
    return imageUrl;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    log('error', '💥 Image generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${responseTime}ms`,
      prompt: prompt.substring(0, 50) + '...'
    });
    throw error;
  }
}

export async function playAudio(
  text: string, 
  voice: string = 'alloy', 
  provider: 'openai' | 'elevenlabs' = 'elevenlabs'
): Promise<void> {
  const startTime = Date.now();
  log('info', '🎧 Starting audio generation request', { 
    textLength: text.length,
    textPreview: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
    voice, 
    provider 
  });
  
  const keys = getStoredKeys();
  if (!keys) {
    log('error', 'No credentials found for audio generation');
    throw new Error('No credentials found');
  }

  log('info', '🔑 Using stored keys for audio request', {
    hasAccessCode: !!keys.accessCode,
    hasOpenaiKey: !!keys.openaiKey,
    hasElevenLabsKey: !!keys.elevenLabsKey
  });

  try {
    const startFetch = Date.now();
    log('info', '📡 Sending audio generation request');
    
    const response = await fetch(`${API_URL}/api/story/generate-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(keys.accessCode && { 'X-Access-Code': keys.accessCode }),
        ...(keys.openaiKey && { 'X-OpenAI-Key': keys.openaiKey }),
        ...(keys.elevenLabsKey && { 'X-ElevenLabs-Key': keys.elevenLabsKey }),
        'X-ElevenLabs-Key': 'sk_8a4b8f1df7f7899bf2f7234d54670eaa5bbc12e4cf251cef', // Hardcoded for testing
      },
      body: JSON.stringify({ 
        text,
        provider,
        voice
      }),
    });

    const responseTime = Date.now() - startFetch;
    log('info', '📥 Audio generation response received', {
      status: response.status,
      statusText: response.statusText,
      latency: `${responseTime}ms`
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Audio generation failed', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        responseTime: `${responseTime}ms`
      });
      throw new Error(`Failed to generate audio: ${response.status} - ${errorText}`);
    }

        // Simple audio blob approach - more reliable
    log('info', '🎬 Converting response to audio blob');
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    const streamDuration = Date.now() - startTime;
    log('info', '🎵 Audio blob created', {
      blobSize: `${audioBlob.size} bytes`,
      streamDuration: `${streamDuration}ms`
    });

    return new Promise((resolve, reject) => {
      audio.oncanplaythrough = () => {
        log('info', '▶️ Audio ready to play, starting playback');
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            log('error', 'Audio play() promise rejected', error);
            reject(new Error(`Audio playback failed: ${error.message}`));
          });
        }
      };

      audio.onended = () => {
        const totalDuration = Date.now() - startTime;
        log('info', '🏁 Audio playback complete', { 
          totalDuration: `${totalDuration}ms` 
        });
        URL.revokeObjectURL(audioUrl); // Clean up memory
        resolve();
      };
      
      audio.onerror = (event) => {
        log('error', 'Audio playback error', event);
        URL.revokeObjectURL(audioUrl); // Clean up memory
        reject(new Error('Audio playback failed'));
      };
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    log('error', '💥 Audio generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      totalDuration: `${totalDuration}ms`,
      textLength: text.length,
      provider,
      voice
    });
    throw error;
  }
}