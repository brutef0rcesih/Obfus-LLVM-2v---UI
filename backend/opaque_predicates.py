#!/usr/bin/env python3
"""
Opaque Predicates Obfuscation Module
Provides opaque predicate insertion for control flow obfuscation
"""

import os
import re
import secrets
import subprocess
import tempfile
import string
import random
from pathlib import Path
from datetime import datetime

def log_message(job_id, message, log_callback=None):
    """Log message with timestamp"""
    timestamp = datetime.now().strftime('%H:%M:%S')
    log_entry = f'[{timestamp}] {message}'
    if log_callback:
        log_callback(job_id, log_entry)
    print(f"Job {job_id}: {log_entry}")

def generate_random_name(length=10):
    """Generate a random, cryptic identifier starting with a letter"""
    chars = string.ascii_letters
    rest_chars = string.ascii_letters + string.digits
    return random.choice(chars) + ''.join(random.choice(rest_chars) for _ in range(length - 1))

def generate_opaque_predicate():
    """Generate an opaque predicate that always evaluates to true"""
    # Example: (x^2 + y^2) % 2 == 0 for x=y (always true for same even/odd values)
    var1 = generate_random_name(6)
    var2 = generate_random_name(6)
    val = random.randint(1, 100)
    return (
        f"int {var1} = {val}, {var2} = {val}; "
        f"(({var1} * {var1} + {var2} * {var2}) % 2 == 0)"
    )

def generate_false_predicate():
    """Generate a predicate that always evaluates to false"""
    var1 = generate_random_name(6)
    var2 = generate_random_name(6)
    val1 = random.randint(1, 50)
    val2 = val1 + random.randint(1, 50)
    return (
        f"int {var1} = {val1}, {var2} = {val2}; "
        f"({var1} > {var2})"
    )

def obfuscate_source(source: str, job_id, log_callback=None):
    """Obfuscate C/C++ source using opaque predicates"""
    log_message(job_id, "Applying opaque predicate obfuscation...", log_callback)
    
    # Extract key components using regex
    pattern = r'printf\s*\(\s*"([^"]*)"\s*,\s*add\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*\)'
    match = re.search(pattern, source)
    if not match:
        # Try simpler pattern
        simple_pattern = r'printf\s*\(\s*"([^"]*)"\s*\)'
        simple_match = re.search(simple_pattern, source)
        if simple_match:
            fmt = simple_match.group(1)
            return generate_simple_obfuscated_code(fmt, job_id, log_callback)
        else:
            raise Exception("No supported printf pattern found")

    fmt, a, b = match.groups()
    a, b = int(a), int(b)

    # Generate cryptic variable names
    var_result = generate_random_name()
    var_a = generate_random_name()
    var_b = generate_random_name()
    dummy_var1 = generate_random_name()
    dummy_var2 = generate_random_name()
    dummy_var3 = generate_random_name()

    # Generate multiple opaque predicates
    pred1 = generate_opaque_predicate()
    pred2 = generate_opaque_predicate()
    false_pred = generate_false_predicate()

    # Obfuscated code template with nested opaque predicates
    obf_code = f'''
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>

int main() {{
    srand(time(NULL));
    int {var_a} = {a}, {var_b} = {b}, {var_result};
    int {dummy_var1} = {random.randint(100, 999)};
    int {dummy_var2} = {random.randint(1000, 9999)};
    int {dummy_var3} = {random.randint(50, 500)};
    
    // First opaque predicate (always true)
    if ({pred1}) {{
        {var_result} = {var_a} + {var_b};
        
        // Nested opaque predicate (always true)  
        if ({pred2}) {{
            // False predicate branch (never taken)
            if ({false_pred}) {{
                {dummy_var1} += {random.randint(1000, 9999)}; // Unreachable
                printf("Error: %d\\n", {dummy_var1});
            }} else {{
                printf("{fmt}", {var_result});
            }}
        }} else {{
            {dummy_var2} *= {random.randint(2, 10)}; // Unreachable
            printf("Debug: %d\\n", {dummy_var2});
        }}
    }} else {{
        {dummy_var3} /= {random.randint(2, 5)}; // Unreachable
        printf("Critical: %d\\n", {dummy_var3});
    }}
    
    return 0;
}}
'''

    log_message(job_id, f"Generated obfuscated code with {len(obf_code)} bytes", log_callback)
    return obf_code

def generate_simple_obfuscated_code(fmt, job_id, log_callback=None):
    """Generate obfuscated code for simple printf"""
    log_message(job_id, "Generating simple obfuscated printf...", log_callback)
    
    dummy_var = generate_random_name()
    pred1 = generate_opaque_predicate()
    false_pred = generate_false_predicate()
    
    obf_code = f'''
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main() {{
    srand(time(NULL));
    int {dummy_var} = {random.randint(100, 999)};
    
    if ({pred1}) {{
        if ({false_pred}) {{
            {dummy_var} *= {random.randint(2, 10)}; // Unreachable
            printf("Error: %d\\n", {dummy_var});
        }} else {{
            printf("{fmt}");
        }}
    }} else {{
        {dummy_var} += {random.randint(1000, 9999)}; // Unreachable  
        printf("Debug: %d\\n", {dummy_var});
    }}
    
    return 0;
}}
'''
    return obf_code

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
            "technique": "Opaque Predicates",
            "features": ["Always-True Predicates", "Dead Code Branches", "Nested Conditionals"],
            "method": "Source Code Transformation"
        },
        "status": "completed"
    }
    return report

def process_opaque_predicates_obfuscation(job_id, file_path, parameters, output_folder, log_callback=None):
    """Main opaque predicates obfuscation process"""
    try:
        log_message(job_id, "Starting opaque predicates obfuscation...", log_callback)
        
        # Read source file
        with open(file_path, "r") as f:
            src = f.read()

        # Obfuscate the source
        obf_code = obfuscate_source(src, job_id, log_callback)

        # Create temp directory for build artifacts
        tmpdir = Path(tempfile.mkdtemp(prefix="opaque_"))
        
        # Write obfuscated code to temporary file
        file_ext = file_path.suffix
        temp_file = tmpdir / f"obfuscated{file_ext}"
        temp_file.write_text(obf_code)

        try:
            log_message(job_id, "Compiling obfuscated code...", log_callback)
            
            # Compile baseline binary for size comparison first
            baseline_path = tmpdir / "baseline.bin"
            try:
                subprocess.run(["gcc", "-O0", str(file_path), "-o", str(baseline_path)], 
                             capture_output=True, timeout=30, check=True)
            except:
                try:
                    subprocess.run(["clang", "-O0", str(file_path), "-o", str(baseline_path)], 
                                 capture_output=True, timeout=30, check=True)
                except:
                    baseline_path.write_bytes(b'')
                    log_message(job_id, "Using zero baseline for size comparison", log_callback)
            
            # Compile obfuscated code
            out_path = output_folder / f"{job_id}.bin"
            compiler = "gcc" if file_path.suffix == ".c" else "g++"
            cmd = [compiler, str(temp_file), "-o", str(out_path), "-O2", "-s", "-w"]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"Compilation failed: {result.stderr}")
            
            if not out_path.exists():
                raise Exception("Output binary not created")

            # Capture size before UPX for accurate comparison
            file_size_before = baseline_path.stat().st_size if baseline_path.exists() else 0
            file_size_after = out_path.stat().st_size

            # Pack with UPX if available
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

            log_message(job_id, "Opaque predicates obfuscation completed successfully!", log_callback)

            return {
                "status": "completed",
                "result": report,
                "output_file": str(out_path)
            }

        finally:
            # Clean up temporary directory
            import shutil
            if tmpdir.exists():
                shutil.rmtree(tmpdir, ignore_errors=True)

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
        'g++': subprocess.run(["which", "g++"], capture_output=True).returncode == 0,
        'upx': subprocess.run(["which", "upx"], capture_output=True).returncode == 0,
    }
    requirements['all_available'] = requirements['gcc']
    return requirements