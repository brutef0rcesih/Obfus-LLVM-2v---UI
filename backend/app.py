import os
import sys
import uuid
import shutil
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import threading
from datetime import datetime

# Import obfuscation modules
from string_encryption import process_string_encryption, check_tools_availability
from control_flow_obf import process_control_flow_obfuscation, check_requirements as check_control_flow_requirements
from bogus_obf import process_bogus_obfuscation, check_requirements as check_bogus_requirements
from key_function_virtualization import process_key_function_virtualization, check_requirements as check_vm_requirements
from opaque_predicates import process_opaque_predicates_obfuscation, check_requirements as check_opaque_requirements
from preprocessor_trickery import process_preprocessor_trickery_obfuscation, check_requirements as check_preprocessor_requirements

app = Flask(__name__)
CORS(app)

# Configuration - Use absolute paths relative to this file
BACKEND_DIR = Path(__file__).parent.absolute()
UPLOAD_FOLDER = BACKEND_DIR / 'uploads'
OUTPUT_FOLDER = BACKEND_DIR / 'outputs'
UPLOAD_FOLDER.mkdir(exist_ok=True)
OUTPUT_FOLDER.mkdir(exist_ok=True)

print(f"Upload folder: {UPLOAD_FOLDER}")
print(f"Output folder: {OUTPUT_FOLDER}")

# Store job status and logs
jobs = {}
logs_store = {}

def log_message(job_id, message):
    """Log message with timestamp"""
    timestamp = datetime.now().strftime('%H:%M:%S')
    log_entry = f'[{timestamp}] {message}'
    if job_id not in logs_store:
        logs_store[job_id] = []
    logs_store[job_id].append(log_entry)
    print(f"Job {job_id}: {log_entry}")

def process_obfuscation(job_id, file_path, parameters):
    """Main obfuscation process that routes to different obfuscation modules"""
    try:
        jobs[job_id] = {"status": "processing", "progress": 0, "stage": "Initializing..."}
        log_message(job_id, "Starting obfuscation process...")
        
        jobs[job_id]["progress"] = 10
        jobs[job_id]["stage"] = "Analyzing file structure..."
        
        # Collect selected techniques
        selected_techniques = []
        if parameters.get('stringEncryption', False):
            selected_techniques.append('stringEncryption')
        if parameters.get('controlFlow', False):
            selected_techniques.append('controlFlow')
        if parameters.get('bogus', False):
            selected_techniques.append('bogus')
        if parameters.get('keyFunctionVirtualization', False):
            selected_techniques.append('keyFunctionVirtualization')
        if parameters.get('opaque', False):
            selected_techniques.append('opaque')
        if parameters.get('preprocessorTrickery', False):
            selected_techniques.append('preprocessorTrickery')
        
        log_message(job_id, f"Selected techniques: {', '.join(selected_techniques)}")
        
        # Process each selected obfuscation technique
        results = {}
        total_techniques = len(selected_techniques)
        progress_step = 80 / total_techniques if total_techniques > 0 else 80
        
        for i, technique in enumerate(selected_techniques):
            progress = 10 + (i * progress_step)
            jobs[job_id]["progress"] = int(progress)
            
            if technique == 'stringEncryption':
                jobs[job_id]["stage"] = "Processing string encryption obfuscation..."
                result = process_string_encryption(job_id, file_path, parameters, OUTPUT_FOLDER, log_message)
                results['stringEncryption'] = result
                
            elif technique == 'controlFlow':
                jobs[job_id]["stage"] = "Processing control flow obfuscation..."
                result = process_control_flow_obfuscation(job_id, file_path, parameters, OUTPUT_FOLDER, log_message)
                results['controlFlow'] = result
                
            elif technique == 'bogus':
                jobs[job_id]["stage"] = "Processing bogus code injection..."
                result = process_bogus_obfuscation(job_id, file_path, parameters, OUTPUT_FOLDER, log_message)
                results['bogus'] = result
                
            elif technique == 'keyFunctionVirtualization':
                jobs[job_id]["stage"] = "Processing key function virtualization..."
                result = process_key_function_virtualization(job_id, file_path, parameters, OUTPUT_FOLDER, log_message)
                results['keyFunctionVirtualization'] = result
                
            elif technique == 'opaque':
                jobs[job_id]["stage"] = "Processing opaque predicates..."
                result = process_opaque_predicates_obfuscation(job_id, file_path, parameters, OUTPUT_FOLDER, log_message)
                results['opaque'] = result
                
            elif technique == 'preprocessorTrickery':
                jobs[job_id]["stage"] = "Processing preprocessor trickery..."
                result = process_preprocessor_trickery_obfuscation(job_id, file_path, parameters, OUTPUT_FOLDER, log_message)
                results['preprocessorTrickery'] = result
            
            # Check if this technique failed
            if results[technique]["status"] == "error":
                error_msg = results[technique]["error"]
                log_message(job_id, f"ERROR in {technique}: {error_msg}")
                
                # Provide specific guidance for LLVM IR errors
                if "llvm-as" in error_msg and "expected instruction opcode" in error_msg:
                    log_message(job_id, f"LLVM IR syntax error in {technique} - attempting to continue with other methods")
                elif "llvm-dis" in error_msg:
                    log_message(job_id, f"LLVM disassembly error in {technique} - attempting to continue with other methods")
                
                # Continue with other techniques instead of failing completely
        
        # Check if at least one technique succeeded
        successful_techniques = [k for k, v in results.items() if v["status"] == "completed"]
        failed_techniques = [k for k, v in results.items() if v["status"] == "error"]
        
        if successful_techniques:
            # Use the last successful result as the primary output
            primary_result = results[successful_techniques[-1]]
            
            jobs[job_id]["progress"] = 100
            jobs[job_id]["stage"] = "Completed!"
            jobs[job_id]["status"] = "completed"
            jobs[job_id]["result"] = {
                "primary": primary_result["result"],
                "all_results": results,
                "successful_techniques": successful_techniques,
                "failed_techniques": failed_techniques
            }
            jobs[job_id]["output_file"] = primary_result["output_file"]
            
            log_message(job_id, f"Obfuscation completed! Successful: {len(successful_techniques)}, Failed: {len(failed_techniques)}")
            
        else:
            # All techniques failed
            error_details = "; ".join([f"{k}: {v['error']}" for k, v in results.items()])
            jobs[job_id]["status"] = "error"
            jobs[job_id]["error"] = f"All selected techniques failed: {error_details}"
            
    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)
        log_message(job_id, f"ERROR: {str(e)}")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "message": "Backend is running"
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        filename = secure_filename(file.filename)
        file_path = UPLOAD_FOLDER / filename
        
        # Save the file
        file.save(str(file_path))
        
        # Verify file was saved
        if not file_path.exists():
            return jsonify({"error": f"Failed to save file to {file_path}"}), 500
        
        file_size = file_path.stat().st_size
        print(f"File uploaded: {filename} ({file_size} bytes) to {file_path}")
        
        return jsonify({
            "message": "File uploaded successfully",
            "filename": filename,
            "size": file_size
        })
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Upload error: {error_trace}")
        return jsonify({
            "error": "File upload failed",
            "details": str(e)
        }), 500

@app.route('/api/check-tools', methods=['GET'])
def check_tools():
    """Check if required tools are available for all obfuscation techniques"""
    tools_status = {
        'string_encryption': check_tools_availability(),
        'control_flow': check_control_flow_requirements(),
        'bogus': check_bogus_requirements(),
        'key_function_vm': check_vm_requirements(),
        'opaque_predicates': check_opaque_requirements(),
        'preprocessor_trickery': check_preprocessor_requirements()
    }
    
    # Overall status - true if at least one technique has all tools
    overall_status = any(status.get('all_available', False) for status in tools_status.values())
    tools_status['overall_available'] = overall_status
    
    return jsonify(tools_status)

@app.route('/api/obfuscate', methods=['POST'])
def start_obfuscation():
    try:
        if not request.json:
            return jsonify({"error": "No JSON data provided"}), 400
            
        data = request.json
        filename = data.get('filename')
        parameters = data.get('parameters', {})
        
        if not filename:
            return jsonify({"error": "Filename required"}), 400
        
        file_path = UPLOAD_FOLDER / filename
        if not file_path.exists():
            # List available files for debugging
            available_files = [f.name for f in UPLOAD_FOLDER.iterdir() if f.is_file()]
            print(f"Requested file: {filename}")
            print(f"Available files: {available_files}")
            return jsonify({
                "error": f"File not found: {filename}",
                "details": f"Upload folder: {UPLOAD_FOLDER}",
                "available_files": available_files
            }), 404
        
        # Check file extension
        if file_path.suffix.lower() != '.c':
            return jsonify({
                "error": "Only .c files are supported",
                "details": f"File extension: {file_path.suffix}"
            }), 400
        
        # Check if at least one obfuscation technique is selected
        techniques_selected = any([
            parameters.get('stringEncryption', False),
            parameters.get('controlFlow', False),
            parameters.get('bogus', False),
            parameters.get('keyFunctionVirtualization', False),
            parameters.get('opaque', False),
            parameters.get('preprocessorTrickery', False)
        ])
        
        if not techniques_selected:
            return jsonify({"error": "At least one obfuscation technique must be selected"}), 400
        
        # Check if tools are available for selected techniques
        tool_issues = []
        
        if parameters.get('stringEncryption', False):
            tools_status = check_tools_availability()
            if not tools_status.get('all_available', False):
                missing_tools = [tool for tool, available in tools_status.items() 
                               if tool != 'all_available' and tool != 'tool_paths' and not available]
                tool_issues.append(f"String Encryption: Missing tools {', '.join(missing_tools)}")
        
        if parameters.get('controlFlow', False):
            cf_status = check_control_flow_requirements()
            if not cf_status.get('all_available', False):
                tool_issues.append("Control Flow: LLVM tools required")
                
        if parameters.get('bogus', False):
            bogus_status = check_bogus_requirements()
            if not bogus_status.get('all_available', False):
                tool_issues.append("Bogus Code: LLVM tools required")
                
        if parameters.get('keyFunctionVirtualization', False):
            vm_status = check_vm_requirements()
            if not vm_status.get('all_available', False):
                tool_issues.append("Function VM: LLVM and Crypto tools required")
                
        if parameters.get('opaque', False):
            opaque_status = check_opaque_requirements()
            if not opaque_status.get('all_available', False):
                tool_issues.append("Opaque Predicates: LLVM tools required")
                
        if parameters.get('preprocessorTrickery', False):
            pp_status = check_preprocessor_requirements()
            if not pp_status.get('all_available', False):
                tool_issues.append("PreProcessor Trickery: GCC/G++ required")
        
        if tool_issues:
            return jsonify({
                "error": "Required tools not found for selected techniques",
                "details": tool_issues,
                "suggestion": "Please install LLVM package and required compilers"
            }), 500
        
        job_id = str(uuid.uuid4())
        jobs[job_id] = {"status": "queued", "progress": 0}
        
        # Start processing in background thread
        thread = threading.Thread(target=process_obfuscation, args=(job_id, file_path, parameters))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            "job_id": job_id,
            "status": "queued"
        })
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in start_obfuscation: {error_trace}")
        return jsonify({
            "error": "Internal server error",
            "details": str(e),
            "trace": error_trace if app.debug else None
        }), 500

@app.route('/api/job/<job_id>', methods=['GET'])
def get_job_status(job_id):
    if job_id not in jobs:
        return jsonify({"error": "Job not found"}), 404
    
    job = jobs[job_id].copy()
    if 'output_file' in job:
        job['output_file'] = Path(job['output_file']).name
    
    return jsonify(job)

@app.route('/api/job/<job_id>/logs', methods=['GET'])
def get_job_logs(job_id):
    if job_id not in logs_store:
        return jsonify({"logs": []})
    
    return jsonify({"logs": logs_store[job_id]})

@app.route('/api/job/<job_id>/analysis', methods=['GET'])
def get_detailed_analysis(job_id):
    """Get detailed analysis metrics for a completed job"""
    if job_id not in jobs or jobs[job_id]['status'] != 'completed':
        return jsonify({"error": "Job not completed or not found"}), 404
    
    job = jobs[job_id]
    result = job.get('result', {})
    
    # Calculate detailed metrics
    analysis = {
        "job_id": job_id,
        "timestamp": datetime.now().isoformat(),
        "techniques": {
            "successful": result.get('successful_techniques', []),
            "failed": result.get('failed_techniques', []),
            "total_attempted": len(result.get('successful_techniques', [])) + len(result.get('failed_techniques', []))
        },
        "file_metrics": {},
        "security_score": 0,
        "complexity_score": 0,
        "performance_impact": {},
        "obfuscation_density": {}
    }
    
    # Extract file metrics from primary result
    primary = result.get('primary', {})
    if primary.get('file_size'):
        before_size = primary['file_size'].get('before', 0)
        after_size = primary['file_size'].get('after', 0)
        
        analysis["file_metrics"] = {
            "size_before": before_size,
            "size_after": after_size,
            "size_change_bytes": after_size - before_size,
            "size_change_percent": ((after_size - before_size) / before_size * 100) if before_size > 0 else 0,
            "compression_ratio": (after_size / before_size) if before_size > 0 else 1
        }
    
    # Calculate security score based on successful techniques and their features
    security_score = 0
    complexity_score = 0
    
    all_results = result.get('all_results', {})
    technique_scores = {}
    
    for technique, data in all_results.items():
        if data.get('status') == 'completed':
            technique_result = data.get('result', {})
            obfuscation = technique_result.get('obfuscation', {})
            
            # Calculate technique-specific scores
            tech_score = 0
            tech_complexity = 0
            
            if technique == 'stringEncryption':
                strings_encrypted = obfuscation.get('strings_encrypted', 0)
                tech_score = min(25, strings_encrypted * 5)
                tech_complexity = strings_encrypted * 2
                
            elif technique == 'controlFlow':
                functions_obfuscated = obfuscation.get('functions_obfuscated', 0)
                tech_score = min(30, functions_obfuscated * 15)
                tech_complexity = functions_obfuscated * 10
                
            elif technique == 'bogus':
                instructions_added = obfuscation.get('instructions_added', 0)
                tech_score = min(20, instructions_added / 5)
                tech_complexity = instructions_added / 2
                
            elif technique == 'keyFunctionVirtualization':
                tech_score = 35  # VM-based obfuscation is inherently high value
                tech_complexity = 50
                
            elif technique == 'opaque':
                predicates = obfuscation.get('opaque_predicates', 0)
                tech_score = min(25, predicates * 3)
                tech_complexity = predicates * 5
                
            elif technique == 'preprocessorTrickery':
                macros = obfuscation.get('macro_count', 0)
                tech_score = min(15, macros * 2)
                tech_complexity = macros * 3
            
            technique_scores[technique] = {
                "security_contribution": tech_score,
                "complexity_contribution": tech_complexity,
                "features": obfuscation.get('features', []),
                "method": obfuscation.get('method', 'Unknown')
            }
            
            security_score += tech_score
            complexity_score += tech_complexity
    
    # Normalize scores
    analysis["security_score"] = min(100, security_score)
    analysis["complexity_score"] = min(100, complexity_score)
    analysis["technique_scores"] = technique_scores
    
    # Calculate performance impact estimation
    analysis["performance_impact"] = {
        "estimated_slowdown_percent": len(result.get('successful_techniques', [])) * 5,  # Rough estimate
        "memory_overhead_percent": len(result.get('successful_techniques', [])) * 3,
        "startup_delay_ms": len(result.get('successful_techniques', [])) * 10
    }
    
    # Calculate obfuscation density
    total_techniques_available = 6  # Total number of obfuscation techniques
    successful_count = len(result.get('successful_techniques', []))
    
    analysis["obfuscation_density"] = {
        "techniques_used": successful_count,
        "techniques_available": total_techniques_available,
        "coverage_percent": (successful_count / total_techniques_available) * 100,
        "redundancy_level": "High" if successful_count >= 4 else "Medium" if successful_count >= 2 else "Low"
    }
    
    # Overall assessment
    analysis["overall_assessment"] = {
        "protection_level": (
            "Excellent" if analysis["security_score"] >= 80 else
            "Good" if analysis["security_score"] >= 60 else
            "Moderate" if analysis["security_score"] >= 40 else
            "Basic"
        ),
        "reverse_engineering_difficulty": (
            "Very Hard" if complexity_score >= 80 else
            "Hard" if complexity_score >= 60 else
            "Moderate" if complexity_score >= 40 else
            "Easy"
        ),
        "recommended_improvements": []
    }
    
    # Generate recommendations
    if successful_count < 3:
        analysis["overall_assessment"]["recommended_improvements"].append(
            "Consider applying additional obfuscation techniques for better protection"
        )
    if analysis["security_score"] < 60:
        analysis["overall_assessment"]["recommended_improvements"].append(
            "Increase obfuscation intensity by targeting more code elements"
        )
    if len(result.get('failed_techniques', [])) > 0:
        analysis["overall_assessment"]["recommended_improvements"].append(
            "Address failed techniques to improve overall coverage"
        )
    
    return jsonify(analysis)

@app.route('/api/job/<job_id>/download', methods=['GET'])
def download_file(job_id):
    if job_id not in jobs or jobs[job_id]['status'] != 'completed':
        return jsonify({"error": "Job not completed"}), 404
    
    output_file = Path(jobs[job_id]['output_file'])
    if not output_file.exists():
        return jsonify({"error": "Output file not found"}), 404
    
    return send_file(str(output_file), as_attachment=True)

if __name__ == '__main__':
    print("=" * 60)
    print("LLVM Obfuscation Backend Starting...")
    print("=" * 60)
    
    # Check tools availability for string encryption on startup
    tools_status = check_tools_availability()
    def check_tool_status(available):
        return '✓' if available else '✗'
    
    print("Core LLVM Tools:")
    print(f"CLANG: {tools_status['tool_paths']['clang']} ({check_tool_status(tools_status['clang'])})")
    print(f"LLVM-DIS: {tools_status['tool_paths']['llvm-dis']} ({check_tool_status(tools_status['llvm-dis'])})")
    print(f"LLVM-AS: {tools_status['tool_paths']['llvm-as']} ({check_tool_status(tools_status['llvm-as'])})")
    print(f"LLC: {tools_status['tool_paths']['llc']} ({check_tool_status(tools_status['llc'])})")
    print(f"GCC: {tools_status['tool_paths']['gcc']} ({check_tool_status(tools_status['gcc'])})")
    print("=" * 60)
    print("Available Obfuscation Modules:")
    print("  ✓ String Encryption (AES-256-CBC)")
    print("  ✓ Control Flow Obfuscation")
    print("  ✓ Bogus Code Injection")
    print("  ✓ Key Function Virtualization")
    print("  ✓ Opaque Predicates")
    print("  ✓ PreProcessor Trickery")
    print("=" * 60)
    print("Server starting on http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, port=5000)