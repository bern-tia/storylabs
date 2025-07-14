'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { storeApiKeys } from '../../src/services/api';

interface UserInputFormProps {
  onSubmit: (data: {
    name: string;
    age: string;
    interests: string;
    financialFocus: string;
  }) => void;
  isLoading: boolean;
}

export default function UserInputForm({ onSubmit, isLoading }: UserInputFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    interests: '',
    financialFocus: ''
  });

  const [apiKeys, setApiKeys] = useState({
    accessCode: '',
    geminiKey: '',
    elevenLabsKey: ''
  });

  const [showApiKeys, setShowApiKeys] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store API keys
    storeApiKeys(apiKeys);
    
    // Submit form data
    onSubmit(formData);
  };

  const financialFocusOptions = [
    'Saving money',
    'Spending wisely',
    'Earning money',
    'Banking basics',
    'Needs vs wants',
    'Goal setting',
    'Money counting',
    'Being generous',
    'Entrepreneurship',
    'Let the app choose!'
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Create Your Financial Literacy Story
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* API Keys Section */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">API Configuration</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowApiKeys(!showApiKeys)}
            >
              {showApiKeys ? 'Hide' : 'Show'} API Keys
            </Button>
          </div>
          
          {showApiKeys && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Code <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={apiKeys.accessCode}
                  onChange={(e) => setApiKeys({...apiKeys, accessCode: e.target.value})}
                  placeholder="Your access code"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Gemini API Key <span className="text-red-500">*</span>
                  <span className="text-green-600 text-xs"> (FREE tier available!)</span>
                </label>
                <Input
                  type="password"
                  value={apiKeys.geminiKey}
                  onChange={(e) => setApiKeys({...apiKeys, geminiKey: e.target.value})}
                  placeholder="Your Gemini API key"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Used for story generation AND image generation
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ElevenLabs API Key <span className="text-gray-400">(optional)</span>
                </label>
                <Input
                  type="password"
                  value={apiKeys.elevenLabsKey}
                  onChange={(e) => setApiKeys({...apiKeys, elevenLabsKey: e.target.value})}
                  placeholder="Your ElevenLabs API key (for premium voices)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional - we'll use Google TTS by default (free)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Child Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Child Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Child's Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter child's name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Child's Age <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select age</option>
              {[4, 5, 6, 7, 8, 9, 10, 11, 12].map(age => (
                <option key={age} value={age}>{age} years old</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Child's Interests <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.interests}
              onChange={(e) => setFormData({...formData, interests: e.target.value})}
              placeholder="e.g., animals, sports, art, cooking"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Financial Focus <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.financialFocus}
              onChange={(e) => setFormData({...formData, financialFocus: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a focus</option>
              {financialFocusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Your Story...' : 'Create Financial Story'}
        </Button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💰 Now Completely Google-Powered!</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ <strong>FREE</strong> story generation with Google Gemini</li>
          <li>✅ <strong>FREE</strong> image generation with Google Gemini</li>
          <li>✅ <strong>FREE</strong> voice synthesis with Google TTS</li>
          <li>✅ Only <strong>ONE</strong> API key needed (Gemini)</li>
          <li>✅ <strong>$0/month</strong> for basic usage!</li>
        </ul>
      </div>
    </div>
  );
} 