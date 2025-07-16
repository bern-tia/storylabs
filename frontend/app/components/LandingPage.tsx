'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface LandingPageProps {
  onStart: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Show welcome message and proceed directly
      toast({
        title: "Selamat datang! 🎉",
        description: "Mari mulai membuat cerita yang menarik!",
        variant: "default",
      })
      
      // Small delay for better UX
      setTimeout(() => {
        onStart()
      }, 500)
      
    } catch (error) {
      console.error('Start error:', error)
      toast({
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi dalam beberapa saat.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎭 StoryLabs
          </h1>
          <p className="text-gray-600">
            Aplikasi Cerita Interaktif untuk Literasi Keuangan Anak
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Selamat Datang! 👋
            </h2>
            <p className="text-gray-600 mb-6">
              Buat cerita interaktif yang mendidik dan menghibur untuk anak-anak Indonesia 
              dengan fokus pada literasi keuangan.
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memuat...</span>
                </div>
              ) : (
                "🚀 Klik untuk Memulai"
              )}
            </Button>
          </form>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              ✨ Fitur yang tersedia:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>📚 Cerita interaktif dengan multiple scene</li>
              <li>🎨 Gambar yang menarik dan relevan</li>
              <li>🎵 Audio narasi dengan suara natural</li>
              <li>💰 Fokus pada literasi keuangan anak</li>
              <li>🇮🇩 Disesuaikan dengan budaya Indonesia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage

