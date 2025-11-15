# Installing LLVM Tools

The obfuscation backend requires LLVM tools to be installed. Here's how to install them on different platforms:

## Windows

### Option 1: Official LLVM Installer (Recommended)
1. Download LLVM from: https://github.com/llvm/llvm-project/releases
   - Look for "LLVM-XX.X.X-win64.exe" (latest version)
2. Run the installer
3. **Important**: Check "Add LLVM to the system PATH" during installation
4. Restart your terminal/command prompt after installation

### Option 2: Using Chocolatey
```powershell
choco install llvm
```

### Option 3: Using Scoop
```powershell
scoop install llvm
```

### Option 4: Manual Installation
1. Download the LLVM pre-built binaries
2. Extract to a folder (e.g., `C:\LLVM`)
3. Add the `bin` folder to your system PATH:
   - Open System Properties → Environment Variables
   - Add `C:\LLVM\bin` to PATH
4. Or set environment variable in your terminal:
   ```powershell
   $env:LLVM_BIN_PATH = "C:\LLVM\bin"
   ```

## Linux

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install llvm clang
```

### Fedora
```bash
sudo dnf install llvm clang
```

### Arch Linux
```bash
sudo pacman -S llvm clang
```

## macOS

### Using Homebrew
```bash
brew install llvm
```

## Verify Installation

After installation, verify the tools are available:

```bash
llvm-dis --version
llvm-as --version
llc --version
clang --version
```

## Environment Variables (Optional)

If LLVM is installed in a non-standard location, you can set environment variables:

- `LLVM_BIN_PATH` - Path to LLVM bin directory
- `LLVM_LLVM_DIS_PATH` - Specific path to llvm-dis
- `LLVM_LLVM_AS_PATH` - Specific path to llvm-as
- `LLVM_LLC_PATH` - Specific path to llc

Example (Windows PowerShell):
```powershell
$env:LLVM_BIN_PATH = "C:\Program Files\LLVM\bin"
```

Example (Linux/macOS):
```bash
export LLVM_BIN_PATH="/usr/local/llvm/bin"
```

## Troubleshooting

1. **Tools not found after installation:**
   - Restart your terminal/command prompt
   - Verify PATH includes LLVM bin directory
   - Check if tools exist: `where llvm-dis` (Windows) or `which llvm-dis` (Linux/macOS)

2. **Permission errors:**
   - Make sure you have write permissions in the uploads/outputs directories
   - On Linux/macOS, you might need to use `sudo` for some operations

3. **Version compatibility:**
   - LLVM 14+ is recommended
   - Older versions may work but are not tested

