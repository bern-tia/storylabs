// Force development URL to use local backend
export const API_URL = 'http://localhost:8002';  // Local development backend

console.log('Environment:', process.env.NODE_ENV);
console.log('Using API_URL:', API_URL);

export const getStoredKeys = () => {
  try {
    const keys = localStorage.getItem('storylabs_keys');
    if (!keys) return null;
    const parsedKeys = JSON.parse(keys);
    console.log('Retrieved stored keys:', {
      accessCode: parsedKeys.accessCode ? 'Present' : 'Not present',
      openaiKey: parsedKeys.openaiKey ? 'Present' : 'Not present',
      elevenLabsKey: parsedKeys.elevenLabsKey ? 'Present' : 'Not present',
      replicateToken: parsedKeys.replicateToken ? 'Present' : 'Not present'
    });
    return parsedKeys;
  } catch (error) {
    console.error('Error getting stored keys:', error);
    localStorage.removeItem('storylabs_keys');
    return null;
  }
};

// Add error handling for API key validation
const validateApiResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    if (response.status === 403) {
      // Clear stored keys if authentication fails
      localStorage.removeItem('storylabs_keys');
    }
    throw new Error(error.detail || 'Request failed');
  }
  return response;
};

export const generateStory = async (userInfo: {
  name: string;
  age: string;
  interests: string;
}) => {
  const startTime = Date.now();
  console.log('🎬 Starting story generation request', {
    userInfo,
    apiUrl: `${API_URL}/api/story/generate`
  });

  try {
    console.log('📡 Sending HTTP request to story generation endpoint');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch(`${API_URL}/api/story/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        child_name: userInfo.name,
        child_age: parseInt(userInfo.age),
        child_interests: userInfo.interests
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    console.log(`📥 Received response from story generation`, {
      status: response.status,
      statusText: response.statusText,
      responseTime: `${responseTime}ms`
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Story generation failed', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        responseTime: `${responseTime}ms`
      });
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Story generated successfully', {
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
    console.error('💥 Story generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${responseTime}ms`,
      userInfo
    });
    throw error;
  }

  // Add debug logging
  console.log('Sending request with headers:', {
    ...(keys.accessCode && { 'X-Access-Code': keys.accessCode }),
    ...(keys.openaiKey && { 'X-OpenAI-Key': keys.openaiKey }),
    ...(keys.elevenLabsKey && { 'X-ElevenLabs-Key': keys.elevenLabsKey }),
    ...(keys.replicateToken && { 'X-Replicate-Token': keys.replicateToken }),
  });

  try {
    const response = await fetch(`${API_URL}/api/story/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(keys.accessCode && { 'X-Access-Code': keys.accessCode }),
        ...(keys.openaiKey && { 'X-OpenAI-Key': keys.openaiKey }),
        ...(keys.elevenLabsKey && { 'X-ElevenLabs-Key': keys.elevenLabsKey }),
        ...(keys.replicateToken && { 'X-Replicate-Token': keys.replicateToken }),
      },
      body: JSON.stringify({
        child_name: userInfo.name,
        child_age: userInfo.age,
        child_interests: userInfo.interests
      })
    });

    await validateApiResponse(response);
    const data = await response.json();

    // Pass the stored keys to image generation
    const scenesWithImages = await Promise.all(data.story.scenes.map(async (scene: { prompt: string }) => {
      const imageUrl = await fetchGeneratedImage(scene.prompt, keys);
      return { ...scene, imageUrl };
    }));

    return {
      story: { ...data.story, scenes: scenesWithImages }
    };
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
};

export async function fetchGeneratedImage(prompt: string, keys: any): Promise<string> {
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

  if (!response.ok) {
    throw new Error('Failed to generate image');
  }

  const data = await response.json();
  const imagePath = data.image_path;
  const imageUrl = `${API_URL}/${imagePath}`;
  return imageUrl;      
}

export async function playAudio(
  text: string, 
  voice: string = 'alloy', 
  provider: 'openai' | 'elevenlabs' = 'elevenlabs'
): Promise<void> {
  console.log('🎧 Starting audio request:', { text, voice, provider });
  
  const keys = getStoredKeys();
  if (!keys) {
    throw new Error('No credentials found');
  }

  try {
    const startFetch = Date.now();
    const response = await fetch(`${API_URL}/api/story/generate-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(keys.accessCode && { 'X-Access-Code': keys.accessCode }),
        ...(keys.openaiKey && { 'X-OpenAI-Key': keys.openaiKey }),
        ...(keys.elevenLabsKey && { 'X-ElevenLabs-Key': keys.elevenLabsKey }),
      },
      body: JSON.stringify({ 
        text,
        provider,
        ...(provider === 'openai' && { voice })
      }),
    });

    console.log('📡 Audio response received:', {
      status: response.status,
      latency: `${Date.now() - startFetch}ms`
    });

    if (!response.ok) {
      throw new Error('Failed to generate audio');
    }

    const audioData = await response.json();
    console.log('🎵 Audio data received:', {
      hasAudioUrl: !!audioData.audio_url,
      provider: audioData.provider,
      status: audioData.status
    });

    if (audioData.audio_url) {
      return new Promise((resolve, reject) => {
        const audio = new Audio(audioData.audio_url);
        
        audio.onended = () => {
          console.log('🏁 Audio playback complete');
          resolve();
        };
        
        audio.onerror = (error) => {
          console.error('❌ Audio playback error:', error);
          reject(new Error('Audio playback failed'));
        };
        
        audio.onloadeddata = () => {
          console.log('✅ Audio loaded, starting playback');
          audio.play().catch(reject);
        };
      });
    } else {
      throw new Error('No audio URL received');
    }
  } catch (error) {
    console.error('❌ Audio error:', error);
    throw error;
  }
}