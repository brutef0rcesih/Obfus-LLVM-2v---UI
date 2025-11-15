# LLVM Obfuscation System - Setup Guide

## Overview

This is a full-stack application for LLVM-based code obfuscation with string encryption. The frontend is built with React, and the backend is a Python Flask server that performs the actual obfuscation.

## Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Install system dependencies:**

   **On Linux:**
   ```bash
   sudo apt-get install clang llvm gcc libssl-dev upx
   ```

   **On macOS:**
   ```bash
   brew install llvm gcc openssl upx
   ```

   **On Windows:**
   - Install LLVM from: https://llvm.org/builds/
   - Install MinGW or use WSL
   - Install OpenSSL development libraries

4. **Start the backend server:**
```bash
python app.py
```

The server will run on `http://localhost:5000`

## Frontend Setup

1. **Install Node.js dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or similar Vite port)

## Usage

1. **Start both servers:**
   - Backend: `python backend/app.py`
   - Frontend: `npm run dev`

2. **Upload a C file:**
   - Go to the Obfuscation page
   - Click "Choose File" and select a `.c` file
   - Click "Continue to Parameters"

3. **Configure parameters:**
   - **Important:** Enable "String Encryption" checkbox
   - Configure other settings as needed
   - Click "Start Obfuscation"

4. **Monitor progress:**
   - Watch the progress bar and logs
   - The system will show real-time processing logs

5. **Download result:**
   - Once complete, view the report
   - Click "Download ZIP" to get the obfuscated binary

## Features

- ✅ File upload via frontend
- ✅ String encryption using AES-256-CBC
- ✅ Real-time progress tracking
- ✅ Live processing logs
- ✅ Automatic report generation
- ✅ Download obfuscated binaries

## API Endpoints

- `POST /api/upload` - Upload C source file
- `POST /api/obfuscate` - Start obfuscation job
- `GET /api/job/<job_id>` - Get job status
- `GET /api/job/<job_id>/logs` - Get processing logs
- `GET /api/job/<job_id>/download` - Download result

## Notes

- The backend requires String Encryption to be enabled
- Only `.c` files are currently supported
- The obfuscated binary includes runtime decryption
- Encryption keys are generated automatically and shown in the report

