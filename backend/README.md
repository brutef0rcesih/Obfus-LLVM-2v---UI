# LLVM Obfuscation Backend

Python backend server for LLVM-based code obfuscation with string encryption.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Install system dependencies:
- LLVM tools: `clang`, `llvm-dis`, `llvm-as`, `llc`
- GCC compiler
- OpenSSL development libraries
- UPX (optional, for compression)

3. Run the server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /api/upload
Upload a C source file for obfuscation.

**Request:**
- Form data with `file` field

**Response:**
```json
{
  "message": "File uploaded successfully",
  "filename": "example.c",
  "size": 1234
}
```

### POST /api/obfuscate
Start obfuscation process.

**Request:**
```json
{
  "filename": "example.c",
  "parameters": {
    "stringEncryption": true,
    "protectionLevel": "standard"
  }
}
```

**Response:**
```json
{
  "job_id": "uuid-here",
  "status": "queued"
}
```

### GET /api/job/<job_id>
Get job status and progress.

**Response:**
```json
{
  "status": "processing",
  "progress": 50,
  "stage": "Applying obfuscation techniques...",
  "result": {...}
}
```

### GET /api/job/<job_id>/logs
Get processing logs.

**Response:**
```json
{
  "logs": [
    "[12:34:56] Starting obfuscation...",
    "[12:34:57] Encrypted 5 string(s)"
  ]
}
```

### GET /api/job/<job_id>/download
Download the obfuscated binary file.

## Features

- String encryption using AES-256-CBC
- LLVM bitcode obfuscation
- Runtime decryption
- Progress tracking and logging
- Report generation

