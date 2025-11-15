#!/usr/bin/env python3
# obfuscate_preprocessor.py – Obfuscates C/C++ code using Preprocessor Trickery
# Requirements: pip install pycryptodome; sudo apt install gcc g++ upx-ucl
#
# Use Case:
# - Input: A .c or .cpp file with a printf("format", add(a, b)) statement.
# - Output: An obfuscated binary (.bin or .exe) that executes the original logic.
# - Example: For sam.c with `printf("Result: %d\n", add(10, 20));`, outputs `Result: 30`.
#
# Dependencies:
# - Python packages: pycryptodome (pip install pycryptodome)
# - System packages: gcc, g++, upx-ucl (sudo apt install gcc g++ upx-ucl)
import argparse
import os
import re
import secrets
import subprocess
import sys
import string
import random

def generate_random_name(length=10):
    """Generate a random, cryptic identifier starting with a letter."""
    chars = string.ascii_letters
    rest_chars = string.ascii_letters + string.digits
    return random.choice(chars) + ''.join(random.choice(rest_chars) for _ in range(length - 1))

def obfuscate_source(source: str):
    """Obfuscate C/C++ source using preprocessor trickery."""
    # Extract key components using regex
    pattern = r'printf\s*\(\s*"([^"]*)"\s*,\s*add\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*\)'
    match = re.search(pattern, source)
    if not match:
        print("[!] No printf(add()) found")
        sys.exit(1)

    fmt, a, b = match.groups()
    a, b = int(a), int(b)

    # Generate cryptic macro names
    macro_fmt = generate_random_name()
    macro_val1 = generate_random_name()
    macro_val2 = generate_random_name()
    macro_add = generate_random_name()
    macro_dummy1 = generate_random_name()
    macro_dummy2 = generate_random_name()
    macro_obf = generate_random_name()

    # Obfuscate string with XOR (simple encoding)
    xor_key = secrets.token_bytes(1)[0]
    fmt_encoded = ''.join(f'\\x{ord(c) ^ xor_key:02x}' for c in fmt)

    # Obfuscated code template with C-compatible XOR decoding
    obf_code = f'''
#include <stdio.h>
#include <string.h>
#define {macro_obf}(s,k) do {{ char* p = s; while (*p) {{ *p ^= k; p++; }} }} while(0)
#define {macro_fmt} "{fmt_encoded}"
#define {macro_val1} ({a} ^ {xor_key})
#define {macro_val2} ({b} ^ {xor_key})
#define {macro_add}(x,y) ((x ^ {xor_key}) + (y ^ {xor_key}))
#define {macro_dummy1} {random.randint(100, 999)}
#ifndef {macro_dummy2}
#define {macro_dummy2}
#else
#undef {macro_dummy1}
#define {macro_dummy1} {random.randint(1000, 9999)}
#endif
int main() {{
    char fmt[] = {macro_fmt};
    {macro_obf}(fmt, {xor_key});
#ifdef {macro_dummy2}
    printf(fmt, {macro_add}({macro_val1}, {macro_val2}));
#else
    printf(fmt, {macro_add}({macro_val1}, {macro_val2}));
#endif
    return 0;
}}
'''

    print(f"[DEBUG] Obfuscated code size: {len(obf_code)} bytes")
    return obf_code

def main():
    parser = argparse.ArgumentParser(description="Obfuscate C/C++ code using Preprocessor Trickery")
    parser.add_argument("-c", "--code", required=True, help="Input C/C++ source file (.c or .cpp)")
    parser.add_argument("-o", "--output", default="obf.bin", help="Output binary name (.bin or .exe)")
    parser.add_argument("--upx", action="store_true", help="Pack with UPX")
    args = parser.parse_args()

    if not os.path.isfile(args.code):
        print("[!] File not found")
        sys.exit(1)

    if not args.code.endswith(('.c', '.cpp')):
        print("[!] Input must be a .c or .cpp file")
        sys.exit(1)

    with open(args.code, "r") as f:
        src = f.read()

    # Obfuscate the source
    obf_code = obfuscate_source(src)

    # Write obfuscated code to temporary file
    temp_file = "obf_temp" + (".c" if args.code.endswith(".c") else ".cpp")
    with open(temp_file, "w") as f:
        f.write(obf_code)

    # Compile
    compiler = "gcc" if args.code.endswith(".c") else "g++"
    cmd = [compiler, temp_file, "-o", args.output, "-O2", "-s", "-w"]
    print(f"[+] Compiling: {' '.join(cmd)}")
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError:
        print("[!] Compilation failed")
        os.remove(temp_file)
        sys.exit(1)

    # Pack with UPX if requested
    if args.upx:
        try:
            subprocess.run(["upx", "--best", "--lzma", args.output], check=True)
        except subprocess.CalledProcessError:
            print("[!] UPX packing failed")
            os.remove(temp_file)
            sys.exit(1)

    # Clean up
    os.remove(temp_file)
    print(f"[+] SUCCESS → {args.output}")
    print(f"    Run: ./{args.output}")

if __name__ == "__main__":
    main()