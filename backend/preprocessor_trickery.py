#!/usr/bin/env python3
"""
PreProcessor Trickery Obfuscation Module
Provides macro-based obfuscation using preprocessor directives
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

def obfuscate_source(source: str, job_id, log_callback=None):
    """Obfuscate C/C++ source using preprocessor trickery"""
    log_message(job_id, "Applying preprocessor trickery obfuscation...", log_callback)
    
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

    # Generate cryptic macro names
    macro_fmt = generate_random_name()
    macro_val1 = generate_random_name()
    macro_val2 = generate_random_name()
    macro_add = generate_random_name()
    macro_dummy1 = generate_random_name()
    macro_dummy2 = generate_random_name()
    macro_obf = generate_random_name()
    macro_decode = generate_random_name()
    macro_check = generate_random_name()

    # XOR encoding for string obfuscation
    xor_key = secrets.token_bytes(1)[0]
    fmt_encoded = ''.join(f'\\x{ord(c) ^ xor_key:02x}' for c in fmt)

    # Generate complex macro system
    obf_code = f'''
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

// Macro obfuscation layer 1
#define {macro_obf}(s,k) do {{ char* p = s; while (*p) {{ *p ^= k; p++; }} }} while(0)
#define {macro_decode}(x) ((x) ^ {xor_key})
#define {macro_check}(a,b) ({macro_decode}(a) + {macro_decode}(b))

// Encoded values
#define {macro_fmt} "{fmt_encoded}"
#define {macro_val1} ({a} ^ {xor_key})
#define {macro_val2} ({b} ^ {xor_key})

// Dummy macros for confusion
#define {macro_dummy1} {random.randint(100, 999)}
#define {macro_dummy2} {random.randint(1000, 9999)}

// Conditional compilation trickery
#ifndef {macro_dummy1}_DEFINED
#define {macro_dummy1}_DEFINED
#define {macro_add}(x,y) {macro_check}(x,y)
#else
#undef {macro_add}
#define {macro_add}(x,y) ((x) + (y))
#endif

// Nested macro definitions
#if defined(__GNUC__) || defined(__clang__)
    #define COMPILER_MAGIC 1
#else
    #define COMPILER_MAGIC 0
#endif

#if COMPILER_MAGIC
    #define EXECUTE_CODE(code) code
#else  
    #define EXECUTE_CODE(code) do {{ }} while(0)
#endif

// Function-like macro with variable arguments
#define DEBUG_PRINT(fmt, ...) \\
    do {{ \\
        if (0) printf("Debug: " fmt, ##__VA_ARGS__); \\
    }} while(0)

int main() {{
    // String decoding at runtime
    char fmt[] = {macro_fmt};
    {macro_obf}(fmt, {xor_key});
    
    // Dummy variables for confusion
    volatile int {generate_random_name()} = {macro_dummy1};
    volatile int {generate_random_name()} = {macro_dummy2};
    
    // Conditional compilation check
    #ifdef {macro_dummy1}_DEFINED
        EXECUTE_CODE({{
            DEBUG_PRINT("Processing values: %d, %d\\n", {macro_val1}, {macro_val2});
            printf(fmt, {macro_add}({macro_val1}, {macro_val2}));
        }});
    #else
        // This branch will never be taken due to #define above
        printf("Error: Configuration not found\\n");
    #endif
    
    return 0;
}}

// Cleanup macros to avoid pollution
#undef {macro_obf}
#undef {macro_decode}
#undef {macro_check}
#undef {macro_fmt}
#undef {macro_val1}
#undef {macro_val2}
#undef {macro_add}
#undef {macro_dummy1}
#undef {macro_dummy2}
#undef COMPILER_MAGIC
#undef EXECUTE_CODE
#undef DEBUG_PRINT
'''

    log_message(job_id, f"Generated obfuscated code with {len(obf_code)} bytes", log_callback)
    return obf_code

def generate_simple_obfuscated_code(fmt, job_id, log_callback=None):
    """Generate obfuscated code for simple printf"""
    log_message(job_id, "Generating simple preprocessor obfuscation...", log_callback)
    
    macro_fmt = generate_random_name()
    macro_obf = generate_random_name()
    macro_dummy = generate_random_name()
    
    xor_key = secrets.token_bytes(1)[0]
    fmt_encoded = ''.join(f'\\x{ord(c) ^ xor_key:02x}' for c in fmt)
    
    obf_code = f'''
#include <stdio.h>
#include <string.h>

#define {macro_obf}(s,k) do {{ char* p = s; while (*p) {{ *p ^= k; p++; }} }} while(0)
#define {macro_fmt} "{fmt_encoded}"
#define {macro_dummy} {random.randint(100, 999)}

#ifndef SIMPLE_MODE
#define SIMPLE_MODE 1
#endif

int main() {{
    char fmt[] = {macro_fmt};
    {macro_obf}(fmt, {xor_key});
    
    #if SIMPLE_MODE == 1
        printf(fmt);
    #else
        printf("Mode error\\n");
    #endif
    
    return 0;
}}

#undef {macro_obf}
#undef {macro_fmt}
#undef {macro_dummy}
#undef SIMPLE_MODE
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
            "technique": "PreProcessor Trickery", 
            "features": ["Macro Obfuscation", "XOR String Encoding", "Conditional Compilation"],
            "method": "Source Code Transformation"
        },
        "status": "completed"
    }
    return report

def process_preprocessor_trickery_obfuscation(job_id, file_path, parameters, output_folder, log_callback=None):
    """Main preprocessor trickery obfuscation process"""
    try:
        log_message(job_id, "Starting preprocessor trickery obfuscation...", log_callback)
        
        # Read source file
        with open(file_path, "r") as f:
            src = f.read()

        # Obfuscate the source
        obf_code = obfuscate_source(src, job_id, log_callback)

        # Write obfuscated code to temporary file
        file_ext = file_path.suffix
        with tempfile.NamedTemporaryFile(mode='w', suffix=file_ext, delete=False) as f:
            f.write(obf_code)
            temp_file = f.name

        try:
            log_message(job_id, "Compiling obfuscated code...", log_callback)
            
            # Compile
            out_path = output_folder / f"{job_id}.bin"
            compiler = "gcc" if file_path.suffix == ".c" else "g++"
            cmd = [compiler, temp_file, "-o", str(out_path), "-O2", "-s", "-w"]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception(f"Compilation failed: {result.stderr}")
            
            if not out_path.exists():
                raise Exception("Output binary not created")

            # Pack with UPX if available
            if subprocess.run(["which", "upx"], capture_output=True).returncode == 0:
                try:
                    subprocess.run(["upx", "--best", "--lzma", str(out_path)], 
                                 capture_output=True, timeout=60)
                    log_message(job_id, "Compressed with UPX", log_callback)
                except:
                    log_message(job_id, "UPX compression skipped", log_callback)

            # Generate report
            file_size_before = file_path.stat().st_size
            file_size_after = out_path.stat().st_size
            
            report = generate_report(
                job_id,
                file_path.name,
                out_path.name,
                file_size_before,
                file_size_after
            )

            log_message(job_id, "Preprocessor trickery obfuscation completed successfully!", log_callback)

            return {
                "status": "completed",
                "result": report,
                "output_file": str(out_path)
            }

        finally:
            # Clean up temporary file
            if os.path.exists(temp_file):
                os.remove(temp_file)

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