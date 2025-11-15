#!/usr/bin/env python3
# control_flow.py – NUCLEAR OBFUSCATOR
#   pip install pycryptodome
#   sudo apt install tcc upx
#   Features: In-memory, Anti-Debug, Anti-VM, No Disk, AES+zlib

import argparse, random, secrets, hashlib, os, sys, subprocess, zlib, base64
from typing import List, Dict
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

# ----------------------------------------------------------------------
# Unique state IDs
# ----------------------------------------------------------------------
_used_hashes = set()
def new_state() -> int:
    while True:
        s = random.randint(0x100000, 0xfffffff)
        h = hashlib.sha256(str(s).encode()).hexdigest()[:10]
        if h not in _used_hashes:
            _used_hashes.add(h)
            return s

# ----------------------------------------------------------------------
# Opaque predicates
# ----------------------------------------------------------------------
def opaque_true() -> str:
    x = random.randint(20, 200)
    y = x * x
    z = random.randint(7, 31)
    return f"(({x}*{x}=={y}) && ({y}%{z}!=0 || 1))"

def opaque_false() -> str:
    return f"(rand() == {secrets.randbits(128)})"

# ----------------------------------------------------------------------
# Extract functions
# ----------------------------------------------------------------------
import re
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

# ----------------------------------------------------------------------
# Flatten function
# ----------------------------------------------------------------------
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

# ----------------------------------------------------------------------
# Encrypt payload
# ----------------------------------------------------------------------
def encrypt_payload(data: str, key: bytes) -> bytes:
    compressed = zlib.compress(data.encode('utf-8'))
    cipher = AES.new(key, AES.MODE_CBC)
    ct = cipher.encrypt(pad(compressed, 16))
    return cipher.iv + ct

# ----------------------------------------------------------------------
# C Loader – IN-MEMORY + ANTI-DEBUG + ANTI-VM
# ----------------------------------------------------------------------
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

// memfd_create
static int memfd_create(const char *name, unsigned int flags) {
    return syscall(__NR_memfd_create, name, flags);
}

// Anti-debug: ptrace
__attribute__((constructor)) void anti_debug() {
    if (ptrace(PTRACE_TRACEME, 0, 1, 0) == -1) _exit(0);
}

// Anti-VM: CPUID
int is_vm() {
    unsigned int eax, ebx, ecx, edx;
    __asm__ __volatile__ ("cpuid"
                          : "=a" (eax), "=b" (ebx), "=c" (ecx), "=d" (edx)
                          : "a" (1));
    if (ecx & (1 << 31)) return 1;  // Hypervisor bit
    return 0;
}

// PKCS7 unpad
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
    if (is_vm()) _exit(0);  // Exit in VM

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

    // In-memory file
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

# ----------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="C → NUCLEAR OBFUSCATED BINARY (In-Memory, Anti-RE)")
    parser.add_argument("-c", "--code", required=True, help="Input .c file")
    parser.add_argument("-o", "--output", default="a.out", help="Output binary")
    parser.add_argument("--upx", action="store_true", help="Pack with UPX")
    args = parser.parse_args()

    if not shutil.which("tcc"):
        print("[!] Install tcc: sudo apt install tcc")
        sys.exit(1)

    if not os.path.isfile(args.code):
        print(f"[!] File not found: {args.code}")
        sys.exit(1)

    with open(args.code, "r", encoding="utf-8") as f:
        src = f.read()

    for f in extract_functions(src):
        src = src.replace(f["full"], flatten_function(f))

    key = secrets.token_bytes(32)
    encrypted = encrypt_payload(src, key)

    loader_c = LOADER_TEMPLATE.replace(
        "{KEY_B64}", base64.b64encode(key).decode()
    ).replace(
        "{ENC_B64}", base64.b64encode(encrypted).decode()
    )

    loader_file = f"loader_{secrets.token_hex(4)}.c"
    with open(loader_file, "w") as f:
        f.write(loader_c)

    cmd = ["gcc", loader_file, "-o", args.output, "-O2", "-s", "-lcrypto", "-lz", "-lssl"]
    print(f"[+] Compiling: {' '.join(cmd)}")
    result = subprocess.run(cmd)
    if result.returncode != 0:
        print("[!] Compile failed")
        sys.exit(1)

    os.remove(loader_file)

    if args.upx:
        print("[+] Packing with UPX...")
        subprocess.run(["upx", "--best", "--lzma", args.output], check=True)

    print(f"[+] SUCCESS → {args.output}")
    print(f"    Run: ./{args.output}")

if __name__ == "__main__":
    import shutil
    main()