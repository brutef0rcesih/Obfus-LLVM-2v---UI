# LLVM Obfuscation System - Setup Guide

## Overview

The project ships a React/Tauri front-end and a Python CLI that orchestrates
LLVM-based obfuscation passes. The backend no longer exposes an HTTP server; all
work is driven through the `backend/app.py` command-line tool, which can run
jobs immediately or queue them for a persistent background service.

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

4. **Verify tool availability:**
```bash
python app.py check-tools
```

## Running Jobs

### Immediate execution

Run obfuscation directly from the CLI and wait for completion:

**Standard syntax:**
```bash
python app.py obfuscate -i uploads/sample.c -t string-encryption --report report.json
```

**Compact syntax:**
```bash
python app.py -ob -i uploads/sample.c -s -b -o output.bin
```

Short flags: `-ob` (obfuscate), `-i` (input), `-s` (string encryption), `-b` (bogus), 
`-c` (control flow), `-k` (key function virtualization), `-p` (opaque predicates), 
`-t` (preprocessor trickery), `-a` (all techniques), `-o` (custom output name), 
`-r` (report file), `-bg` (background/queue job)

### Queued (background) execution

Queue a job and return immediately:

```bash
python app.py obfuscate -i uploads/sample.c --all --background
```

Queued jobs are stored on disk under `backend/jobdata` and require the service
loop to be running to make progress.

## Background Service

Start the worker loop to process queued jobs:

```bash
python app.py serve
```

Useful flags:

- `--poll-interval <seconds>`: adjust idle wait time (default 2s)
- `--once`: process a single job then exit (handy for cron/task scheduler)

### Linux (systemd) example

Create `/etc/systemd/system/llvm-obf.service`:

```
[Unit]
Description=LLVM Obfuscation Worker
WorkingDirectory=/path/to/repo/backend
After=network.target

[Service]
ExecStart=/usr/bin/python3 app.py serve
Restart=on-failure
User=youruser

[Install]
WantedBy=multi-user.target
```

Then run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now llvm-obf.service
```

### Windows (Task Scheduler) example

1. Open **Task Scheduler** → **Create Task...**
2. On **Actions**, add: `Program/script: python`,
   `Arguments: app.py serve`, `Start in: C:\path\to\repo\backend`
3. On **Triggers**, choose **At startup** or a schedule that suits you
4. Save the task; ensure Python is on the system PATH or use the absolute path

## Monitoring Jobs

- List or inspect jobs: `python app.py status` or `python app.py status <job_id>`
- Tail logs: `python app.py logs <job_id>`

Completed artifacts live under `backend/outputs` and metadata/logs under
`backend/jobdata/<job_id>`.

## Frontend Setup

1. **Install Node.js dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or similar Vite port). Integrate
with the CLI by shelling out to `backend/app.py` or by monitoring the job store
directories.

## Notes

- Only `.c` files are currently supported
- String Encryption requires OpenSSL libraries at link-time
- Outputs are produced in the `backend/outputs` directory
- Reports are optional and can be written via `--report <path>`

