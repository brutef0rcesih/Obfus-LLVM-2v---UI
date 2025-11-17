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
from datetime import datetime

from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad

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
    """Encrypt a string using AES-256-CBC"""
    data = s.encode('utf-8')
    iv = get_random_bytes(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    ct = cipher.encrypt(pad(data, 16))
    return base64.urlsafe_b64encode(iv + ct).decode().rstrip('=')

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

def c_to_bc(c_path: Path, bc_path: Path, job_id, log_callback=None):
    """Compile C file to LLVM bitcode"""
    cmd = f'"{CLANG}" -emit-llvm -c -O0 "{c_path}" -o "{bc_path}"'
    run_command(cmd, job_id, "Failed: C → .bc", log_callback)
    if not bc_path.exists():
        raise Exception("Failed: C → .bc (output file not created)")

def bc_to_ll(bc_path: Path, ll_path: Path, job_id, log_callback=None):
    """Disassemble bitcode to LLVM IR"""
    if not bc_path.exists():
        raise Exception("Bitcode file not found")
    cmd = f'"{LLVM_DIS}" "{bc_path}" -o "{ll_path}"'
    run_command(cmd, job_id, "Failed: llvm-dis", log_callback)
    if not ll_path.exists():
        raise Exception("Failed: llvm-dis (output file not created)")

def obfuscate_ll(ll_path: Path, key: bytes, job_id, log_callback=None):
    """Apply string encryption obfuscation to LLVM IR"""
    text = ll_path.read_text(encoding='utf-8')
    lines = text.splitlines()
    new_lines = []
    
    # Ensure we maintain proper LLVM IR structure (globals before functions)
    in_function_section = False
    blobs = []
    string_id_to_blob = {}

    log_message(job_id, "Scanning for string constants...", log_callback)
    count = 0
    for line in lines:
        # Track when we enter function definitions
        if line.strip().startswith('define') and not in_function_section:
            in_function_section = True
        
        m = STRING_RE.match(line.strip())
        if m and not in_function_section:
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
    log_message(job_id, f"Encrypted {count} string(s)", log_callback)
    return blobs

def ll_to_bc(ll_path: Path, bc_path: Path, job_id, log_callback=None):
    """Assemble LLVM IR to bitcode"""
    if not ll_path.exists():
        raise Exception("LLVM IR file not found")
    cmd = f'"{LLVM_AS}" "{ll_path}" -o "{bc_path}"'
    run_command(cmd, job_id, "Failed: llvm-as", log_callback)
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
    """Generate runtime C code for string decryption"""
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

def build_final(obf_bc: Path, runtime_c: Path, out_path: Path, job_id, log_callback=None, upx_args=None, upx_level="high"):
    """Build final obfuscated binary"""
    work = Path(f"_work_{uuid.uuid4().hex[:8]}")
    work.mkdir(exist_ok=True)

    try:
        s_file = work / "code.s"
        cmd = f'"{LLC}" -march=x86-64 -relocation-model=pic "{obf_bc}" -o "{s_file}"'
        run_command(cmd, job_id, "llc failed", log_callback)
        if not s_file.exists():
            raise Exception("Assembly file not created")

        o_rt = work / "rt.o"
        cmd = f'"{CLANG}" -c -O0 -fPIC "{runtime_c}" -o "{o_rt}"'
        run_command(cmd, job_id, "Runtime compilation failed", log_callback)
        if not o_rt.exists():
            raise Exception("Runtime object file not created")

        o_code = work / "code.o"
        cmd = f'"{CLANG}" -c -fPIC "{s_file}" -o "{o_code}"'
        run_command(cmd, job_id, "Assembly compilation failed", log_callback)
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
            run_command(link_cmd, job_id, "Linking failed with GCC", log_callback)
        except:
            # Fallback to clang
            link_cmd = f'"{CLANG}" -fno-pie -no-pie "{o_rt}" "{o_code}" -T "{ld_script}" -o "{out_path}" -lssl -lcrypto'
            run_command(link_cmd, job_id, "Linking failed with Clang", log_callback)
        
        if not out_path.exists():
            raise Exception("Final binary not created")

        # Optional: strip symbols
        strip_tool = shutil.which('strip')
        if strip_tool:
            try:
                subprocess.run([strip_tool, '--strip-unneeded', str(out_path)], 
                             capture_output=True, timeout=30)
                log_message(job_id, "Symbols stripped", log_callback)
            except:
                log_message(job_id, "Strip skipped", log_callback)

        # Capture uncompressed size before UPX
        uncompressed_size = out_path.stat().st_size if out_path.exists() else 0
        
        # Optional: compress with UPX (using level from parameters)
        if upx_args:
            upx_tool = shutil.which('upx')
            if upx_tool:
                try:
                    subprocess.run([upx_tool] + upx_args + [str(out_path)], 
                                 capture_output=True, timeout=60)
                    log_message(job_id, f"Compressed with UPX ({upx_level})", log_callback)
                except:
                    log_message(job_id, "UPX skipped (not installed or failed)", log_callback)
        
        return uncompressed_size
    finally:
        shutil.rmtree(work, ignore_errors=True)

def generate_report(job_id, original_file, obfuscated_file, file_size_before, file_size_after, blobs_count, key_hex):
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
            "strings_encrypted": blobs_count,
            "encryption_key": key_hex,
            "method": "AES-256-CBC"
        },
        "status": "completed"
    }
    return report

def check_tools_availability():
    """Check if required LLVM tools are available"""
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
    return tools_status

def process_string_encryption(job_id, file_path, parameters, output_folder, log_callback=None):
    """Main string encryption obfuscation process"""
    try:
        log_message(job_id, "Starting string encryption obfuscation...", log_callback)
        
        tmp = Path(f"_tmp_{uuid.uuid4().hex[:8]}")
        tmp.mkdir()
        
        try:
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
            log_message(job_id, f"Generated AES-256 key: {key_hex[:16]}...", log_callback)
            
            # Compile baseline binary for size comparison
            baseline_path = tmp / "baseline.bin"
            try:
                cmd = f'"{CLANG}" -O0 "{file_path}" -o "{baseline_path}"'
                run_command(cmd, job_id, "Baseline compilation", log_callback)
            except Exception as e:
                # If baseline fails, compile a minimal version
                log_message(job_id, f"Baseline compilation failed: {e}, using minimal build", log_callback)
                try:
                    cmd = f'"{GCC}" -O0 "{file_path}" -o "{baseline_path}"'
                    subprocess.run(cmd, shell=True, capture_output=True, timeout=30, check=True)
                except:
                    # Last resort: use a zero baseline to show absolute size
                    baseline_path.write_bytes(b'')
                    log_message(job_id, "Using zero baseline for size comparison", log_callback)
            
            # Process the file
            c_to_bc(file_path, bc, job_id, log_callback)
            bc_to_ll(bc, ll, job_id, log_callback)
            blobs = obfuscate_ll(ll, key, job_id, log_callback)
            ll_to_bc(ll, obf_bc, job_id, log_callback)
            
            # Generate runtime
            rt_c.write_text(make_runtime_c(blobs, key), encoding='utf-8')
            
            # Build final binary
            out_path = output_folder / f"{job_id}.bin"
            upx_args = parameters.get('_upx_args')
            upx_level = parameters.get('_upx_level', 'high')
            uncompressed_size = build_final(obf_bc, rt_c, out_path, job_id, log_callback, upx_args, upx_level)
            
            # Generate report (use uncompressed size for accurate comparison)
            file_size_before = baseline_path.stat().st_size
            file_size_after = uncompressed_size if uncompressed_size else 0
            
            report = generate_report(
                job_id, 
                file_path.name, 
                out_path.name,
                file_size_before,
                file_size_after,
                len(blobs),
                key_hex
            )
            
            log_message(job_id, "String encryption obfuscation completed successfully!", log_callback)
            
            return {
                "status": "completed",
                "result": report,
                "output_file": str(out_path)
            }
            
        finally:
            shutil.rmtree(tmp, ignore_errors=True)
            
    except Exception as e:
        log_message(job_id, f"ERROR: {str(e)}", log_callback)
        return {
            "status": "error",
            "error": str(e)
        }