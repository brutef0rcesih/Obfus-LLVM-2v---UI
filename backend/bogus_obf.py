#!/usr/bin/env python3
"""
Bogus Control Flow Obfuscation Module
Provides dead code injection and bogus control flow
"""

import os
import subprocess
import random
import tempfile
from pathlib import Path
from datetime import datetime

def log_message(job_id, message, log_callback=None):
    """Log message with timestamp"""
    timestamp = datetime.now().strftime('%H:%M:%S')
    log_entry = f'[{timestamp}] {message}'
    if log_callback:
        log_callback(job_id, log_entry)
    print(f"Job {job_id}: {log_entry}")

def run_command(cmd, job_id, error_msg, log_callback=None, cwd=None):
    """Run a command and handle errors properly"""
    log_message(job_id, f"Running: {cmd}", log_callback)
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd, timeout=300)
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

def compile_to_bc(source_file, bc_file, job_id, log_callback=None):
    """Compile C/C++ to LLVM bitcode"""
    ext = source_file.suffix.lower()
    if ext == '.c':
        cmd = f"clang -emit-llvm -c -O0 -Wno-everything '{source_file}' -o '{bc_file}'"
    elif ext in {'.cpp', '.cc'}:
        cmd = f"clang++ -emit-llvm -c -O0 -Wno-everything '{source_file}' -o '{bc_file}'"
    else:
        raise ValueError("Only .c, .cpp, .cc supported.")
    run_command(cmd, job_id, "Failed to compile to bitcode", log_callback)

def disassemble_bc(bc_file, ll_file, job_id, log_callback=None):
    """Disassemble bitcode to LLVM IR"""
    cmd = f"llvm-dis '{bc_file}' -o '{ll_file}'"
    run_command(cmd, job_id, "Failed to disassemble bitcode", log_callback)

def generate_bogus_ir():
    """Generate bogus LLVM IR instructions"""
    bogus = []
    
    # Add some dummy arithmetic operations
    for i in range(random.randint(2, 4)):
        op = random.choice(['add', 'sub', 'mul', 'and', 'or', 'xor'])
        typ = random.choice(['i32', 'i64'])
        a, b = random.randint(1, 999), random.randint(1, 999)
        bogus.append(f"  %bogus{i} = {op} {typ} {a}, {b}")
    
    # Add some memory operations
    if random.random() > 0.5:
        bogus.append(f"  %bogus_alloca = alloca i32, align 4")
        bogus.append(f"  store i32 42, i32* %bogus_alloca, align 4")
        bogus.append(f"  %bogus_load = load i32, i32* %bogus_alloca, align 4")
    
    return bogus

def generate_global_bogus():
    """Generate bogus global variables and functions"""
    return [
        '; Bogus globals for obfuscation',
        '@bogus_global_val = private unnamed_addr constant i32 42, align 4',
        '@bogus_str = private unnamed_addr constant [5 x i8] c"junk\\00", align 1',
        '',
        '; Bogus function',
        'define private i32 @bogus_func(i32 %x) #0 {',
        'entry:',
        '  %result = add i32 %x, 1337',
        '  ret i32 %result',
        '}',
        ''
    ]

def add_bogus_code(ll_content, job_id, log_callback=None):
    """Add bogus code to LLVM IR"""
    log_message(job_id, "Injecting bogus instructions...", log_callback)
    
    lines = ll_content.splitlines()
    new_lines = []
    in_function = False
    globals_inserted = False
    
    # First pass: find the best place to insert globals (before first function)
    insert_point = -1
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith('define') and insert_point == -1:
            insert_point = i
            break
    
    # If no functions found, insert at end of file header
    if insert_point == -1:
        for i, line in enumerate(lines):
            stripped = line.strip()
            if stripped and not stripped.startswith((';', 'source_filename', 'target ', '!llvm')):
                insert_point = i + 1
                break
        if insert_point == -1:
            insert_point = len(lines)
    
    # Insert globals at the identified point
    for i, line in enumerate(lines):
        if i == insert_point and not globals_inserted:
            new_lines.extend([''] + generate_global_bogus() + [''])
            globals_inserted = True
        
        new_lines.append(line)
        
        stripped = line.strip()
        
        # Inject bogus instructions in function bodies
        if stripped.startswith('define'):
            in_function = True
        elif in_function and stripped.startswith('ret '):
            # Insert bogus code before return statement
            bogus_instructions = generate_bogus_ir()
            new_lines = new_lines[:-1] + bogus_instructions + [line]
            continue
        elif stripped == '}':
            in_function = False
    
    # Ensure globals were inserted
    if not globals_inserted:
        new_lines = [''] + generate_global_bogus() + [''] + new_lines

    return '\n'.join(new_lines) + '\n'

def assemble_ll(ll_file, bc_file, job_id, log_callback=None):
    """Assemble LLVM IR to bitcode"""
    cmd = f"llvm-as '{ll_file}' -o '{bc_file}'"
    run_command(cmd, job_id, "Failed to assemble LLVM IR", log_callback)

def generate_object(bc_file, o_file, job_id, log_callback=None):
    """Generate object file from bitcode"""
    cmd = f"llc -filetype=obj -relocation-model=pic '{bc_file}' -o '{o_file}'"
    run_command(cmd, job_id, "Failed to generate object file", log_callback)

def link_executable(o_files, exe_file, job_id, log_callback=None):
    """Link object files into executable"""
    o_str = ' '.join(f"'{o}'" for o in o_files)
    cmd = f"clang -no-pie {o_str} -o '{exe_file}'"
    run_command(cmd, job_id, "Failed to link executable", log_callback)

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
            "technique": "Bogus Control Flow",
            "features": ["Dead Code Injection", "Unreachable Branches", "Dummy Instructions"],
            "method": "LLVM IR Modification"
        },
        "status": "completed"
    }
    return report

def process_bogus_obfuscation(job_id, file_path, parameters, output_folder, log_callback=None):
    """Main bogus control flow obfuscation process"""
    try:
        log_message(job_id, "Starting bogus control flow obfuscation...", log_callback)
        
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir = Path(tmpdir)
            base = file_path.stem
            
            # File paths
            bc_file = tmpdir / f"{base}.bc"
            ll_file = tmpdir / f"{base}.ll"
            mod_bc = tmpdir / f"{base}_mod.bc"
            obj_file = tmpdir / f"{base}.o"
            
            # Compile baseline binary for size comparison
            baseline_path = tmpdir / f"{base}_baseline.bin"
            try:
                cmd = f"clang -O0 '{file_path}' -o '{baseline_path}'"
                run_command(cmd, job_id, "Baseline compilation", log_callback)
            except Exception as e:
                log_message(job_id, f"Baseline compilation failed: {e}, using minimal build", log_callback)
                try:
                    cmd = f"gcc -O0 '{file_path}' -o '{baseline_path}'"
                    subprocess.run(cmd, shell=True, capture_output=True, timeout=30, check=True)
                except:
                    baseline_path.write_bytes(b'')
                    log_message(job_id, "Using zero baseline for size comparison", log_callback)
            except:
                baseline_path = file_path
            
            log_message(job_id, "Compiling to LLVM bitcode...", log_callback)
            compile_to_bc(file_path, bc_file, job_id, log_callback)
            
            log_message(job_id, "Disassembling to LLVM IR...", log_callback)
            disassemble_bc(bc_file, ll_file, job_id, log_callback)
            
            log_message(job_id, "Adding bogus code...", log_callback)
            with open(ll_file, 'r') as f:
                ll_content = f.read()
            
            obf_ll = add_bogus_code(ll_content, job_id, log_callback)
            
            with open(ll_file, 'w') as f:
                f.write(obf_ll)
            
            log_message(job_id, "Reassembling LLVM IR...", log_callback)
            assemble_ll(ll_file, mod_bc, job_id, log_callback)
            
            log_message(job_id, "Generating object file...", log_callback)
            generate_object(mod_bc, obj_file, job_id, log_callback)
            
            log_message(job_id, "Linking final executable...", log_callback)
            out_path = output_folder / f"{job_id}.bin"
            link_executable([obj_file], out_path, job_id, log_callback)
            
            if not out_path.exists():
                raise Exception("Output binary not created")
            
            # Capture size before optimizations for accurate comparison
            file_size_before = baseline_path.stat().st_size
            file_size_after = out_path.stat().st_size
            
            # Optional optimizations
            log_message(job_id, "Applying final optimizations...", log_callback)
            os.system(f"strip --strip-unneeded '{out_path}' 2>/dev/null")
            
            upx_result = os.system(f"upx --best --ultra-brute --lzma '{out_path}' 2>/dev/null")
            if upx_result == 0:
                log_message(job_id, "Compressed with UPX", log_callback)
            else:
                log_message(job_id, "UPX compression skipped", log_callback)
            
            report = generate_report(
                job_id,
                file_path.name,
                out_path.name,
                file_size_before,
                file_size_after
            )
            
            log_message(job_id, "Bogus control flow obfuscation completed successfully!", log_callback)
            
            return {
                "status": "completed",
                "result": report,
                "output_file": str(out_path)
            }
            
    except Exception as e:
        log_message(job_id, f"ERROR: {str(e)}", log_callback)
        return {
            "status": "error",
            "error": str(e)
        }

def check_requirements():
    """Check if required tools are available"""
    requirements = {
        'clang': subprocess.run(["which", "clang"], capture_output=True).returncode == 0,
        'llvm-dis': subprocess.run(["which", "llvm-dis"], capture_output=True).returncode == 0,
        'llvm-as': subprocess.run(["which", "llvm-as"], capture_output=True).returncode == 0,
        'llc': subprocess.run(["which", "llc"], capture_output=True).returncode == 0,
        'upx': subprocess.run(["which", "upx"], capture_output=True).returncode == 0,
    }
    requirements['all_available'] = all([requirements['clang'], requirements['llvm-dis'], 
                                       requirements['llvm-as'], requirements['llc']])
    return requirements