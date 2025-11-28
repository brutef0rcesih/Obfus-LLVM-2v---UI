@echo off
cd /d "D:\obfus-llvm\llvm"
set CARGO_TARGET_DIR=C:\Users\Public\tauri-build
set RUST_BACKTRACE=1
set CARGO_BUILD_JOBS=1
npm run tauri dev
pause