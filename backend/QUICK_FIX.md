# Quick Fix for Missing LLVM Tools

## Problem
Your LLVM installation at `E:\downloads\LLVM\bin` is missing the required tools:
- `llvm-dis.exe` (LLVM disassembler)
- `llvm-as.exe` (LLVM assembler)  
- `llc.exe` (LLVM compiler)

## Solution

### Option 1: Download Complete LLVM Package (Recommended)

1. **Download the full LLVM installer:**
   - Go to: https://github.com/llvm/llvm-project/releases
   - Look for: `LLVM-XX.X.X-win64.exe` (latest version, e.g., LLVM-18.1.0-win64.exe)
   - **Important**: Get the full LLVM package, not just Clang

2. **Install it:**
   - Run the installer
   - **Check "Add LLVM to the system PATH"** during installation
   - Install to default location or your preferred location

3. **Restart your backend server**

### Option 2: Use Your Existing Installation

If you want to use `E:\downloads\LLVM\bin`, you need to:
1. Download the complete LLVM package (not just Clang)
2. Extract/copy the missing tools (`llvm-dis.exe`, `llvm-as.exe`, `llc.exe`) to that directory

### Option 3: Set Environment Variable

If you install LLVM to a different location:

**PowerShell (temporary for current session):**
```powershell
$env:LLVM_BIN_PATH = "C:\Program Files\LLVM\bin"
```

**PowerShell (permanent for user):**
```powershell
[System.Environment]::SetEnvironmentVariable('LLVM_BIN_PATH', 'C:\Program Files\LLVM\bin', 'User')
```

**Command Prompt (temporary):**
```cmd
set LLVM_BIN_PATH=C:\Program Files\LLVM\bin
```

Then restart your backend server.

## Verify Installation

After installing, verify the tools exist:
```powershell
Test-Path "C:\Program Files\LLVM\bin\llvm-dis.exe"
Test-Path "C:\Program Files\LLVM\bin\llvm-as.exe"
Test-Path "C:\Program Files\LLVM\bin\llc.exe"
```

All should return `True`.

