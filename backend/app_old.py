import os
import sys
import uuid
import argparse
import textwrap
import re
import base64
import json
import time
import shutil
import subprocess
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import threading
from datetime import datetime

# Import obfuscation modules
from string_encryption import process_string_encryption, check_tools_availability

app = Flask(__name__)
CORS(app)

# Configuration - Use absolute paths relative to this file
BACKEND_DIR = Path(__file__).parent.absolute()
UPLOAD_FOLDER = BACKEND_DIR / 'uploads'
OUTPUT_FOLDER = BACKEND_DIR / 'outputs'
UPLOAD_FOLDER.mkdir(exist_ok=True)
OUTPUT_FOLDER.mkdir(exist_ok=True)

print(f"Upload folder: {UPLOAD_FOLDER}")
print(f"Output folder: {OUTPUT_FOLDER}")

# Store job status and logs
jobs = {}
logs_store = {}

# Find LLVM tools
def find_llvm_tool(tool_name):
    """Find LLVM tool in PATH or common locations"""
    # Check environment variable first (e.g., LLVM_DIS_PATH, LLVM_AS_PATH, etc.)
    env_var = f'LLVM_{tool_name.upper().replace("-", "_")}_PATH'
    env_path = os.getenv(env_var)
    if env_path and Path(env_path).exists():
        return str(env_path)
    
    # Check generic LLVM_BIN_PATH
    llvm_bin = os.getenv('LLVM_BIN_PATH')
    if llvm_bin:
        potential_path = Path(llvm_bin) / tool_name
        if potential_path.exists():
            return str(potential_path)
        # Try with .exe extension on Windows
        if os.name == 'nt':
            potential_path = Path(llvm_bin) / f'{tool_name}.exe'
            if potential_path.exists():
                return str(potential_path)
    
    # Check if tool is in PATH
    tool_path = shutil.which(tool_name)
    if tool_path:
        return tool_path
    
    # Try common LLVM installation paths
    common_paths = [
        '/usr/bin',
        '/usr/local/bin',
        'C:\\Program Files\\LLVM\\bin',
        'C:\\Program Files (x86)\\LLVM\\bin',
        'C:\\LLVM\\bin',
        'E:\\downloads\\LLVM\\bin',  # User's LLVM installation
        os.path.expanduser('~\\AppData\\Local\\Programs\\LLVM\\bin'),
    ]
    
    for base_path in common_paths:
        potential_path = Path(base_path) / tool_name
        if potential_path.exists():
            return str(potential_path)
        # Try with .exe extension on Windows
        if os.name == 'nt':
            potential_path = Path(base_path) / f'{tool_name}.exe'
            if potential_path.exists():
                return str(potential_path)
    
    # Try with version suffix (e.g., llvm-dis-15)
    for version in ['15', '14', '16', '17', '18', '19', '20']:
        tool_path = shutil.which(f'{tool_name}-{version}')
        if tool_path:
            return tool_path
    
    return tool_name  # Fallback to just the name

# Cache tool paths
LLVM_DIS = find_llvm_tool('llvm-dis')
LLVM_AS = find_llvm_tool('llvm-as')
LLC = find_llvm_tool('llc')
CLANG = find_llvm_tool('clang') or 'clang'
GCC = find_llvm_tool('gcc') or 'gcc'

# ROBUST REGEX
STRING_RE = re.compile(
    r'(@\.str(?:\.\d+)?)\s*=\s*(private\s+)?unnamed_addr\s+constant\s+'
    r'\[(\d+)\s+x\s+i8\]\s+c"((?:[^"\\]|\\.)*)"',
    re.DOTALL
)

def encrypt_string(s: str, key: bytes) -> str:
    data = s.encode('utf-8')
    iv = get_random_bytes(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    ct = cipher.encrypt(pad(data, 16))
    return base64.urlsafe_b64encode(iv + ct).decode().rstrip('=')

def log_message(job_id, message):
    timestamp = datetime.now().strftime('%H:%M:%S')
    log_entry = f'[{timestamp}] {message}'
    if job_id not in logs_store:
        logs_store[job_id] = []
    logs_store[job_id].append(log_entry)
    print(f"Job {job_id}: {log_entry}")

def run_command(cmd, job_id, error_msg):
    """Run a command and handle errors properly"""
    log_message(job_id, f"Running: {cmd}")
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=300
        )
        if result.returncode != 0:
            error_output = result.stderr or result.stdout
            log_message(job_id, f"Command failed: {error_output}")
            raise Exception(f"{error_msg}\nError: {error_output}")
        if result.stdout:
            log_message(job_id, result.stdout.strip())
        return result
    except subprocess.TimeoutExpired:
        raise Exception(f"{error_msg}: Command timed out")
    except Exception as e:
        raise Exception(f"{error_msg}: {str(e)}")

def c_to_bc(c_path: Path, bc_path: Path, job_id):
    cmd = f'"{CLANG}" -emit-llvm -c -O0 "{c_path}" -o "{bc_path}"'
    run_command(cmd, job_id, "Failed: C → .bc")
    if not bc_path.exists():
        raise Exception("Failed: C → .bc (output file not created)")

def bc_to_ll(bc_path: Path, ll_path: Path, job_id):
    if not bc_path.exists():
        raise Exception("Bitcode file not found")
    cmd = f'"{LLVM_DIS}" "{bc_path}" -o "{ll_path}"'
    run_command(cmd, job_id, "Failed: llvm-dis")
    if not ll_path.exists():
        raise Exception("Failed: llvm-dis (output file not created)")

def obfuscate_ll(ll_path: Path, key: bytes, job_id):
    text = ll_path.read_text(encoding='utf-8')
    lines = text.splitlines()
    new_lines = []
    blobs = []
    string_id_to_blob = {}

    log_message(job_id, "Scanning for string constants...")
    count = 0
    for line in lines:
        m = STRING_RE.match(line.strip())
        if m:
            gid = m.group(1)
            length = int(m.group(3))
            escaped = m.group(4)
            plain = bytes(escaped, "utf-8").decode("unicode_escape")
            enc = encrypt_string(plain, key)
            bid = len(blobs)
            blobs.append((bid, enc, length))
            string_id_to_blob[gid] = bid
            new_line = f'{gid} = private unnamed_addr constant [{length} x i8] zeroinitializer, align 1'
            new_lines.append(new_line)
            count += 1
        else:
            new_lines.append(line)

    # Clean metadata
    final_lines = []
    for line in new_lines:
        if line.strip().startswith('!') and '=' in line and any(x in line for x in ['DILocalVariable', 'DIFile', 'DISubprogram']):
            continue
        cleaned = re.sub(r', !dbg !\d+', '', line)
        final_lines.append(cleaned)

    ll_path.write_text('\n'.join(final_lines), encoding='utf-8')
    log_message(job_id, f"Encrypted {count} string(s)")
    return blobs

def ll_to_bc(ll_path: Path, bc_path: Path, job_id):
    if not ll_path.exists():
        raise Exception("LLVM IR file not found")
    cmd = f'"{LLVM_AS}" "{ll_path}" -o "{bc_path}"'
    run_command(cmd, job_id, "Failed: llvm-as")
    if not bc_path.exists():
        raise Exception("Failed: llvm-as (output file not created)")

RUNTIME_TEMPLATE = r'''
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <openssl/evp.h>

static const unsigned char aes_key[32] = {KEY};

typedef struct {
    const char *b64;
    size_t len;
    char *plain;
} blob_t;

extern blob_t __start_blobs[];
extern blob_t __stop_blobs[];

__attribute__((constructor))
static void decrypt_strings(void) {
    for (blob_t *b = __start_blobs; b < __stop_blobs; ++b) {
        size_t l = strlen(b->b64);
        size_t bin_sz = ((l * 3) / 4) + 16;
        unsigned char *bin = malloc(bin_sz);
        size_t pos = 0;
        for (size_t i = 0; i < l; i += 4) {
            unsigned v[4] = {0};
            for (int j = 0; j < 4 && i + j < l; ++j) {
                char c = b->b64[i + j];
                if (c >= 'A' && c <= 'Z') v[j] = c - 'A';
                else if (c >= 'a' && c <= 'z') v[j] = c - 'a' + 26;
                else if (c >= '0' && c <= '9') v[j] = c - '0' + 52;
                else if (c == '-') v[j] = 62;
                else if (c == '_') v[j] = 63;
            }
            bin[pos++] = (v[0] << 2) | (v[1] >> 4);
            if (i + 1 < l) bin[pos++] = ((v[1] & 0xF) << 4) | (v[2] >> 2);
            if (i + 2 < l) bin[pos++] = ((v[2] & 0x3) << 6) | v[3];
        }

        unsigned char iv[16];
        memcpy(iv, bin, 16);
        EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
        EVP_DecryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, aes_key, iv);
        char *plain = malloc(b->len + 1);
        int len, total = 0;
        EVP_DecryptUpdate(ctx, (unsigned char*)plain, &len, bin + 16, pos - 16);
        total += len;
        EVP_DecryptFinal_ex(ctx, (unsigned char*)plain + total, &len);
        total += len;
        EVP_CIPHER_CTX_free(ctx);
        free(bin);
        plain[total] = '\0';
        b->plain = plain;
    }
}

const char *get_str(int id) {
    extern blob_t __start_blobs[];
    return __start_blobs[id].plain;
}
'''

def make_runtime_c(blobs, key):
    key_hex = ', '.join(f'0x{b:02x}' for b in key)
    c = RUNTIME_TEMPLATE.replace('{KEY}', '{' + key_hex + '}')

    blob_defs = []
    for idx, enc, length in blobs:
        chunks = textwrap.wrap(enc, 70)
        lit = '\\\n    "'.join(chunks)
        blob_defs.append(
            f'static const char b64_{idx}[] __attribute__((used)) = "{lit}";\n'
            f'static const blob_t blob_{idx} __attribute__((used, section(".blobs"))) = {{ &b64_{idx}[0], {length}, NULL }};'
        )
    c += '\n'.join(blob_defs) + '\n'
    return c

def build_final(obf_bc: Path, runtime_c: Path, out_path: Path, job_id):
    work = Path(f"_work_{uuid.uuid4().hex[:8]}")
    work.mkdir(exist_ok=True)

    try:
        s_file = work / "code.s"
        cmd = f'"{LLC}" -march=x86-64 -relocation-model=pic "{obf_bc}" -o "{s_file}"'
        run_command(cmd, job_id, "llc failed")
        if not s_file.exists():
            raise Exception("Assembly file not created")

        o_rt = work / "rt.o"
        cmd = f'"{CLANG}" -c -O0 -fPIC "{runtime_c}" -o "{o_rt}"'
        run_command(cmd, job_id, "Runtime compilation failed")
        if not o_rt.exists():
            raise Exception("Runtime object file not created")

        o_code = work / "code.o"
        cmd = f'"{CLANG}" -c -fPIC "{s_file}" -o "{o_code}"'
        run_command(cmd, job_id, "Assembly compilation failed")
        if not o_code.exists():
            raise Exception("Code object file not created")

        ld_script = work / "blobs.ld"
        ld_content = '''
SECTIONS {
    .blobs : {
        __start_blobs = .;
        *(.blobs)
        __stop_blobs = .;
    }
}
INSERT AFTER .data
'''
        ld_script.write_text(ld_content.strip())

        # Try linking with gcc first, fallback to clang
        link_cmd = f'"{GCC}" -fno-pie -no-pie "{o_rt}" "{o_code}" -T "{ld_script}" -o "{out_path}" -lssl -lcrypto'
        try:
            run_command(link_cmd, job_id, "Linking failed with GCC")
        except:
            # Fallback to clang
            link_cmd = f'"{CLANG}" -fno-pie -no-pie "{o_rt}" "{o_code}" -T "{ld_script}" -o "{out_path}" -lssl -lcrypto'
            run_command(link_cmd, job_id, "Linking failed with Clang")
        
        if not out_path.exists():
            raise Exception("Final binary not created")

        # Optional: strip symbols
        strip_tool = shutil.which('strip')
        if strip_tool:
            try:
                subprocess.run([strip_tool, '--strip-unneeded', str(out_path)], 
                             capture_output=True, timeout=30)
                log_message(job_id, "Symbols stripped")
            except:
                log_message(job_id, "Strip skipped")

        # Optional: compress with UPX
        upx_tool = shutil.which('upx')
        if upx_tool:
            try:
                subprocess.run([upx_tool, '--best', '--lzma', str(out_path)], 
                             capture_output=True, timeout=60)
                log_message(job_id, "Compressed with UPX")
            except:
                log_message(job_id, "UPX skipped (not installed or failed)")
    finally:
        shutil.rmtree(work, ignore_errors=True)

def generate_report(job_id, original_file, obfuscated_file, file_size_before, file_size_after, blobs_count, key_hex):
    report = {
        "job_id": job_id,
        "timestamp": datetime.now().isoformat(),
        "original_file": original_file,
        "obfuscated_file": obfuscated_file,
        "file_size": {
            "before": file_size_before,
            "after": file_size_after,
            "change_percent": ((file_size_after - file_size_before) / file_size_before * 100) if file_size_before > 0 else 0
        },
        "obfuscation": {
            "strings_encrypted": blobs_count,
            "encryption_key": key_hex,
            "method": "AES-256-CBC"
        },
        "status": "completed"
    }
    return report

def process_obfuscation(job_id, file_path, parameters):
    try:
        jobs[job_id] = {"status": "processing", "progress": 0, "stage": "Initializing..."}
        log_message(job_id, "Starting obfuscation process...")
        
        tmp = Path(f"_tmp_{uuid.uuid4().hex[:8]}")
        tmp.mkdir()
        
        try:
            jobs[job_id]["progress"] = 10
            jobs[job_id]["stage"] = "Analyzing file structure..."
            
            # Check if string encryption is enabled
            if not parameters.get('stringEncryption', False):
                raise Exception("String encryption must be enabled to use this backend")
            
            bc = tmp / "input.bc"
            ll = tmp / "input.ll"
            obf_bc = tmp / "obf.bc"
            rt_c = tmp / "runtime.c"
            
            # Generate key
            key = get_random_bytes(32)
            key_hex = key.hex()
            log_message(job_id, f"Generated AES-256 key: {key_hex[:16]}...")
            
            jobs[job_id]["progress"] = 20
            jobs[job_id]["stage"] = "Compiling C to LLVM bitcode..."
            c_to_bc(file_path, bc, job_id)
            
            jobs[job_id]["progress"] = 30
            jobs[job_id]["stage"] = "Disassembling bitcode..."
            bc_to_ll(bc, ll, job_id)
            
            jobs[job_id]["progress"] = 50
            jobs[job_id]["stage"] = "Applying obfuscation techniques..."
            blobs = obfuscate_ll(ll, key, job_id)
            
            jobs[job_id]["progress"] = 60
            jobs[job_id]["stage"] = "Assembling obfuscated code..."
            ll_to_bc(ll, obf_bc, job_id)
            
            jobs[job_id]["progress"] = 70
            jobs[job_id]["stage"] = "Generating runtime..."
            rt_c.write_text(make_runtime_c(blobs, key), encoding='utf-8')
            
            jobs[job_id]["progress"] = 80
            jobs[job_id]["stage"] = "Building final binary..."
            out_path = OUTPUT_FOLDER / f"{job_id}.bin"
            build_final(obf_bc, rt_c, out_path, job_id)
            
            jobs[job_id]["progress"] = 90
            jobs[job_id]["stage"] = "Generating reports..."
            
            file_size_before = file_path.stat().st_size
            file_size_after = out_path.stat().st_size if out_path.exists() else 0
            
            report = generate_report(
                job_id, 
                file_path.name, 
                out_path.name,
                file_size_before,
                file_size_after,
                len(blobs),
                key_hex
            )
            
            jobs[job_id]["progress"] = 100
            jobs[job_id]["stage"] = "Completed!"
            jobs[job_id]["status"] = "completed"
            jobs[job_id]["result"] = report
            jobs[job_id]["output_file"] = str(out_path)
            
            log_message(job_id, "Obfuscation completed successfully!")
            
        finally:
            import shutil
            shutil.rmtree(tmp, ignore_errors=True)
            
    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)
        log_message(job_id, f"ERROR: {str(e)}")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "message": "Backend is running"
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        filename = secure_filename(file.filename)
        file_path = UPLOAD_FOLDER / filename
        
        # Save the file
        file.save(str(file_path))
        
        # Verify file was saved
        if not file_path.exists():
            return jsonify({"error": f"Failed to save file to {file_path}"}), 500
        
        file_size = file_path.stat().st_size
        print(f"File uploaded: {filename} ({file_size} bytes) to {file_path}")
        
        return jsonify({
            "message": "File uploaded successfully",
            "filename": filename,
            "size": file_size
        })
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Upload error: {error_trace}")
        return jsonify({
            "error": "File upload failed",
            "details": str(e)
        }), 500

@app.route('/api/check-tools', methods=['GET'])
def check_tools():
    """Check if required tools are available"""
    tools_status = {
        'clang': shutil.which(CLANG) is not None,
        'llvm-dis': shutil.which(LLVM_DIS) is not None or Path(LLVM_DIS).exists(),
        'llvm-as': shutil.which(LLVM_AS) is not None or Path(LLVM_AS).exists(),
        'llc': shutil.which(LLC) is not None or Path(LLC).exists(),
        'gcc': shutil.which(GCC) is not None,
    }
    tools_status['all_available'] = all(tools_status.values())
    tools_status['tool_paths'] = {
        'clang': CLANG,
        'llvm-dis': LLVM_DIS,
        'llvm-as': LLVM_AS,
        'llc': LLC,
        'gcc': GCC,
    }
    return jsonify(tools_status)

@app.route('/api/obfuscate', methods=['POST'])
def start_obfuscation():
    try:
        if not request.json:
            return jsonify({"error": "No JSON data provided"}), 400
            
        data = request.json
        filename = data.get('filename')
        parameters = data.get('parameters', {})
        
        if not filename:
            return jsonify({"error": "Filename required"}), 400
        
        file_path = UPLOAD_FOLDER / filename
        if not file_path.exists():
            # List available files for debugging
            available_files = [f.name for f in UPLOAD_FOLDER.iterdir() if f.is_file()]
            print(f"Requested file: {filename}")
            print(f"Available files: {available_files}")
            return jsonify({
                "error": f"File not found: {filename}",
                "details": f"Upload folder: {UPLOAD_FOLDER}",
                "available_files": available_files
            }), 404
        
        # Check file extension
        if file_path.suffix.lower() != '.c':
            return jsonify({
                "error": "Only .c files are supported",
                "details": f"File extension: {file_path.suffix}"
            }), 400
        
        # Check if string encryption is enabled
        if not parameters.get('stringEncryption', False):
            return jsonify({"error": "String Encryption must be enabled to use this backend"}), 400
        
        # Check if tools are available
        llvm_dis_found = False
        if shutil.which(LLVM_DIS):
            llvm_dis_found = True
        elif LLVM_DIS != 'llvm-dis' and Path(LLVM_DIS).is_absolute() and Path(LLVM_DIS).exists():
            llvm_dis_found = True
        
        if not llvm_dis_found:
            print(f"ERROR: llvm-dis not found. Searched for: {LLVM_DIS}")
            
            # Check if the directory exists but tools are missing
            user_llvm_path = Path("E:\\downloads\\LLVM\\bin")
            if user_llvm_path.exists():
                # Check what tools are actually there
                available_tools = list(user_llvm_path.glob("llvm-*.exe"))
                missing_tools = []
                for tool in ['llvm-dis.exe', 'llvm-as.exe', 'llc.exe']:
                    if not (user_llvm_path / tool).exists():
                        missing_tools.append(tool)
                
                if missing_tools:
                    return jsonify({
                        "error": "LLVM installation incomplete. Missing required tools.",
                        "details": f"Found LLVM at: {user_llvm_path}\nMissing: {', '.join(missing_tools)}",
                        "suggestion": "Download complete LLVM package from https://github.com/llvm/llvm-project/releases (look for 'LLVM-XX.X.X-win64.exe')"
                    }), 500
            
            return jsonify({
                "error": "llvm-dis not found. Please install complete LLVM package.",
                "details": f"Searched for: {LLVM_DIS}",
                "suggestion": "Download from https://github.com/llvm/llvm-project/releases - get the full installer (not just Clang)"
            }), 500
        
        job_id = str(uuid.uuid4())
        jobs[job_id] = {"status": "queued", "progress": 0}
        
        # Start processing in background thread
        thread = threading.Thread(target=process_obfuscation, args=(job_id, file_path, parameters))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            "job_id": job_id,
            "status": "queued"
        })
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in start_obfuscation: {error_trace}")
        return jsonify({
            "error": "Internal server error",
            "details": str(e),
            "trace": error_trace if app.debug else None
        }), 500

@app.route('/api/job/<job_id>', methods=['GET'])
def get_job_status(job_id):
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
    
    job = jobs[job_id].copy()
    if 'output_file' in job:
        job['output_file'] = Path(job['output_file']).name
    
    return jsonify(job)

@app.route('/api/job/<job_id>/logs', methods=['GET'])
def get_job_logs(job_id):
    if job_id not in logs_store:
        return jsonify({"logs": []})
    
    return jsonify({"logs": logs_store[job_id]})

@app.route('/api/job/<job_id>/download', methods=['GET'])
def download_file(job_id):
    if job_id not in jobs or jobs[job_id]['status'] != 'completed':
        return jsonify({"error": "Job not completed"}), 404
    
    output_file = Path(jobs[job_id]['output_file'])
    if not output_file.exists():
        return jsonify({"error": "Output file not found"}), 404
    
    return send_file(str(output_file), as_attachment=True)

if __name__ == '__main__':
    print("=" * 60)
    print("LLVM Obfuscation Backend Starting...")
    print("=" * 60)
    def check_tool(tool_path, tool_name):
        if shutil.which(tool_path):
            return '✓'
        elif tool_path != tool_name and Path(tool_path).is_absolute() and Path(tool_path).exists():
            return '✓'
        else:
            return '✗'
    
    print(f"CLANG: {CLANG} ({check_tool(CLANG, 'clang')})")
    print(f"LLVM-DIS: {LLVM_DIS} ({check_tool(LLVM_DIS, 'llvm-dis')})")
    print(f"LLVM-AS: {LLVM_AS} ({check_tool(LLVM_AS, 'llvm-as')})")
    print(f"LLC: {LLC} ({check_tool(LLC, 'llc')})")
    print(f"GCC: {GCC} ({check_tool(GCC, 'gcc')})")
    print("=" * 60)
    print("Server starting on http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, port=5000)

