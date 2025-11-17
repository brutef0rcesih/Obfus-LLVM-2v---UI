#!/usr/bin/env python3
"""
Key Function Virtualization Module
Provides VM-based function obfuscation
"""

import os
import re
import secrets
import subprocess
import tempfile
import zlib
import base64
from pathlib import Path
from datetime import datetime

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

# VM opcodes
OPCODES = {
    'PUSH_INT': 0x01,
    'PUSH_STR': 0x02,
    'ADD': 0x03,
    'PRINT': 0x05,
    'HALT': 0x07,
}

def log_message(job_id, message, log_callback=None):
    """Log message with timestamp"""
    timestamp = datetime.now().strftime('%H:%M:%S')
    log_entry = f'[{timestamp}] {message}'
    if log_callback:
        log_callback(job_id, log_entry)
    print(f"Job {job_id}: {log_entry}")

def compile_to_vm(source: str, job_id, log_callback=None):
    """Compile source to VM bytecode and constants"""
    log_message(job_id, "Compiling to VM bytecode...", log_callback)
    
    vm = []
    str_consts = []
    int_consts = []
    str_map = {}
    int_map = {}

    def add_str_const(val):
        if val not in str_map:
            str_map[val] = len(str_consts)
            str_consts.append(val)
        return str_map[val]

    def add_int_const(val):
        if val not in int_map:
            int_map[val] = len(int_consts)
            int_consts.append(val)
        return int_map[val]

    # Extract printf patterns
    pattern = r'printf\s*\(\s*"([^"]*)"\s*,\s*add\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*\)'
    match = re.search(pattern, source)
    if not match:
        # Try to find simpler patterns
        simple_pattern = r'printf\s*\(\s*"([^"]*)"\s*\)'
        simple_match = re.search(simple_pattern, source)
        if simple_match:
            fmt = simple_match.group(1)
            vm.extend([
                (OPCODES['PUSH_STR'], add_str_const(fmt)),
                (OPCODES['PRINT'], 0),
                (OPCODES['HALT'], 0),
            ])
        else:
            raise Exception("No supported printf pattern found")
    else:
        fmt, a, b = match.groups()
        a, b = int(a), int(b)
        vm.extend([
            (OPCODES['PUSH_STR'], add_str_const(fmt)),
            (OPCODES['PUSH_INT'], add_int_const(a)),
            (OPCODES['PUSH_INT'], add_int_const(b)),
            (OPCODES['ADD'], 0),
            (OPCODES['PRINT'], 0),
            (OPCODES['HALT'], 0),
        ])
    
    log_message(job_id, f"Generated VM with {len(vm)} instructions", log_callback)
    return vm, str_consts, int_consts

def serialize(vm, str_consts, int_consts, job_id, log_callback=None):
    """Serialize VM code and constants to bytes"""
    log_message(job_id, "Serializing VM bytecode...", log_callback)
    
    code = bytearray()
    for op, arg in vm:
        code.append(op)
        code.append(arg & 0xFF)

    str_data = bytearray()
    for s in str_consts:
        enc = s.encode('utf-8')
        str_data.extend(enc[:63] + b'\x00' * (64 - len(enc)))

    int_data = bytearray()
    for i in int_consts:
        int_data.extend(i.to_bytes(4, 'little'))

    log_message(job_id, f"Serialized: {len(code)} code bytes, {len(str_data)} string bytes, {len(int_data)} int bytes", log_callback)
    return bytes(code), bytes(str_data), bytes(int_data)

def encrypt_payload(code, str_data, int_data, key, job_id, log_callback=None):
    """Encrypt and compress code + constants"""
    log_message(job_id, "Encrypting VM payload...", log_callback)
    
    data = code + str_data + int_data
    compressed = zlib.compress(data)
    cipher = AES.new(key, AES.MODE_CBC)
    ct = cipher.encrypt(pad(compressed, 16))
    
    log_message(job_id, f"Payload: {len(data)} bytes -> {len(compressed)} compressed -> {len(ct)} encrypted", log_callback)
    return cipher.iv + ct

def bytes_to_c_array(b):
    """Convert bytes to C-style byte array string"""
    return "{" + ", ".join(f"0x{byte:02x}" for byte in b) + "}"

# VM Loader Template
VM_LOADER = r'''
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <zlib.h>
#include <openssl/evp.h>

unsigned char key[] = {KEY};
unsigned char enc[] = {ENC};

int main() {
    EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
    if (!ctx) return 1;
    
    if (!EVP_DecryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, key, enc)) {
        EVP_CIPHER_CTX_free(ctx);
        return 1;
    }
    
    int len = sizeof(enc) - 16;
    unsigned char *ct = malloc(len);
    if (!ct) {
        EVP_CIPHER_CTX_free(ctx);
        return 1;
    }
    
    int outlen = 0, flen = 0;
    if (!EVP_DecryptUpdate(ctx, ct, &outlen, enc + 16, len)) {
        free(ct);
        EVP_CIPHER_CTX_free(ctx);
        return 1;
    }
    
    if (!EVP_DecryptFinal_ex(ctx, ct + outlen, &flen)) {
        free(ct);
        EVP_CIPHER_CTX_free(ctx);
        return 1;
    }
    
    outlen += flen;
    EVP_CIPHER_CTX_free(ctx);
    
    z_stream strm = {0};
    if (inflateInit(&strm) != Z_OK) {
        free(ct);
        return 1;
    }
    
    unsigned long dsize = 2048;
    unsigned char *plain = malloc(dsize);
    if (!plain) {
        free(ct);
        return 1;
    }
    
    strm.avail_in = outlen;
    strm.next_in = ct;
    strm.avail_out = dsize;
    strm.next_out = plain;
    
    int inf_ret = inflate(&strm, Z_FINISH);
    if (inf_ret != Z_STREAM_END) {
        free(ct);
        free(plain);
        inflateEnd(&strm);
        return 1;
    }
    
    inflateEnd(&strm);
    free(ct);
    
    unsigned char *code = plain;
    unsigned char *str_consts = plain + {CODE_LEN};
    unsigned char *int_consts = str_consts + {STR_LEN};
    
    void *stack[256] = {0};
    int sp = -1;
    int pc = 0;
    
    while (1) {
        if (pc >= {CODE_LEN}) {
            free(plain);
            return 1;
        }
        
        int op = code[pc++];
        int arg = code[pc++];
        
        switch (op) {
            case 1: { // PUSH_INT
                if (arg * 4 >= {INT_LEN}) {
                    free(plain);
                    return 1;
                }
                stack[++sp] = (void*)(intptr_t)*(int*)(int_consts + arg * 4);
                break;
            }
            case 2: { // PUSH_STR
                if (arg * 64 >= {STR_LEN}) {
                    free(plain);
                    return 1;
                }
                stack[++sp] = (void*)(str_consts + arg * 64);
                break;
            }
            case 3: { // ADD
                if (sp < 1) {
                    free(plain);
                    return 1;
                }
                int b = (int)(intptr_t)stack[sp--];
                int a = (int)(intptr_t)stack[sp--];
                stack[++sp] = (void*)(intptr_t)(a + b);
                break;
            }
            case 5: { // PRINT
                if (sp < 1) {
                    free(plain);
                    return 1;
                }
                int val = (int)(intptr_t)stack[sp--];
                char *fmt = (char*)stack[sp--];
                if (!fmt) {
                    free(plain);
                    return 1;
                }
                printf(fmt, val);
                fflush(stdout);
                break;
            }
            case 7: { // HALT
                free(plain);
                return 0;
            }
            default:
                free(plain);
                return 1;
        }
    }
}
'''

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
            "technique": "Key Function Virtualization",
            "features": ["VM Execution", "Encrypted Bytecode", "Stack-based VM"],
            "encryption": "AES-256-CBC + zlib compression"
        },
        "status": "completed"
    }
    return report

def process_key_function_virtualization(job_id, file_path, parameters, output_folder, log_callback=None):
    """Main key function virtualization process"""
    try:
        log_message(job_id, "Starting key function virtualization...", log_callback)
        
        # Read source file
        with open(file_path, "r") as f:
            src = f.read()
        
        # Compile to VM bytecode
        vm, str_consts, int_consts = compile_to_vm(src, job_id, log_callback)
        
        # Serialize bytecode
        code_bytes, str_bytes, int_bytes = serialize(vm, str_consts, int_consts, job_id, log_callback)
        
        # Encrypt payload
        key = secrets.token_bytes(32)
        encrypted = encrypt_payload(code_bytes, str_bytes, int_bytes, key, job_id, log_callback)
        
        # Generate loader
        log_message(job_id, "Generating VM loader...", log_callback)
        loader_c = VM_LOADER.replace("{KEY}", bytes_to_c_array(key))
        loader_c = loader_c.replace("{ENC}", bytes_to_c_array(encrypted))
        loader_c = loader_c.replace("{CODE_LEN}", str(len(code_bytes)))
        loader_c = loader_c.replace("{STR_LEN}", str(len(str_bytes)))
        loader_c = loader_c.replace("{INT_LEN}", str(len(int_bytes)))
        
        # Create temporary loader file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.c', delete=False) as f:
            f.write(loader_c)
            loader_file = f.name
        
        try:
            log_message(job_id, "Compiling VM loader...", log_callback)
            
            # Compile the loader
            out_path = output_folder / f"{job_id}.bin"
            cmd = ["gcc", loader_file, "-o", str(out_path), "-O2", "-s", "-lcrypto", "-lz", "-w"]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"Compilation failed: {result.stderr}")
            
            if not out_path.exists():
                raise Exception("Output binary not created")
            
            # Compile baseline binary for size comparison
            baseline_path = output_folder / f"{job_id}_baseline.bin"
            try:
                subprocess.run(["gcc", "-O0", str(file_path), "-o", str(baseline_path)], 
                             capture_output=True, timeout=30, check=True)
            except:
                try:
                    subprocess.run(["clang", "-O0", str(file_path), "-o", str(baseline_path)], 
                                 capture_output=True, timeout=30, check=True)
                except:
                    baseline_path = output_folder / f"{job_id}_baseline_zero.bin"
                    baseline_path.write_bytes(b'')
                    log_message(job_id, "Using zero baseline for size comparison", log_callback)
            
            # Capture size before UPX for accurate comparison
            file_size_before = baseline_path.stat().st_size if baseline_path.exists() else 0
            file_size_after = out_path.stat().st_size
            
            # Optional UPX compression
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
            
            log_message(job_id, "Key function virtualization completed successfully!", log_callback)
            
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
        'gcc': subprocess.run(["which", "gcc"], capture_output=True).returncode == 0,
        'upx': subprocess.run(["which", "upx"], capture_output=True).returncode == 0,
    }
    requirements['all_available'] = requirements['gcc']
    return requirements