#!/usr/bin/env python3
"""
Test Script untuk ElevenLabs BEE ARD Voice Integration
Test sederhana untuk memastikan voice BEE ARD bekerja dengan API key yang diberikan
"""

import requests
import sys
from elevenlabs import ElevenLabs

# Konfigurasi dari user
API_KEY = "sk_8a4b8f1df7f7899bf2f7234d54670eaa5bbc12e4cf251cef"
BEE_ARD_VOICE_ID = "1k39YpzqXZn52BgyLyGO"
TEST_TEXT = "haha kamu tidak bisa lari lagi sudah sekarang main sabung ayam saja. dah malam masih belum tidur capek deh"

def test_elevenlabs_direct():
    """Test ElevenLabs API secara langsung"""
    print("🎯 Testing ElevenLabs API directly...")
    
    try:
        client = ElevenLabs(api_key=API_KEY)
        
        print(f"✅ ElevenLabs client created successfully")
        print(f"🎤 Testing voice ID: {BEE_ARD_VOICE_ID}")
        print(f"📝 Test text: {TEST_TEXT[:50]}...")
        
        # Generate audio
        audio_generator = client.text_to_speech.convert(
            voice_id=BEE_ARD_VOICE_ID,
            output_format="mp3_44100_128",
            text=TEST_TEXT,
            model_id="eleven_multilingual_v2",
        )
        
        # Save to file untuk test
        output_file = "test_bee_ard_output.mp3"
        with open(output_file, 'wb') as f:
            for chunk in audio_generator:
                f.write(chunk)
        
        print(f"✅ Audio generated successfully and saved to {output_file}")
        return True
        
    except Exception as e:
        print(f"❌ Error testing ElevenLabs API: {e}")
        return False

def test_backend_endpoint():
    """Test backend endpoint StoryLabs"""
    print("\n🎯 Testing StoryLabs backend endpoint...")
    
    try:
        # Endpoint backend (sesuaikan dengan setup local)
        url = "http://localhost:8000/api/story/generate-audio"
        
        headers = {
            "Content-Type": "application/json",
            "X-ElevenLabs-Key": API_KEY
        }
        
        payload = {
            "text": TEST_TEXT,
            "provider": "elevenlabs",
            "voice": BEE_ARD_VOICE_ID
        }
        
        print(f"📡 Sending request to {url}")
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            print(f"✅ Backend endpoint working! Status: {response.status_code}")
            
            # Save response audio
            with open("test_backend_bee_ard.mp3", "wb") as f:
                f.write(response.content)
            print(f"✅ Audio saved to test_backend_bee_ard.mp3")
            return True
        else:
            print(f"❌ Backend endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("⚠️ Cannot connect to backend (server mungkin belum running)")
        print("💡 Jalankan backend dengan: cd backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000")
        return False
    except Exception as e:
        print(f"❌ Error testing backend: {e}")
        return False

def main():
    print("🚀 Starting ElevenLabs BEE ARD Voice Integration Test")
    print("=" * 60)
    
    # Test 1: Direct ElevenLabs API
    direct_test = test_elevenlabs_direct()
    
    # Test 2: Backend endpoint
    backend_test = test_backend_endpoint()
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS:")
    print(f"   Direct ElevenLabs API: {'✅ PASS' if direct_test else '❌ FAIL'}")
    print(f"   Backend Endpoint: {'✅ PASS' if backend_test else '❌ FAIL'}")
    
    if direct_test and backend_test:
        print("\n🎉 ALL TESTS PASSED! BEE ARD voice integration working perfectly!")
    elif direct_test:
        print("\n⚠️ ElevenLabs API works, but backend needs to be started")
    else:
        print("\n❌ Tests failed. Check API key and voice ID")
    
    print("\n💡 Generated audio files:")
    print("   - test_bee_ard_output.mp3 (direct API test)")
    print("   - test_backend_bee_ard.mp3 (backend test)")

if __name__ == "__main__":
    main()
