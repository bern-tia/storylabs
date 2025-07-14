#!/usr/bin/env python3
"""
Test Script untuk Google Gemini API - StoryLabs Indonesia
Versi sederhana untuk testing dasar functionality
"""

import sys
import os

def install_requirements():
    """Install required packages if not available"""
    try:
        import google.generativeai as genai
        print("✅ google-generativeai sudah terinstall")
        return True
    except ImportError:
        print("📦 Installing google-generativeai...")
        import subprocess
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "google-generativeai"])
            print("✅ google-generativeai berhasil diinstall")
            return True
        except Exception as e:
            print(f"❌ Gagal install google-generativeai: {e}")
            return False

def test_gemini_basic():
    """Test basic Gemini API functionality"""
    print("\n🎭 TESTING GEMINI API - STORYLABS INDONESIA")
    print("=" * 60)
    
    # API Key dari teman Anda
    api_key = "AIzaSyBsWCBiLjOQvkjHoNBjjskQ4tjRyK559SQ"
    
    try:
        # Import dan configure
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
        # Gunakan model yang benar (bukan gemini-pro yang sudah deprecated)
        print("🤖 Initializing Gemini 1.5 Flash model...")
        model = genai.GenerativeModel('gemini-1.5-flash')
        print("✅ Model berhasil diinisialisasi!")
        
        # Test 1: Greeting Indonesia
        print("\n🧪 TEST 1: Indonesian Greeting")
        print("-" * 40)
        response1 = model.generate_content("Katakan 'Halo' dalam bahasa Indonesia dengan ramah untuk anak-anak")
        
        if response1.text:
            print("📄 Response:")
            print(f"   {response1.text}")
            print("✅ Test 1 BERHASIL!")
        else:
            print("❌ Test 1 GAGAL - Tidak ada response")
            return False
            
        # Test 2: Story Generation
        print("\n🧪 TEST 2: Generate Financial Literacy Story")
        print("-" * 40)
        story_prompt = """
        Buatkan cerita pendek (50 kata) tentang anak bernama Sari yang belajar menabung untuk membeli buku.
        Cerita harus dalam bahasa Indonesia dan mudah dipahami anak usia 7 tahun.
        """
        
        response2 = model.generate_content(story_prompt)
        
        if response2.text:
            print("📖 Generated Story:")
            print(f"   {response2.text}")
            print("✅ Test 2 BERHASIL!")
        else:
            print("❌ Test 2 GAGAL - Tidak ada cerita yang dihasilkan")
            return False
            
        # Test 3: Math in Indonesian
        print("\n🧪 TEST 3: Simple Math in Indonesian")
        print("-" * 40)
        math_prompt = "Berapa hasil 10 + 5? Jelaskan dengan sederhana untuk anak-anak."
        
        response3 = model.generate_content(math_prompt)
        
        if response3.text:
            print("🔢 Math Response:")
            print(f"   {response3.text}")
            print("✅ Test 3 BERHASIL!")
        else:
            print("❌ Test 3 GAGAL - Tidak ada response")
            return False
        
        print("\n" + "=" * 60)
        print("🎉 SEMUA TEST BERHASIL!")
        print("✅ Gemini API siap digunakan untuk StoryLabs Indonesia")
        print("✅ Model: gemini-1.5-flash (updated model)")
        print("✅ Bahasa Indonesia: Berfungsi dengan baik")
        print("✅ Story Generation: Berfungsi dengan baik")
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print("\n🔧 POSSIBLE SOLUTIONS:")
        print("1. Pastikan API key benar")
        print("2. Pastikan internet connection stabil")
        print("3. Coba beberapa saat lagi (rate limiting)")
        print("4. Model gemini-pro sudah deprecated, gunakan gemini-1.5-flash")
        return False

def main():
    """Main function"""
    print("🚀 STORYLABS INDONESIA - GEMINI API TESTER")
    print("Testing dengan API Key dari teman Anda...")
    
    # Install requirements
    if not install_requirements():
        print("❌ Gagal install requirements")
        return
    
    # Run basic test
    success = test_gemini_basic()
    
    if success:
        print("\n🎯 NEXT STEPS:")
        print("1. Test berhasil! API key berfungsi dengan baik")
        print("2. Model gemini-1.5-flash sudah bekerja")
        print("3. Sekarang bisa lanjut setup backend dan frontend")
        print("4. Atau jalankan setup_quick.py untuk setup lengkap")
    else:
        print("\n❌ Test gagal. Periksa koneksi internet dan API key.")
    
    input("\nTekan Enter untuk keluar...")

if __name__ == "__main__":
    main() 