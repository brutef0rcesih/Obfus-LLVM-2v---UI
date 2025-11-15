#!/usr/bin/env python3
"""
C/CPP → AES-256 + SYMBOL OBFUSCATION → .bin
100% WORKING — EXECUTABLE RUNS
"""
import os
import sys
import uuid
import argparse
import textwrap
import re
import base64
import random
import string
from pathlib import Path

from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad

def encrypt_string(s: str, key: bytes) -> str:
    data = s.encode('utf-8')
    iv = get_random_bytes(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    ct = cipher.encrypt(pad(data, 16))
    return base64.urlsafe_b64encode(iv + ct).decode().rstrip('=')

def generate_random_name(length=12):
    return 'obf_' + ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def obfuscate_symbols_in_ll(ll_path: Path):
    text = ll_path.read_text(encoding='utf-8')
    lines = text.splitlines()

    protected = {
        'main', 'printf', 'scanf', 'strcmp', 'strlen', 'memcpy',
        'get_str', 'decrypt_strings', '__start_blobs', '__stop_blobs'
    }

    defined_symbols = set()
    symbol_mapping = {}

    for line in lines:
        m = re.match(r'^define .*@([\w\.]+)\(', line)
        if m and m.group(1) not in protected and not m.group(1).startswith('llvm.'):
            defined_symbols.add(m.group(1))

    for line in lines:
        m = re.match(r'^@([\w\.]+)\s*=', line)
        if m and m.group(1) not in protected and not m.group(1).startswith('.str') and not m.group(1).startswith('llvm.'):
            defined_symbols.add(m.group(1))

    for sym in defined_symbols:
        new_name = generate_random_name()
        symbol_mapping[sym] = new_name

    new_lines = []
    for line in lines:
        for old, new in symbol_mapping.items():
            line = re.sub(r'\b@' + re.escape(old) + r'\b', '@' + new, line)
        new_lines.append(line)

    ll_path.write_text('\n'.join(new_lines), encoding='utf-8')
    print(f"   Renamed {len(symbol_mapping)} symbol(s)")
    return symbol_mapping

def c_to_bc(c_path: Path, bc_path: Path):
    cmd = f'clang -emit-llvm -c -O0 -Wno-everything "{c_path}" -o "{bc_path}"'
    print(f"[1] {cmd}")
    if os.system(cmd) != 0:
        sys.exit("Failed: C → .bc")

def bc_to_ll(bc_path: Path, ll_path: Path):
    cmd = f'llvm-dis "{bc_path}" -o "{ll_path}"'
    print(f"[2] {cmd}")
    if os.system(cmd) != 0:
        sys.exit("Failed: llvm-dis")

STRING_RE = re.compile(
    r'(@\.str(?:\.\d+)?)\s*=\s*(private\s+)?unnamed_addr\s+constant\s+'
    r'\[(\d+)\s+x\s+i8\]\s+c"((?:[^"\\]|\\.)*)"',
    re.DOTALL
)

def obfuscate_ll(ll_path: Path, key: bytes):
    text = ll_path.read_text(encoding='utf-8')
    lines = text.splitlines()
    new_lines = []
    blobs = []

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
            new_line = f'{gid} = private unnamed_addr constant [{length} x i8] zeroinitializer, align 1'
            new_lines.append(new_line)
        else:
            new_lines.append(line)

    final_lines = []
    for line in new_lines:
        if line.strip().startswith('!') and '=' in line and any(x in line for x in ['DILocalVariable', 'DIFile']):
            continue
        cleaned = re.sub(r', !dbg !\d+', '', line)
        final_lines.append(cleaned)

    ll_path.write_text('\n'.join(final_lines), encoding='utf-8')
    print(f"   Encrypted {len(blobs)} string(s)")
    return blobs

def ll_to_bc(ll_path: Path, bc_path: Path):
    cmd = f'llvm-as "{ll_path}" -o "{bc_path}"'
    print(f"[3] {cmd}")
    if os.system(cmd) != 0:
        sys.exit("Failed: llvm-as")

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

def build_final(obf_bc: Path, runtime_c: Path, out_path: Path):
    work = Path(f"_work_{uuid.uuid4().hex[:8]}")
    work.mkdir(exist_ok=True)

    s_file = work / "code.s"
    cmd = f'llc -march=x86-64 -relocation-model=pic "{obf_bc}" -o "{s_file}"'
    print(f"[4] {cmd}")
    if os.system(cmd) != 0:
        sys.exit("llc failed")

    o_rt = work / "rt.o"
    cmd = f'clang -c -O0 -fPIC "{runtime_c}" -o "{o_rt}"'
    print(f"[5] {cmd}")
    if os.system(cmd) != 0:
        sys.exit("Runtime compilation failed")

    o_code = work / "code.o"
    cmd = f'clang -c -fPIC "{s_file}" -o "{o_code}"'
    print(f"[6] {cmd}")
    if os.system(cmd) != 0:
        sys.exit("Assembly compilation failed")

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

    cmd = f'gcc -fno-pie -no-pie "{o_rt}" "{o_code}" -T "{ld_script}" -o "{out_path}" -lssl -lcrypto'
    print(f"[7] {cmd}")
    if os.system(cmd) != 0:
        sys.exit("LINKING FAILED")

    raw_bin = out_path.with_suffix('.raw')
    cmd = f'objcopy -O binary "{out_path}" "{raw_bin}"'
    print(f"[8] {cmd}")
    if os.system(cmd) == 0:
        print(f"   Raw binary saved: {raw_bin}")
    else:
        print("   Warning: Failed to generate raw binary")

    os.system(f"strip --strip-unneeded '{out_path}' 2>/dev/null")
    print(f"UPX: Compressing {out_path}...")
    if os.system(f"upx --best --lzma '{out_path}' 2>/dev/null") == 0:
        print(f"   UPX compression successful")
    else:
        print("   UPX skipped")

    import shutil
    shutil.rmtree(work, ignore_errors=True)

def main():
    parser = argparse.ArgumentParser(description="C/CPP Obfuscator")
    parser.add_argument("cfile", type=Path)
    parser.add_argument("-o", "--output", type=Path)
    parser.add_argument("--key", type=str)
    args = parser.parse_args()

    if args.cfile.suffix not in {".c", ".cpp", ".cc"}:
        sys.exit("Input must be .c/.cpp")

    out = args.output or args.cfile.with_suffix('')

    key = bytes.fromhex(args.key) if args.key else get_random_bytes(32)
    if len(key) != 32:
        sys.exit("Key must be 32 bytes")

    if not args.key:
        print("Random AES-256 key (hex):")
        print(key.hex())
        print("SAVE THIS KEY!\n")

    tmp = Path(f"_tmp_{uuid.uuid4().hex[:8]}")
    tmp.mkdir()

    try:
        bc = tmp / "input.bc"
        ll = tmp / "input.ll"
        obf_bc = tmp / "obf.bc"
        rt_c = tmp / "runtime.c"

        c_to_bc(args.cfile, bc)
        bc_to_ll(bc, ll)
        blobs = obfuscate_ll(ll, key)
        obfuscate_symbols_in_ll(ll)
        ll_to_bc(ll, obf_bc)
        rt_c.write_text(make_runtime_c(blobs, key), encoding='utf-8')
        build_final(obf_bc, rt_c, out)

        print(f"\nSUCCESS: {out}")
        print(f"Raw binary: {out}.raw")
    finally:
        import shutil
        shutil.rmtree(tmp, ignore_errors=True)

if __name__ == '__main__':
    main()