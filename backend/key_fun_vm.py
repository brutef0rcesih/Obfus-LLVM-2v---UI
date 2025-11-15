#!/usr/bin/env python3
# key_fun_vm.py – Fixed segmentation fault in PRINT opcode
# Requirements: pip install pycryptodome; sudo apt install gcc upx-ucl libssl-dev zlib1g-dev
#
# Use Case:
# - Input: A C file (e.g., sam.c) with a printf("format", add(a, b)) statement.
# - Output: A binary (vm.bin) that executes the equivalent VM bytecode, printing the sum of a and b.
# - Example: For sam.c with `printf("Result: %d\n", add(10, 20));`, outputs `Result: 30`.
#
# Dependencies:
# - Python packages: pycryptodome (pip install pycryptodome)
# - System packages: gcc, upx-ucl, libssl-dev, zlib1g-dev (sudo apt install gcc upx-ucl libssl-dev zlib1g-dev)
import argparse
import base64
import os
import re
import secrets
import subprocess
import sys
import zlib
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

def compile_to_vm(source: str):
    """Compile source to VM bytecode and constants."""
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

    pattern = r'printf\s*\(\s*"([^"]*)"\s*,\s*add\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*\)'
    match = re.search(pattern, source)
    if not match:
        print("[!] No printf(add()) found")
        sys.exit(1)

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
    print(f"[DEBUG] String consts: {str_consts}")
    print(f"[DEBUG] Int consts: {int_consts}")
    print(f"[DEBUG] String map: {str_map}")
    print(f"[DEBUG] Int map: {int_map}")
    print(f"[DEBUG] VM ops: {vm}")
    return vm, str_consts, int_consts

def serialize(vm, str_consts, int_consts):
    """Serialize VM code and constants to bytes."""
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

    print(f"[DEBUG] Code bytes: {len(code)}")
    print(f"[DEBUG] String const bytes: {len(str_data)}")
    print(f"[DEBUG] Int const bytes: {len(int_data)}")
    return bytes(code), bytes(str_data), bytes(int_data)

def encrypt_payload(code, str_data, int_data, key):
    """Encrypt and compress code + constants."""
    data = code + str_data + int_data
    compressed = zlib.compress(data)
    cipher = AES.new(key, AES.MODE_CBC)
    ct = cipher.encrypt(pad(compressed, 16))
    print(f"[DEBUG] Compressed: {len(compressed)} bytes, Encrypted: {len(ct)} bytes")
    return cipher.iv + ct

def bytes_to_c_array(b):
    """Convert bytes to C-style byte array string."""
    return "{" + ", ".join(f"0x{byte:02x}" for byte in b) + "}"

# C loader with debug logging and fixed PRINT opcode
VM_LOADER = r'''
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <zlib.h>
#include <openssl/evp.h>
unsigned char key[] = {KEY};
unsigned char enc[] = {ENC};
int main() {
    printf("[DEBUG] Key len: %zu, Enc len: %zu\n", sizeof(key), sizeof(enc));
    EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
    if (!ctx) { printf("[ERROR] EVP ctx init failed\n"); return 1; }
    if (!EVP_DecryptInit_ex(ctx, EVP_aes_256_cbc(), NULL, key, enc)) {
        printf("[ERROR] EVP decrypt init failed\n"); return 1; }
    int len = sizeof(enc) - 16;
    unsigned char *ct = malloc(len);
    if (!ct) { printf("[ERROR] Malloc ct failed\n"); return 1; }
    int outlen = 0, flen = 0;
    if (!EVP_DecryptUpdate(ctx, ct, &outlen, enc + 16, len)) {
        printf("[ERROR] EVP decrypt update failed\n"); free(ct); return 1; }
    if (!EVP_DecryptFinal_ex(ctx, ct + outlen, &flen)) {
        printf("[ERROR] EVP decrypt final failed\n"); free(ct); return 1; }
    outlen += flen;
    printf("[DEBUG] Decrypted %d bytes\n", outlen);
    EVP_CIPHER_CTX_free(ctx);
    z_stream strm = {0};
    if (inflateInit(&strm) != Z_OK) {
        printf("[ERROR] Inflate init failed\n"); free(ct); return 1; }
    unsigned long dsize = 2048;
    unsigned char *plain = malloc(dsize);
    if (!plain) { printf("[ERROR] Malloc plain failed\n"); free(ct); return 1; }
    strm.avail_in = outlen; strm.next_in = ct;
    strm.avail_out = dsize; strm.next_out = plain;
    int inf_ret = inflate(&strm, Z_FINISH);
    printf("[DEBUG] Inflate ret=%d, decompressed %lu bytes\n", inf_ret, dsize - strm.avail_out);
    if (inf_ret != Z_STREAM_END) {
        printf("[ERROR] Inflate failed\n"); free(ct); free(plain); return 1; }
    inflateEnd(&strm);
    free(ct);
    unsigned char *code = plain;
    unsigned char *str_consts = plain + {CODE_LEN};
    unsigned char *int_consts = str_consts + {STR_LEN};
    void *stack[256] = {0};
    int sp = -1;
    int pc = 0;
    while (1) {
        if (pc >= {CODE_LEN}) { printf("[ERROR] PC out of bounds\n"); free(plain); return 1; }
        int op = code[pc++];
        int arg = code[pc++];
        printf("[DEBUG] PC=%d OP=%d ARG=%d SP=%d\n", pc-2, op, arg, sp);
        switch (op) {
            case 1: {
                if (arg * 4 >= {INT_LEN}) { printf("[ERROR] Invalid int arg\n"); free(plain); return 1; }
                stack[++sp] = (void*)(intptr_t)*(int*)(int_consts + arg * 4);
                printf("[DEBUG] PUSH_INT: %d\n", (int)(intptr_t)stack[sp]);
                break;
            }
            case 2: {
                if (arg * 64 >= {STR_LEN}) { printf("[ERROR] Invalid str arg\n"); free(plain); return 1; }
                stack[++sp] = (void*)(str_consts + arg * 64);
                printf("[DEBUG] PUSH_STR: %s\n", (char*)stack[sp]);
                break;
            }
            case 3: {
                if (sp < 1) { printf("[ERROR] Stack underflow in ADD\n"); free(plain); return 1; }
                int b = (int)(intptr_t)stack[sp--];
                int a = (int)(intptr_t)stack[sp--];
                stack[++sp] = (void*)(intptr_t)(a + b);
                printf("[DEBUG] ADD: %d + %d = %d\n", a, b, (int)(intptr_t)stack[sp]);
                break;
            }
            case 5: {
                if (sp < 1) { printf("[ERROR] Stack underflow in PRINT\n"); free(plain); return 1; }
                int val = (int)(intptr_t)stack[sp--];
                char *fmt = (char*)stack[sp--];
                if (!fmt) { printf("[ERROR] Null format string\n"); free(plain); return 1; }
                printf("[DEBUG] PRINT: fmt='%s' val=%d\n", fmt, val);
                if (printf(fmt, val) < 0) { printf("[ERROR] printf failed\n"); free(plain); return 1; }
                fflush(stdout);
                break;
            }
            case 7: {
                printf("[DEBUG] HALT\n");
                free(plain);
                return 0;
            }
            default:
                printf("[ERROR] Unknown opcode %d\n", op);
                free(plain);
                return 1;
        }
    }
}
'''

def main():
    parser = argparse.ArgumentParser(description="Compile C to encrypted VM binary")
    parser.add_argument("-c", "--code", required=True, help="Input C source file")
    parser.add_argument("-o", "--output", default="vm.bin", help="Output binary name")
    parser.add_argument("--upx", action="store_true", help="Pack with UPX")
    args = parser.parse_args()

    if not os.path.isfile(args.code):
        print("[!] File not found")
        sys.exit(1)

    with open(args.code, "r") as f:
        src = f.read()

    vm, str_consts, int_consts = compile_to_vm(src)
    code_bytes, str_bytes, int_bytes = serialize(vm, str_consts, int_consts)
    print(f"[+] VM: {len(code_bytes)} bytes code, {len(str_bytes)} str consts, {len(int_bytes)} int consts")

    key = secrets.token_bytes(32)
    encrypted = encrypt_payload(code_bytes, str_bytes, int_bytes, key)
    loader_c = VM_LOADER.replace("{KEY}", bytes_to_c_array(key))
    loader_c = loader_c.replace("{ENC}", bytes_to_c_array(encrypted))
    loader_c = loader_c.replace("{CODE_LEN}", str(len(code_bytes)))
    loader_c = loader_c.replace("{STR_LEN}", str(len(str_bytes)))
    loader_c = loader_c.replace("{INT_LEN}", str(len(int_bytes)))

    with open("vm_loader.c", "w") as f:
        f.write(loader_c)

    cmd = ["gcc", "vm_loader.c", "-o", args.output, "-O2", "-s", "-lcrypto", "-lz", "-w"]
    print(f"[+] Compiling: {' '.join(cmd)}")
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError:
        print("[!] Compilation failed")
        sys.exit(1)

    if args.upx:
        try:
            subprocess.run(["upx", "--best", "--lzma", args.output], check=True)
        except subprocess.CalledProcessError:
            print("[!] UPX packing failed")
            sys.exit(1)

    os.remove("vm_loader.c")
    print(f"[+] SUCCESS → {args.output}")
    print(f"    Run: ./{args.output}")

if __name__ == "__main__":
    main()