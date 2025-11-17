#!/usr/bin/env python3
"""
Control Flow Obfuscation Module
Provides control flow flattening and anti-debug features
"""

import os
import sys
import uuid
import random
import secrets
import hashlib
import subprocess
import tempfile
import zlib
import base64
import re
from pathlib import Path
from datetime import datetime
from typing import List, Dict

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

# Unique state IDs
_used_hashes = set()
def new_state() -> int:
    while True:
        s = random.randint(0x100000, 0xfffffff)
        h = hashlib.sha256(str(s).encode()).hexdigest()[:10]
        if h not in _used_hashes:
            _used_hashes.add(h)
            return s

# Opaque predicates
def opaque_true() -> str:
    x = random.randint(20, 200)
    y = x * x
    z = random.randint(7, 31)
    return f"(({x}*{x}=={y}) && ({y}%{z}!=0 || 1))"

def opaque_false() -> str:
    return f"(rand() == {secrets.randbits(128)})"

# Extract functions
FUNC_RE = re.compile(
    r'((?:[\w\s*~&:]+\b)+)\s+'          # return type
    r'(\w+)\s*'                         # name
    r'\(([^)]*)\)\s*'                   # params
    r'(\{.*?\})',                       # body
    re.DOTALL
)

def extract_functions(source: str) -> List[Dict]:
    funcs = []
    for m in FUNC_RE.finditer(source):
        ret_type, name, params, body = m.groups()
        funcs.append({"name": name, "full": m.group(0), "body": body})
    return funcs

# Flatten function
def flatten_function(func: Dict) -> str:
    name = func["name"]
    body = func["body"][1:-1].strip()
    stmts = [s.strip() for s in body.split(';') if s.strip()]
    if not stmts:
        return func["full"]

    entry = new_state()
    exit_ = new_state()
    states = [entry] + [new_state() for _ in range(len(stmts)-1)] + [exit_]

    cases = []
    for i, stmt in enumerate(stmts):
        cur, nxt = states[i], states[i+1]
        junk = [
            f"int __j{random.randint(0,999)} = {random.randint(1,100)} + {random.randint(1,100)};",
            f"__j{random.randint(0,999)} *= 2;",
        ]
        case = f"""
        if ({opaque_true()} && state == {cur}) {{
            {stmt};
            state = {nxt};
            continue;
        }} else if ({opaque_false()}) {{
            {" ".join(junk)}
        }}
        """
        cases.append(case)

    dispatcher = f"""
    int state = {entry};
    while (1) {{
        {''.join(cases)}
        if (state == {exit_}) break;
    }}
    """
    return func["full"].replace(func["body"], "{" + dispatcher + "}")

def encrypt_payload(data: str, key: bytes) -> bytes:
    """Encrypt and compress payload"""
    compressed = zlib.compress(data.encode('utf-8'))
    cipher = AES.new(key, AES.MODE_CBC)
    ct = cipher.encrypt(pad(compressed, 16))
    return cipher.iv + ct

# C Loader Template
LOADER_TEMPLATE = r'''
#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/syscall.h>
#include <sys/wait.h>
#include <sys/ptrace.h>
#include <zlib.h>
#include <openssl/evp.h>

static int memfd_create(const char *name, unsigned int flags) {
    return syscall(__NR_memfd_create, name, flags);
}

__attribute__((constructor)) void anti_debug() {
    if (ptrace(PTRACE_TRACEME, 0, 1, 0) == -1) _exit(0);
}

int is_vm() {
    unsigned int eax, ebx, ecx, edx;
    __asm__ __volatile__ ("cpuid"
                          : "=a" (eax), "=b" (ebx), "=c" (ecx), "=d" (edx)
                          : "a" (1));
    if (ecx & (1 << 31)) return 1;
    return 0;
}

int unpad(unsigned char *data, int len) {
    if (len == 0) return 0;
    int pad = data[len-1];
    if (pad < 1 || pad > 16) return 0;
    for (int i = 0; i < pad; i++) {
        if (data[len-1-i] != pad) return 0;
    }
    return len - pad;
}

unsigned char key[] = "{KEY_B64}";
unsigned char enc[] = "{ENC_B64}";

int main() {
    if (is_vm()) _exit(0);

    EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
    if (!ctx) return 1;

    if (EVP_DecryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, key, enc) != 1) goto end;
    int len = sizeof(enc) - 16;
    unsigned char *ct = malloc(len + 16);
    int outlen = 0, final_len = 0;
    if (EVP_DecryptUpdate(ctx, ct, &outlen, enc + 16, len) != 1) goto cleanup;
    if (EVP_DecryptFinal_ex(ctx, ct + outlen, &final_len) != 1) goto cleanup;
    int padded_len = outlen + final_len;

    int unpadded = unpad(ct, padded_len);
    if (unpadded <= 0) goto cleanup;

    z_stream strm;
    strm.zalloc = Z_NULL; strm.zfree = Z_NULL; strm.opaque = Z_NULL;
    strm.avail_in = unpadded; strm.next_in = ct;
    if (inflateInit(&strm) != Z_OK) goto cleanup;
    unsigned long dsize = 64 * 1024;
    unsigned char *plain = malloc(dsize);
    strm.avail_out = dsize; strm.next_out = plain;
    if (inflate(&strm, Z_FINISH) != Z_STREAM_END) {
        free(plain); goto cleanup;
    }
    inflateEnd(&strm);
    free(ct);

    int fd = memfd_create("obf", 0);
    if (fd == -1) { free(plain); return 1; }
    write(fd, plain, strm.total_out);
    free(plain);

    char fd_path[64];
    snprintf(fd_path, sizeof(fd_path), "/proc/self/fd/%d", fd);

    pid_t pid = fork();
    if (pid == 0) {
        char *argv[] = {"/usr/bin/tcc", "-run", fd_path, NULL};
        execve(argv[0], argv, NULL);
        _exit(1);
    }
    waitpid(pid, NULL, 0);
    close(fd);
    return 0;

cleanup:
    free(ct);
end:
    EVP_CIPHER_CTX_free(ctx);
    return 1;
}
'''

def log_message(job_id, message, log_callback=None):
    """Log message with timestamp"""
    timestamp = datetime.now().strftime('%H:%M:%S')
    log_entry = f'[{timestamp}] {message}'
    if log_callback:
        log_callback(job_id, log_entry)
    print(f"Job {job_id}: {log_entry}")

def run_command(cmd, job_id, error_msg, log_callback=None):
    """Run a command and handle errors properly"""
    log_message(job_id, f"Running: {cmd}", log_callback)
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
            log_message(job_id, f"Command failed: {error_output}", log_callback)
            raise Exception(f"{error_msg}\nError: {error_output}")
        if result.stdout:
            log_message(job_id, result.stdout.strip(), log_callback)
        return result
    except subprocess.TimeoutExpired:
        raise Exception(f"{error_msg}: Command timed out")
    except Exception as e:
        raise Exception(f"{error_msg}: {str(e)}")

def generate_report(job_id, original_file, obfuscated_file, file_size_before, file_size_after):
    """Generate obfuscation report"""
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
            "technique": "Control Flow Flattening",
            "features": ["Anti-Debug", "Anti-VM", "In-Memory Execution"],
            "encryption": "AES-256-CBC + zlib compression"
        },
        "status": "completed"
    }
    return report

def process_control_flow_obfuscation(job_id, file_path, parameters, output_folder, log_callback=None):
    """Main control flow obfuscation process"""
    try:
        log_message(job_id, "Starting control flow obfuscation...", log_callback)
        
        # Check dependencies
        if not subprocess.run(["which", "tcc"], capture_output=True).returncode == 0:
            raise Exception("tcc not found. Install with: sudo apt install tcc")
        
        # Read source file
        with open(file_path, "r", encoding="utf-8") as f:
            src = f.read()
        
        log_message(job_id, "Applying control flow flattening...", log_callback)
        
        # Apply control flow flattening to all functions
        for func in extract_functions(src):
            src = src.replace(func["full"], flatten_function(func))
        
        log_message(job_id, "Encrypting payload...", log_callback)
        
        # Generate encryption key and encrypt
        key = secrets.token_bytes(32)
        encrypted = encrypt_payload(src, key)
        
        # Generate loader
        loader_c = LOADER_TEMPLATE.replace(
            "{KEY_B64}", base64.b64encode(key).decode()
        ).replace(
            "{ENC_B64}", base64.b64encode(encrypted).decode()
        )
        
        # Compile baseline binary for size comparison
        baseline_path = Path(tempfile.gettempdir()) / f"{job_id}_baseline.bin"
        try:
            cmd_baseline = f"gcc -O0 '{file_path}' -o '{baseline_path}'"
            run_command(cmd_baseline, job_id, "Baseline compilation", log_callback)
        except:
            baseline_path = file_path
        
        # Create temporary loader file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.c', delete=False) as f:
            f.write(loader_c)
            loader_file = f.name
        
        try:
            log_message(job_id, "Compiling obfuscated binary...", log_callback)
            
            # Compile the loader
            out_path = output_folder / f"{job_id}.bin"
            cmd = f"gcc '{loader_file}' -o '{out_path}' -O2 -s -lcrypto -lz -lssl"
            run_command(cmd, job_id, "Compilation failed", log_callback)
            
            if not out_path.exists():
                raise Exception("Output binary not created")
            
            # Capture size before UPX for accurate comparison
            file_size_before = baseline_path.stat().st_size
            file_size_after = out_path.stat().st_size
            
            # Optional: UPX compression
            if subprocess.run(["which", "upx"], capture_output=True).returncode == 0:
                try:
                    subprocess.run(["upx", "--best", "--ultra-brute", "--lzma", str(out_path)], 
                                 capture_output=True, timeout=60)
                    log_message(job_id, "Compressed with UPX", log_callback)
                except:
                    log_message(job_id, "UPX compression skipped", log_callback)
            
            report = generate_report(
                job_id,
                file_path.name,
                out_path.name,
                file_size_before,
                file_size_after
            )
            
            log_message(job_id, "Control flow obfuscation completed successfully!", log_callback)
            
            return {
                "status": "completed",
                "result": report,
                "output_file": str(out_path)
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(loader_file):
                os.remove(loader_file)
            
    except Exception as e:
        log_message(job_id, f"ERROR: {str(e)}", log_callback)
        return {
            "status": "error",
            "error": str(e)
        }

def check_requirements():
    """Check if required tools are available"""
    requirements = {
        'tcc': subprocess.run(["which", "tcc"], capture_output=True).returncode == 0,
        'gcc': subprocess.run(["which", "gcc"], capture_output=True).returncode == 0,
        'upx': subprocess.run(["which", "upx"], capture_output=True).returncode == 0,
    }
    requirements['all_available'] = requirements['tcc'] and requirements['gcc']
    return requirements