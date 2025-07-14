#!/usr/bin/env python3
"""
Script untuk test Google Gemini API
Jalankan dengan: python test_gemini.py
"""

import google.generativeai as genai
import os
from dotenv import load_dotenv

def test_gemini_api():
    print("🧪 Testing Google Gemini API...")
    
    # Load environment variables
    load_dotenv()
    
    # Get API key
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        # Hardcode untuk testing
        api_key = "AIzaSyBsWCBiLjOQvkjHoNBjjskQ4tjRyK559SQ"
        print("⚠️  Using hardcoded API key for testing")
    
    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        print(f"✅ API key configured (ends with ...{api_key[-4:]})")
        
        # Initialize model
        model = genai.GenerativeModel('gemini-1.5-flash')
        print("✅ Model initialized")
        
        # Test prompt in Indonesian
        test_prompt = """
        Buatkan cerita singkat (100 kata) tentang anak bernama Budi yang belajar menabung.
        Cerita harus dalam bahasa Indonesia dan mudah dipahami anak usia 7 tahun.
        """
        
        print("🔄 Generating test story...")
        
        # Generate content
        response = model.generate_content(
            test_prompt,
            generation_config=genai.types.GenerationConfig(
                candidate_count=1,
                max_output_tokens=200,
                temperature=0.7,
            )
        )
        
        if response.text:
            print("✅ SUCCESS! Gemini API is working!")
            print("\n📖 Generated Story:")
            print("=" * 50)
            print(response.text)
            print("=" * 50)
            return True
        else:
            print("❌ ERROR: No response from Gemini")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    success = test_gemini_api()
    if success:
        print("\n🎉 Google Gemini API siap digunakan!")
        print("💡 Anda bisa menjalankan backend sekarang.")
    else:
        print("\n💥 Ada masalah dengan setup Gemini API.")
        print("🔧 Periksa API key dan koneksi internet Anda.") 