#!/usr/bin/env python3
"""
Script Test Sederhana untuk Google Gemini API
API Key: AIzaSyBsWCBiLjOQvkjHoNBjjskQ4tjRyK559SQ
"""

import os
import sys

def test_gemini_api_simple():
    print("🎭 Testing Google Gemini API Key dari Teman Anda...")
    print("=" * 60)
    
    # API Key yang diberikan teman
    api_key = "AIzaSyBsWCBiLjOQvkjHoNBjjskQ4tjRyK559SQ"
    
    try:
        # Import library yang diperlukan
        print("📦 Importing Google Generative AI...")
        import google.generativeai as genai
        print("✅ Import berhasil!")
        
        # Konfigurasi API
        print("🔧 Configuring Gemini API...")
        genai.configure(api_key=api_key)
        print(f"✅ API Key configured (ends with ...{api_key[-4:]})")
        
        # Initialize model
        print("🤖 Initializing Gemini 1.5 Flash model...")
        model = genai.GenerativeModel('gemini-1.5-flash')
        print("✅ Model initialized successfully!")
        
        # Test 1: Simple greeting in Indonesian
        print("\n🧪 TEST 1: Simple Indonesian greeting")
        print("-" * 40)
        response1 = model.generate_content("Katakan 'Halo' dalam bahasa Indonesia dengan ramah")
        
        if response1.text:
            print("📄 Response:")
            print(f"   {response1.text}")
            print("✅ Test 1 PASSED!")
        else:
            print("❌ Test 1 FAILED - No response")
            return False
            
        # Test 2: Simple story generation (Indonesian)
        print("\n🧪 TEST 2: Story generation for financial literacy")
        print("-" * 40)
        story_prompt = """
        Buatkan cerita pendek (50 kata) tentang anak bernama Budi yang belajar menabung uang.
        Cerita harus dalam bahasa Indonesia dan mudah dipahami anak usia 7 tahun.
        """
        
        response2 = model.generate_content(
            story_prompt,
            generation_config=genai.types.GenerationConfig(
                candidate_count=1,
                max_output_tokens=150,
                temperature=0.7,
            )
        )
        
        if response2.text:
            print("📖 Generated Story:")
            print(f"   {response2.text}")
            print("✅ Test 2 PASSED!")
        else:
            print("❌ Test 2 FAILED - No story generated")
            return False
            
        # Test 3: Math question in Indonesian
        print("\n🧪 TEST 3: Simple math in Indonesian")
        print("-" * 40)
        math_prompt = "Berapa hasil 5 + 3? Jelaskan dengan sederhana untuk anak-anak."
        
        response3 = model.generate_content(math_prompt)
        
        if response3.text:
            print("🔢 Math Response:")
            print(f"   {response3.text}")
            print("✅ Test 3 PASSED!")
        else:
            print("❌ Test 3 FAILED - No math response")
            return False
            
        print("\n" + "=" * 60)
        print("🎉 SEMUA TEST BERHASIL!")
        print("✅ API Key Gemini dari teman Anda berfungsi dengan sempurna!")
        print("✅ Siap digunakan untuk StoryLabs Financial Literacy!")
        
        return True
        
    except ImportError as e:
        print(f"❌ ERROR: Library tidak terinstall")
        print(f"   {e}")
        print("\n💡 Solusi:")
        print("   pip install google-generativeai")
        return False
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        print("\n🔧 Possible issues:")
        print("   - API Key tidak valid")
        print("   - Koneksi internet bermasalah")
        print("   - Quota API habis")
        return False

def setup_env_file():
    """Create .env file with the API key"""
    print("\n📝 Creating .env file for backend...")
    
    env_content = f"""# Google Gemini API Configuration
GEMINI_API_KEY=AIzaSyBsWCBiLjOQvkjHoNBjjskQ4tjRyK559SQ
GOOGLE_API_KEY=AIzaSyBsWCBiLjOQvkjHoNBjjskQ4tjRyK559SQ

# Additional settings
TZ=Asia/Jakarta
LANG=id_ID
"""
    
    # Create backend/.env file
    backend_env_path = "backend/.env"
    try:
        os.makedirs("backend", exist_ok=True)
        with open(backend_env_path, 'w', encoding='utf-8') as f:
            f.write(env_content)
        print(f"✅ Created {backend_env_path}")
        
        # Also create .env in root for testing
        with open(".env", 'w', encoding='utf-8') as f:
            f.write(env_content)
        print("✅ Created .env in root directory")
        
        return True
    except Exception as e:
        print(f"❌ Error creating .env: {e}")
        return False

def main():
    print("🚀 GEMINI API KEY TESTER")
    print("API Key dari teman: AIzaSyBsWCBiLjOQvkjHoNBjjskQ4tjRyK559SQ")
    print("=" * 60)
    
    # Test the API
    success = test_gemini_api_simple()
    
    if success:
        # Setup environment file
        setup_env_file()
        
        print("\n🎯 NEXT STEPS:")
        print("1. Jalankan: python start_storylabs.py")
        print("2. Atau manual: cd backend && python -m uvicorn app.main:app --reload")
        print("3. Buka browser: http://127.0.0.1:8000/docs")
        print("\n💡 Tips:")
        print("- API Key sudah disimpan di backend/.env")
        print("- Gunakan storylabs_app.html untuk frontend sederhana")
        
    else:
        print("\n💥 TEST GAGAL!")
        print("🔧 Coba:")
        print("1. Install library: pip install google-generativeai")
        print("2. Cek koneksi internet")
        print("3. Verify API key dengan teman Anda")

if __name__ == "__main__":
    main() 