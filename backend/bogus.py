#!/usr/bin/env python3
"""
bogus.py — LLVM IR Dead Code Obfuscator
Usage: python3 bogus.py -c sam.c -o sam.bin
"""
import os
import subprocess
import argparse
import random
import tempfile

def run_command(cmd, cwd=None):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
    if result.returncode != 0:
        raise RuntimeError(f"Command '{cmd}' failed:\n{result.stderr}")
    return result.stdout.strip()

def compile_to_bc(source_file, bc_file):
    ext = os.path.splitext(source_file)[1]
    if ext == '.c':
        cmd = f"clang -emit-llvm -c -O0 -Wno-everything '{source_file}' -o '{bc_file}'"
    elif ext in {'.cpp', '.cc'}:
        cmd = f"clang++ -emit-llvm -c -O0 -Wno-everything '{source_file}' -o '{bc_file}'"
    else:
        raise ValueError("Only .c, .cpp, .cc supported.")
    run_command(cmd)

def disassemble_bc(bc_file, ll_file):
    cmd = f"llvm-dis '{bc_file}' -o '{ll_file}'"
    run_command(cmd)

def generate_bogus_ir():
    bogus = []
    for i in range(random.randint(2, 6)):
        op = random.choice(['add', 'sub', 'mul', 'and', 'or', 'xor'])
        typ = random.choice(['i32', 'i64'])
        a, b = random.randint(1, 999), random.randint(1, 999)
        bogus.append(f"  %bogus{i} = {op} {typ} {a}, {b}")
    if random.random() > 0.4:
        pred = random.choice(['icmp eq i32 1, 1', 'icmp ne i32 1, 0'])
        bogus.extend([
            f"  br i1 {pred}, label %bogus_true, label %bogus_false",
            f"bogus_true:",
            f"  br label %bogus_end",
            f"bogus_false:",
            f"  br label %bogus_end",
            f"bogus_end:"
        ])
    return bogus

def generate_global_bogus():
    return [
        '@bogus_str = private unnamed_addr constant [5 x i8] c"junk\\00", align 1',
        '',
        'define private i32 @bogus_func() #0 {',
        '  ret i32 1337',
        '}',
        '',
        'attributes #0 = { nounwind }'
    ]

def add_bogus_code(ll_content):
    lines = ll_content.splitlines()
    new_lines = []
    in_function = False
    body_started = False
    globals_inserted = False

    for line in lines:
        stripped = line.strip()

        # === INSERT GLOBALS AFTER HEADER ===
        if not globals_inserted:
            new_lines.append(line)
            if stripped and not stripped.startswith((';', 'source_filename', 'target ', '@.str', '!llvm')):
                new_lines.extend([''] + generate_global_bogus() + [''])
                globals_inserted = True
            continue

        new_lines.append(line)

        # === INJECT IN FUNCTION BODY ===
        if stripped.startswith('define'):
            in_function = True
            body_started = False
        elif in_function and stripped == '{':
            body_started = True
        elif in_function and body_started and stripped.startswith('ret '):
            new_lines.extend(generate_bogus_ir())
        elif stripped == '}':
            in_function = False
            body_started = False

    return '\n'.join(new_lines) + '\n'

def assemble_ll(ll_file, bc_file):
    cmd = f"llvm-as '{ll_file}' -o '{bc_file}'"
    run_command(cmd)

def generate_object(bc_file, o_file):
    cmd = f"llc -filetype=obj -relocation-model=pic '{bc_file}' -o '{o_file}'"
    run_command(cmd)

def link_executable(o_files, exe_file):
    o_str = ' '.join(f"'{o}'" for o in o_files)
    cmd = f"clang -no-pie {o_str} -o '{exe_file}'"
    run_command(cmd)

def main():
    parser = argparse.ArgumentParser(description="LLVM IR Dead Code Obfuscator")
    parser.add_argument('-c', '--input', type=str, required=True, help="Input .c or .cpp file")
    parser.add_argument('-o', '--output', type=str, default='obfuscated', help="Output executable name")
    args = parser.parse_args()

    if not os.path.isfile(args.input):
        raise FileNotFoundError(f"Input file not found: {args.input}")

    exe_out = args.output
    if not exe_out.endswith(('.bin', '.exe')):
        exe_out += '.bin'

    with tempfile.TemporaryDirectory() as tmpdir:
        base = os.path.splitext(os.path.basename(args.input))[0]
        bc_file = os.path.join(tmpdir, f"{base}.bc")
        ll_file = os.path.join(tmpdir, f"{base}.ll")
        mod_bc = os.path.join(tmpdir, f"{base}_mod.bc")
        obj_file = os.path.join(tmpdir, f"{base}.o")

        print(f"[1] Compiling {args.input} → .bc")
        compile_to_bc(args.input, bc_file)

        print(f"[2] Disassembling → .ll")
        disassemble_bc(bc_file, ll_file)

        print(f"[3] Injecting bogus code...")
        with open(ll_file, 'r') as f:
            ll = f.read()
        obf_ll = add_bogus_code(ll)
        with open(ll_file, 'w') as f:
            f.write(obf_ll)

        print(f"[4] Reassembling → .bc")
        assemble_ll(ll_file, mod_bc)

        print(f"[5] Generating object file")
        generate_object(mod_bc, obj_file)

        print(f"[6] Linking → {exe_out}")
        link_executable([obj_file], exe_out)

        # Optional: strip + UPX
        os.system(f"strip --strip-unneeded '{exe_out}' 2>/dev/null")
        upx_result = os.system(f"upx --best --lzma '{exe_out}' 2>/dev/null")
        print("UPX: Packed" if upx_result == 0 else "UPX: Skipped")

    print(f"\nSUCCESS: {exe_out}")
    print(f"   Run: ./{exe_out}")

if __name__ == '__main__':
    main()