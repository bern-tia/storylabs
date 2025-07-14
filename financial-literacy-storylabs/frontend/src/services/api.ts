const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com' 
  : 'http://localhost:8000';

// Helper function to get stored API keys
const getStoredKeys = () => {
  if (typeof window === 'undefined') return null;
  
  const keys = {
    accessCode: localStorage.getItem('accessCode'),
    geminiKey: localStorage.getItem('geminiKey'),
    elevenLabsKey: localStorage.getItem('elevenLabsKey'),
  };
  
  return keys.accessCode ? keys : null;
};

// Helper function to validate API response
const validateApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
};

// Generate financial literacy story
export const generateFinancialStory = async (data: {
  name: string;
  age: string;
  interests: string;
  financialFocus: string;
}) => {
  const keys = getStoredKeys();
  if (!keys) {
    throw new Error('Please provide your API keys first');
  }

  const response = await fetch(`${API_URL}/api/story/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Code': keys.accessCode,
      'X-Gemini-Key': keys.geminiKey,
      ...(keys.elevenLabsKey && { 'X-ElevenLabs-Key': keys.elevenLabsKey }),
    },
    body: JSON.stringify({
      child_name: data.name,
      child_age: parseInt(data.age),
      child_interests: data.interests,
      financial_focus: data.financialFocus,
    }),
  });

  await validateApiResponse(response);
  return response.json();
};

// Generate image using Gemini
export const generateImage = async (prompt: string) => {
  const keys = getStoredKeys();
  if (!keys) {
    throw new Error('Please provide your API keys first');
  }

  const response = await fetch(`${API_URL}/api/story/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Code': keys.accessCode,
      'X-Gemini-Key': keys.geminiKey,
    },
    body: JSON.stringify({
      prompt,
      aspect_ratio: '1:1',
      output_format: 'png'
    }),
  });

  await validateApiResponse(response);
  return response.json();
};

// Generate audio
export const generateAudio = async (text: string, provider: 'google' | 'elevenlabs' = 'google') => {
  const keys = getStoredKeys();
  if (!keys) {
    throw new Error('Please provide your API keys first');
  }

  const response = await fetch(`${API_URL}/api/story/generate-audio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Code': keys.accessCode,
      'X-Gemini-Key': keys.geminiKey,
      ...(keys.elevenLabsKey && { 'X-ElevenLabs-Key': keys.elevenLabsKey }),
    },
    body: JSON.stringify({
      text,
      provider
    }),
  });

  await validateApiResponse(response);
  return response.blob();
};

// Store API keys in localStorage
export const storeApiKeys = (keys: {
  accessCode: string;
  geminiKey: string;
  elevenLabsKey?: string;
}) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('accessCode', keys.accessCode);
  localStorage.setItem('geminiKey', keys.geminiKey);
  if (keys.elevenLabsKey) {
    localStorage.setItem('elevenLabsKey', keys.elevenLabsKey);
  }
};

// Get financial concepts for age group
export const getFinancialConcepts = async (ageGroup: string) => {
  const response = await fetch(`${API_URL}/api/story/financial-concepts/${ageGroup}`);
  await validateApiResponse(response);
  return response.json();
};

// Get story templates
export const getStoryTemplates = async () => {
  const keys = getStoredKeys();
  if (!keys) {
    throw new Error('No credentials found');
  }

  try {
    const response = await fetch(`${API_URL}/api/story/story-templates`, {
      method: 'GET',
      headers: {
        ...(keys.accessCode && { 'X-Access-Code': keys.accessCode }),
        ...(keys.geminiKey && { 'X-Gemini-Key': keys.geminiKey }),
        ...(keys.elevenLabsKey && { 'X-ElevenLabs-Key': keys.elevenLabsKey }),
      }
    });

    await validateApiResponse(response);
    return await response.json();
  } catch (error) {
    console.error('Error fetching story templates:', error);
    throw error;
  }
};

// Clear stored API keys
export const clearApiKeys = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('accessCode');
  localStorage.removeItem('geminiKey');
  localStorage.removeItem('elevenLabsKey');
};

// Check if API keys are stored
export const hasStoredKeys = () => {
  return getStoredKeys() !== null;
}; 