#!/usr/bin/env python3
"""
Test script untuk debug API key backend
"""

import os
import google.generativeai as genai

def test_api_key():
    print("🔍 TESTING BACKEND API KEY")
    print("=" * 50)
    
    # Test the hardcoded API key
    api_key = "AIzaSyBsWCBiLjOQvkjHoNBjjskQ4tjRyK559SQ"
    print(f"📋 Testing API Key: {api_key[:10]}...{api_key[-4:]}")
    
    try:
        # Configure with the same key as backend
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Simple test
        response = model.generate_content("Hai! Apa kabar?")
        print(f"✅ SUCCESS: {response.text[:50]}...")
        
        # Test with the same prompt structure as backend
        prompt = """
Buatkan cerita edukatif tentang literasi keuangan untuk anak bernama Budi yang berusia 7 tahun.
Anak ini suka bermain.

PENTING: Berikan response dalam format JSON yang valid seperti ini:
{
  "story": {
    "main": {
      "id": "main_story",
      "title": "Petualangan Budi Belajar Menabung",
      "content": "Cerita singkat di sini..."
    },
    "characters": [
      {"id": "budi", "name": "Budi", "description": "Anak laki-laki umur 7 tahun"}
    ],
    "scenes": [
      {
        "id": "scene_1",
        "title": "Budi Ingin Mainan Baru",
        "events": [
          {"id": "event_1", "description": "Budi melihat mainan robot", "narration": "Di toko mainan..."}
        ]
      }
    ]
  }
}

Pastikan format JSON valid dan lengkap.
"""
        
        print("\n🎭 Testing story generation...")
        story_response = model.generate_content(prompt)
        print(f"✅ Story Response Length: {len(story_response.text)} chars")
        print(f"📖 First 100 chars: {story_response.text[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    test_api_key() 