# 🚀 STORYLABS INDONESIA

Generator Cerita Literasi Keuangan untuk Anak Indonesia menggunakan Google Gemini AI.

## 🎯 Cara Menjalankan

### Terminal 1: Backend
```bash
cd backend
py -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
or 
C:\Users\msi-pc\Documents\Project\storylabs>cd backend

C:\Users\msi-pc\Documents\Project\storylabs\backend>.\venv\Scripts\activate

python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8002 --log-level debug

### Terminal 2: Frontend (terminal baru)
```bash
cd frontend
npm run dev
```

## 🌐 URLs

- **Backend API**: http://127.0.0.1:8000
- **Frontend**: http://localhost:3000
- **API Docs**: http://127.0.0.1:8000/docs

## ✅ Backend Status

Jika berhasil, akan muncul log:
```
INFO: GEMINI_API_KEY is SET (ends with ...9SQ)
INFO: Application startup complete
INFO: Uvicorn running on http://127.0.0.1:8000
```

## ✅ Frontend Status

Jika berhasil, akan muncul:
```
ready - started server on 0.0.0.0:3000
```

## 🔧 Troubleshooting

### Python not found
```bash
# Gunakan "py" bukan "python"
py -V   # cek versi Python

# Jika masih error, install Python dari python.org
# Pastikan centang "Add to PATH"
```

### npm not found
```bash
# Install Node.js dari nodejs.org
# Restart terminal setelah install
```

### API Key Invalid
```
✅ SUDAH DIPERBAIKI
API key sudah hardcoded di backend
```

---

💡 **Testing**: Gunakan `test_gemini_final.py` untuk test API secara terpisah. 