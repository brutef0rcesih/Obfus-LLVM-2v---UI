#!/usr/bin/env python3
# obfuscate_opaque_predicates.py – Obfuscates C/C++ code using Opaque Predicates
# Requirements: pip install pycryptodome; sudo apt install clang llvm upx-ucl (Linux) or install Clang/LLVM on Windows
#
# Use Case:
# - Input: A .c or .cpp file with a printf("format", add(a, b)) statement.
# - Output: Obfuscated .bc, .obf.bc, and binary (.bin or .exe) that executes the original logic.
# - Example: For sam.c with `printf("Result: %d\n", add(10, 20));`, outputs `Result: 30`.
#
# Dependencies:
# - Python packages: pycryptodome (pip install pycryptodome)
# - System packages: clang, llvm, upx-ucl (sudo apt install clang llvm upx-ucl)
import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
import random
import string
import platform

def run(cmd, **kwargs):
    """Run a command and print it."""
    print(f"$ {' '.join(cmd)}")
    kwargs.setdefault("check", True)
    kwargs.setdefault("text", True)
    try:
        return subprocess.run(cmd, **kwargs)
    except subprocess.CalledProcessError as e:
        print(f"[!] Command failed: {e}")
        raise

def find_tool(name):
    """Find a tool in PATH or exit with a helpful message."""
    tool = shutil.which(name)
    if not tool:
        sys.exit(f"ERROR: '{name}' not found. Ensure Clang/LLVM is installed and in PATH.\n"
                 f"On Linux: sudo apt install clang llvm upx-ucl\n"
                 f"On Windows: Install LLVM from https://releases.llvm.org/")
    return tool

def generate_random_name(length=10):
    """Generate a random, cryptic identifier starting with a letter."""
    chars = string.ascii_letters
    rest_chars = string.ascii_letters + string.digits
    return random.choice(chars) + ''.join(random.choice(rest_chars) for _ in range(length - 1))

def generate_opaque_predicate():
    """Generate an opaque predicate that always evaluates to true."""
    var1 = generate_random_name(6)
    var2 = generate_random_name(6)
    val = random.randint(1, 100)
    # Declare variables and return the predicate expression
    return (f"int {var1} = {val}, {var2} = {val}",
            f"(({var1} * {var1} + {var2} * {var2}) % 2 == 0)")

def obfuscate_source(source: str):
    """Obfuscate C/C++ source with opaque predicates."""
    pattern = r'printf\s*\(\s*"([^"]*)"\s*,\s*add\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*\)'
    match = re.search(pattern, source)
    if not match:
        print("[!] No printf(add()) found")
        sys.exit(1)

    fmt, a, b = match.groups()
    a, b = int(a), int(b)

    var_result = generate_random_name()
    var_a = generate_random_name()
    var_b = generate_random_name()
    dummy_var = generate_random_name()

    # Generate two opaque predicates
    pred1_decls, pred1_expr = generate_opaque_predicate()
    pred2_decls, pred2_expr = generate_opaque_predicate()

    obf_code = f'''
#include <stdio.h>
#include <string.h>
int main() {{
    int {var_a} = {a}, {var_b} = {b}, {var_result}, {dummy_var} = {random.randint(100, 999)};
    {pred1_decls};
    if ({pred1_expr}) {{
        {var_result} = {var_a} + {var_b};
        {pred2_decls};
        if ({pred2_expr}) {{
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

def compile_to_bc(src, bc):
    """Compile C/C++ to LLVM bitcode."""
    clang = find_tool("clang")
    cmd = [clang, "-emit-llvm", "-c", "-O0", src, "-o", bc]
    if src.lower().endswith(".cpp"):
        cmd.insert(1, "-std=c++17")
    run(cmd)

def link_bc(bc_list, out_bc):
    """Link multiple bitcode files."""
    llvm_link = find_tool("llvm-link")
    run([llvm_link, "-o", out_bc] + bc_list)

def bc_to_binary(obf_bc, binary_path):
    """Convert bitcode to executable binary."""
    clang = find_tool("clang")
    cmd = [clang, obf_bc, "-o", binary_path]
    if platform.system() == "Windows":
        cmd.append("-fuse-ld=lld")
    run(cmd)

def main():
    parser = argparse.ArgumentParser(description="Obfuscate C/C++ code using Opaque Predicates to .bc, .obf.bc, and binary")
    parser.add_argument("-c", "--code", required=True, help="Input C/C++ source file (.c or .cpp)")
    parser.add_argument("-o", "--output", default="obf", help="Base name for output files (default: obf)")
    parser.add_argument("--upx", action="store_true", help="Pack binary with UPX")
    args = parser.parse_args()

    src = os.path.abspath(args.code)
    if not os.path.isfile(src):
        sys.exit(f"[!] File not found: {src}")
    if not src.lower().endswith(('.c', '.cpp')):
        sys.exit("[!] Input must be a .c or .cpp file")

    base = args.output
    tmp = tempfile.mkdtemp(prefix="obf_")
    try:
        # 1. Obfuscate source
        with open(src, "r") as f:
            src_code = f.read()
        obf_code = obfuscate_source(src_code)
        obf_src = os.path.join(tmp, "obf_temp" + (".c" if src.lower().endswith(".c") else ".cpp"))
        with open(obf_src, "w") as f:
            f.write(obf_code)

        # 2. Compile original source to .bc
        bc = os.path.join(tmp, base + ".bc")
        compile_to_bc(src, bc)

        # 3. Compile obfuscated source to .obf.bc
        obf_bc = os.path.join(tmp, base + ".obf.bc")
        compile_to_bc(obf_src, obf_bc)

        # 4. Link bitcode (single file, for consistency)
        linked_bc = os.path.join(tmp, base + ".linked.bc")
        link_bc([obf_bc], linked_bc)

        # 5. Generate binary
        binary_ext = ".exe" if platform.system() == "Windows" else ".bin"
        binary_path = base + binary_ext
        bc_to_binary(linked_bc, binary_path)

        # 6. Pack with UPX if requested
        if args.upx:
            upx = find_tool("upx")
            run([upx, "--best", "--lzma", binary_path])

        # 7. Copy outputs to current directory
        final_bc = base + ".bc"
        final_obf_bc = base + ".obf.bc"
        shutil.copyfile(bc, final_bc)
        shutil.copyfile(obf_bc, final_obf_bc)
        print(f"→ {final_bc}")
        print(f"→ {final_obf_bc}")
        print(f"→ {binary_path}")

    finally:
        shutil.rmtree(tmp, ignore_errors=True)

if __name__ == "__main__":
    main()