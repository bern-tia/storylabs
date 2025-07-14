'use client'

import React, { useState } from 'react'

// Enhanced logging function with timestamps
const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const emoji = level === 'info' ? '📝' : level === 'warn' ? '⚠️' : '❌';
  console[level](`${emoji} [${timestamp}] [UserInputForm] ${message}`, data ? data : '');
};

interface UserInputFormProps {
  onSubmit: (userInfo: { name: string; age: string; interests: string }) => void
}

export default function UserInputForm({ onSubmit }: UserInputFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    interests: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    log('info', '🚀 Form submission initiated', {
      formData: {
        name: formData.name,
        age: formData.age,
        interests: formData.interests,
        nameLength: formData.name.length,
        interestsLength: formData.interests.length
      }
    });

    // Basic validation
    if (!formData.name.trim() || !formData.age || !formData.interests.trim()) {
      log('warn', '❌ Form validation failed - missing required fields', {
        hasName: !!formData.name.trim(),
        hasAge: !!formData.age,
        hasInterests: !!formData.interests.trim()
      });
      return;
    }

    const trimmedData = {
      name: formData.name.trim(),
      age: formData.age,
      interests: formData.interests.trim()
    };

    log('info', '✅ Form validation passed - submitting data', {
      submittedData: trimmedData
    });

    onSubmit(trimmedData);
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
        Buat Cerita Keuangan Untukmu!
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Siapa namamu?
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => {
              log('info', '📝 Name input changed', { 
                newValue: e.target.value,
                valueLength: e.target.value.length 
              });
              setFormData({ ...formData, name: e.target.value });
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700">
            Berapa umurmu?
          </label>
          <input
            type="number"
            id="age"
            min="5"
            max="12"
            value={formData.age}
            onChange={(e) => {
              log('info', '📝 Age input changed', { 
                newValue: e.target.value,
                isValidAge: parseInt(e.target.value) >= 5 && parseInt(e.target.value) <= 12
              });
              setFormData({ ...formData, age: e.target.value });
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
            Apa yang kamu suka? (contoh: bermain game, membaca buku, olahraga)
          </label>
          <input
            type="text"
            id="interests"
            value={formData.interests}
            onChange={(e) => {
              log('info', '📝 Interests input changed', { 
                newValue: e.target.value,
                valueLength: e.target.value.length
              });
              setFormData({ ...formData, interests: e.target.value });
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Buat Cerita!
        </button>
      </form>
    </div>
  )
}

