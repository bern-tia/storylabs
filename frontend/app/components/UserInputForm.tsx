'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'

// Enhanced logging function with timestamps
const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const emoji = level === 'info' ? '📝' : level === 'warn' ? '⚠️' : '❌';
  console[level](`${emoji} [${timestamp}] [UserInputForm] ${message}`, data ? data : '');
};

interface UserInputFormProps {
  onSubmit: (userInfo: { name: string; age: string; interests: string; hobby: string; theme: string }) => void
}

interface HobbyBank {
  theme: string;
  related_hobby: string[];
}

export default function UserInputForm({ onSubmit }: UserInputFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    interests: '',
    hobby: ''
  })

  const [hobbyBanks, setHobbyBanks] = useState<HobbyBank[]>([])
  const [filteredHobbies, setFilteredHobbies] = useState<{hobby: string, theme: string}[]>([])
  const [selectedTheme, setSelectedTheme] = useState('')
  const [showHobbyDropdown, setShowHobbyDropdown] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)

  // Load hobby banks data
  useEffect(() => {
    const loadHobbyBanks = async () => {
      try {
        const response = await fetch('/hobby_banks.json')
        const data = await response.json()
        setHobbyBanks(data)
        log('info', 'Hobby banks loaded successfully', { bankCount: data.length })
      } catch (error) {
        log('error', 'Failed to load hobby banks', { error })
      }
    }

    loadHobbyBanks()
  }, [])

  // Get all hobbies for display
  const getAllHobbies = () => {
    const allHobbies: {hobby: string, theme: string}[] = []
    hobbyBanks.forEach(bank => {
      bank.related_hobby.forEach(hobby => {
        allHobbies.push({ hobby, theme: bank.theme })
      })
    })
    return allHobbies
  }

  // Filter hobbies based on input or show all when focused
  useEffect(() => {
    if (hobbyBanks.length > 0) {
      if (isInputFocused) {
        if (formData.interests.trim() === '') {
          // Show all hobbies when input is focused but empty
          const allHobbies = getAllHobbies()
          setFilteredHobbies(allHobbies)
          setShowHobbyDropdown(true)
        } else {
          // Filter hobbies based on input
          const allHobbies: {hobby: string, theme: string}[] = []
          
          hobbyBanks.forEach(bank => {
            bank.related_hobby.forEach(hobby => {
              if (hobby.toLowerCase().includes(formData.interests.toLowerCase())) {
                allHobbies.push({ hobby, theme: bank.theme })
              }
            })
          })

          setFilteredHobbies(allHobbies)
          setShowHobbyDropdown(allHobbies.length > 0)
          
          log('info', 'Hobbies filtered', { 
            searchTerm: formData.interests, 
            foundHobbies: allHobbies.length 
          })
        }
      } else {
        setShowHobbyDropdown(false)
      }
    }
  }, [formData.interests, hobbyBanks, isInputFocused])

  const handleHobbySelect = (hobby: string, theme: string) => {
    setFormData({ ...formData, hobby, interests: hobby })
    setSelectedTheme(theme)
    setShowHobbyDropdown(false)
    setIsInputFocused(false)
    
    log('info', 'Hobby selected', { hobby, theme })
  }

  const handleInputFocus = () => {
    setIsInputFocused(true)
    log('info', 'Input focused, showing hobby options')
  }

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow for click selection
    setTimeout(() => {
      setIsInputFocused(false)
    }, 200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    log('info', '🚀 Form submission initiated', {
      formData: {
        name: formData.name,
        age: formData.age,
        interests: formData.interests,
        hobby: formData.hobby,
        theme: selectedTheme
      }
    });

    // Basic validation
    if (!formData.name.trim() || !formData.age || !formData.hobby) {
      log('warn', '❌ Form validation failed - missing required fields', {
        hasName: !!formData.name.trim(),
        hasAge: !!formData.age,
        hasHobby: !!formData.hobby
      });
      return;
    }

    const trimmedData = {
      name: formData.name.trim(),
      age: formData.age,
      interests: formData.interests.trim(),
      hobby: formData.hobby,
      theme: selectedTheme
    };

    log('info', '✅ Form validation passed - submitting data', {
      submittedData: trimmedData
    });

    onSubmit(trimmedData);
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-orange-600">
        Buat Cerita Keuangan Untukmu!
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Siapa namamu?
          </label>
          <Input
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700">
            Berapa umurmu?
          </label>
          <Input
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            required
          />
        </div>

        <div className="relative">
          <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
            Apa yang kamu suka? (klik untuk melihat pilihan)
          </label>
          <Input
            type="text"
            id="interests"
            value={formData.interests}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onChange={(e) => {
              log('info', '📝 Interests input changed', { 
                newValue: e.target.value,
                valueLength: e.target.value.length
              });
              setFormData({ ...formData, interests: e.target.value });
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            placeholder="Klik untuk melihat pilihan hobby..."
            required
          />
          
          {/* Hobby Dropdown */}
          {showHobbyDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredHobbies.length > 0 ? (
                filteredHobbies.map((item, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleHobbySelect(item.hobby, item.theme)}
                  >
                    <div className="font-medium text-gray-900">{item.hobby}</div>
                    <div className="text-xs text-gray-500">Tema: {item.theme.replace(/_/g, ' ')}</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500 text-sm">
                  Tidak ada hobby yang sesuai
                </div>
              )}
            </div>
          )}
        </div>

        {/* Show selected hobby and theme */}
        {formData.hobby && selectedTheme && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="text-sm text-green-800">
              <strong>Hobby terpilih:</strong> {formData.hobby}
            </div>
            <div className="text-xs text-green-600">
              <strong>Tema cerita:</strong> {selectedTheme.replace(/_/g, ' ')}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!formData.hobby}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Buat Cerita!
        </button>
      </form>
    </div>
  )
}

