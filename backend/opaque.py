#!/usr/bin/env python3
# obfuscate_opaque_predicates.py – Obfuscates C/C++ code using Opaque Predicates
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

def generate_opaque_predicate():
    """Generate an opaque predicate that always evaluates to true."""
    # Example: (x^2 + y^2) % 2 == 0 for x=y
    var1 = generate_random_name(6)
    var2 = generate_random_name(6)
    val = random.randint(1, 100)
    return (
        f"int {var1} = {val}, {var2} = {val}; "
        f"(({var1} * {var1} + {var2} * {var2}) % 2 == 0)"
    )

def obfuscate_source(source: str):
    """Obfuscate C/C++ source using opaque predicates."""
    # Extract key components using regex
    pattern = r'printf\s*\(\s*"([^"]*)"\s*,\s*add\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*\)'
    match = re.search(pattern, source)
    if not match:
        print("[!] No printf(add()) found")
        sys.exit(1)

    fmt, a, b = match.groups()
    a, b = int(a), int(b)

    # Generate cryptic variable names
    var_result = generate_random_name()
    var_a = generate_random_name()
    var_b = generate_random_name()
    dummy_var = generate_random_name()

    # Generate two opaque predicates
    pred1 = generate_opaque_predicate()
    pred2 = generate_opaque_predicate()

    # Obfuscated code template
    obf_code = f'''
#include <stdio.h>
#include <string.h>
int main() {{
    int {var_a} = {a}, {var_b} = {b}, {var_result}, {dummy_var} = {random.randint(100, 999)};
    if ({pred1}) {{
        {var_result} = {var_a} + {var_b};
        if ({pred2}) {{
            printf("{fmt}", {var_result});
        }} else {{
            {dummy_var} += {random.randint(1000, 9999)}; // Unreachable
            printf("Dummy: %d\\n", {dummy_var});
        }}
    }} else {{
        {dummy_var} *= {random.randint(2, 10)}; // Unreachable
        printf("Error: %d\\n", {dummy_var});
    }}
    return 0;
}}
'''

    print(f"[DEBUG] Obfuscated code size: {len(obf_code)} bytes")
    return obf_code

def main():
    parser = argparse.ArgumentParser(description="Obfuscate C/C++ code using Opaque Predicates")
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