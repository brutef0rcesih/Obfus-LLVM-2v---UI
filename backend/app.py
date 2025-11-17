#!/usr/bin/env python3
"""LLVM obfuscation CLI with persistent job management.

Jobs can be executed immediately or enqueued for a long-running service that
processes queued work on both Linux and Windows.
"""

import argparse
import json
import shutil
import sys
import tempfile
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from types import SimpleNamespace

from string_encryption import (
    check_tools_availability,
    process_string_encryption,
)
from control_flow_obf import (
    check_requirements as check_control_flow_requirements,
    process_control_flow_obfuscation,
)
from bogus_obf import (
    check_requirements as check_bogus_requirements,
    process_bogus_obfuscation,
)
from key_function_virtualization import (
    check_requirements as check_vm_requirements,
    process_key_function_virtualization,
)
from opaque_predicates import (
    check_requirements as check_opaque_requirements,
    process_opaque_predicates_obfuscation,
)
from preprocessor_trickery import (
    check_requirements as check_preprocessor_requirements,
    process_preprocessor_trickery_obfuscation,
)
import address_ob

BACKEND_DIR = Path(__file__).parent.resolve()
UPLOAD_FOLDER = BACKEND_DIR / "uploads"
OUTPUT_FOLDER = BACKEND_DIR / "outputs"
JOB_ROOT = BACKEND_DIR / "jobdata"

UPLOAD_FOLDER.mkdir(exist_ok=True)
OUTPUT_FOLDER.mkdir(exist_ok=True)
JOB_ROOT.mkdir(exist_ok=True)

TECHNIQUE_KEYS = {
    "string-encryption": "stringEncryption",
    "s": "stringEncryption",
    "control-flow": "controlFlow",
    "c": "controlFlow",
    "bogus": "bogus",
    "b": "bogus",
    "key-function-virtualization": "keyFunctionVirtualization",
    "k": "keyFunctionVirtualization",
    "opaque": "opaque",
    "op": "opaque",
    "preprocessor-trickery": "preprocessorTrickery",
    "p": "preprocessorTrickery",
    "address-obfuscation": "addressObfuscation",
    "ad": "addressObfuscation",
}


class JobStore:
    def __init__(self, root: Path):
        self.root = root
        self.jobs_dir = self.root / "jobs"
        self.jobs_dir.mkdir(exist_ok=True)

    def job_dir(self, job_id: str) -> Path:
        return self.jobs_dir / job_id

    def job_path(self, job_id: str) -> Path:
        return self.job_dir(job_id) / "job.json"

    def log_path(self, job_id: str) -> Path:
        return self.job_dir(job_id) / "logs.txt"

    def create_job(
        self,
        input_path: Path,
        upload_path: Path,
        parameters: Dict[str, bool],
        run_mode: str,
        output_path: Optional[Path] = None,
        obf_level: str = "medium",
        upx_level: str = "high",
    ) -> str:
        job_id = str(uuid.uuid4())
        job_dir = self.job_dir(job_id)
        job_dir.mkdir(parents=True, exist_ok=False)
        self.log_path(job_id).touch()

        now = datetime.utcnow().isoformat()
        payload = {
            "job_id": job_id,
            "status": "queued",
            "progress": 0,
            "stage": "Queued",
            "parameters": parameters,
            "obf_level": obf_level,
            "upx_level": upx_level,
            "input_path": str(input_path),
            "upload_path": str(upload_path),
            "output_file": None,
            "result": None,
            "created_at": now,
            "updated_at": now,
            "run_mode": run_mode,
            "requested_output": str(output_path) if output_path else None,
        }
        self._write_json_atomic(self.job_path(job_id), payload)
        return job_id

    def load_job(self, job_id: str) -> Dict[str, object]:
        with self.job_path(job_id).open("r", encoding="utf-8") as handle:
            return json.load(handle)

    def update_job(self, job_id: str, **updates) -> Dict[str, object]:
        job = self.load_job(job_id)
        job.update(updates)
        job["updated_at"] = datetime.utcnow().isoformat()
        self._write_json_atomic(self.job_path(job_id), job)
        return job

    def append_log(self, job_id: str, message: str) -> str:
        timestamp = datetime.now().strftime("%H:%M:%S")
        entry = f"[{timestamp}] {message}"
        with self.log_path(job_id).open("a", encoding="utf-8") as handle:
            handle.write(entry + "\n")
        return entry

    def get_logs(self, job_id: str) -> List[str]:
        log_path = self.log_path(job_id)
        if not log_path.exists():
            return []
        with log_path.open("r", encoding="utf-8") as handle:
            return [line.rstrip("\n") for line in handle]

    def list_jobs(self) -> List[Dict[str, object]]:
        items: List[Dict[str, object]] = []
        for directory in sorted(self.jobs_dir.iterdir()):
            if not directory.is_dir():
                continue
            job_id = directory.name
            try:
                items.append(self.load_job(job_id))
            except FileNotFoundError:
                continue
        items.sort(key=lambda item: item.get("created_at", ""))
        return items

    def reserve_next_job(self) -> Optional[str]:
        candidates: List[Dict[str, object]] = []
        for directory in self.jobs_dir.iterdir():
            if not directory.is_dir():
                continue
            job_id = directory.name
            try:
                job = self.load_job(job_id)
            except FileNotFoundError:
                continue
            if job.get("status") == "queued" and job.get("run_mode") == "service":
                candidates.append(job)
        candidates.sort(key=lambda item: item.get("created_at", ""))

        for job in candidates:
            job_id = job["job_id"]
            lock_dir = self.job_dir(job_id) / ".lock"
            try:
                lock_dir.mkdir()
            except FileExistsError:
                continue
            self.update_job(job_id, status="processing", stage="Initializing...", progress=0)
            return job_id
        return None

    def release_job(self, job_id: str) -> None:
        lock_dir = self.job_dir(job_id) / ".lock"
        if lock_dir.exists():
            try:
                lock_dir.rmdir()
            except OSError:
                pass

    @staticmethod
    def _write_json_atomic(path: Path, payload: Dict[str, object]) -> None:
        tmp_fd, tmp_path = tempfile.mkstemp(dir=str(path.parent), prefix=".tmp", suffix=".json")
        tmp_file = Path(tmp_path)
        try:
            with open(tmp_fd, "w", encoding="utf-8") as handle:
                json.dump(payload, handle, indent=2)
                handle.flush()
            tmp_file.replace(path)
        finally:
            if tmp_file.exists():
                try:
                    tmp_file.unlink()
                except OSError:
                    pass


def _collect_selected_techniques(parameters: Dict[str, bool]) -> List[str]:
    selected = []
    for key in (
        "stringEncryption",
        "controlFlow",
        "bogus",
        "keyFunctionVirtualization",
        "opaque",
        "preprocessorTrickery",
        "addressObfuscation",
    ):
        if parameters.get(key, False):
            selected.append(key)
    return selected


def _copy_to_uploads(src: Path) -> Path:
    target = UPLOAD_FOLDER / src.name
    if src.resolve() != target.resolve():
        shutil.copy2(src, target)
    return target


def _build_parameters(args: argparse.Namespace, overrides: Optional[Dict[str, bool]] = None) -> Dict[str, bool]:
    parameters = {value: False for value in TECHNIQUE_KEYS.values()}

    if args.all:
        for key in parameters:
            parameters[key] = True

    if args.technique:
        for name in args.technique:
            parameters[TECHNIQUE_KEYS[name]] = True

    if overrides:
        for key, value in overrides.items():
            if key in parameters:
                parameters[key] = bool(value)

    return parameters


def _collect_tool_issues(parameters: Dict[str, bool]) -> List[str]:
    issues: List[str] = []

    if parameters.get("stringEncryption", False):
        status = check_tools_availability()
        if not status.get("all_available", False):
            missing = [
                tool
                for tool, available in status.items()
                if tool not in {"all_available", "tool_paths"} and not available
            ]
            if missing:
                issues.append(f"String Encryption missing tools: {', '.join(sorted(missing))}")

    if parameters.get("controlFlow", False):
        status = check_control_flow_requirements()
        if not status.get("all_available", False):
            issues.append("Control Flow requires LLVM toolchain")

    if parameters.get("bogus", False):
        status = check_bogus_requirements()
        if not status.get("all_available", False):
            issues.append("Bogus Code requires LLVM toolchain")

    if parameters.get("keyFunctionVirtualization", False):
        status = check_vm_requirements()
        if not status.get("all_available", False):
            issues.append("Key Function Virtualization requires LLVM and crypto dependencies")

    if parameters.get("opaque", False):
        status = check_opaque_requirements()
        if not status.get("all_available", False):
            issues.append("Opaque Predicates requires LLVM toolchain")

    if parameters.get("preprocessorTrickery", False):
        status = check_preprocessor_requirements()
        if not status.get("all_available", False):
            issues.append("Preprocessor Trickery requires GCC/G++")

    return issues


def get_upx_args(upx_level: str) -> List[str]:
    """Get UPX compression arguments based on level"""
    if upx_level == "off":
        return None  # No compression
    elif upx_level == "low":
        return ["--fast"]  # Fast compression
    elif upx_level == "medium":
        return ["--best", "--lzma"]  # Best with LZMA
    else:  # high
        return ["--best", "--ultra-brute", "--lzma"]  # Maximum compression

def process_obfuscation(job_store: JobStore, job_id: str) -> Dict[str, object]:
    job = job_store.load_job(job_id)
    parameters = job["parameters"]
    upx_level = job.get("upx_level", "high")
    obf_level = job.get("obf_level", "medium")
    file_path = Path(job["upload_path"])
    
    # Inject levels into parameters for obfuscation modules
    parameters["_upx_level"] = upx_level
    parameters["_obf_level"] = obf_level
    parameters["_upx_args"] = get_upx_args(upx_level)

    def log_cb(inner_job_id: str, message: str) -> None:
        entry = job_store.append_log(inner_job_id, message)
        print(f"Job {inner_job_id}: {entry}")

    job_store.update_job(job_id, status="processing", stage="Initializing...", progress=5)
    log_cb(job_id, "Starting obfuscation process...")

    selected = _collect_selected_techniques(parameters)
    log_cb(job_id, f"Selected techniques: {', '.join(selected) if selected else 'None'}")

    results: Dict[str, Dict[str, object]] = {}
    total = len(selected)
    progress_step = 80 / total if total else 80

    job_store.update_job(job_id, stage="Analyzing file structure...", progress=10)

    for index, technique in enumerate(selected):
        progress = 10 + int(index * progress_step)
        if technique == "stringEncryption":
            job_store.update_job(job_id, stage="Processing string encryption obfuscation...", progress=progress)
            result = process_string_encryption(job_id, file_path, parameters, OUTPUT_FOLDER, log_cb)
            results[technique] = result
        elif technique == "controlFlow":
            job_store.update_job(job_id, stage="Processing control flow obfuscation...", progress=progress)
            result = process_control_flow_obfuscation(job_id, file_path, parameters, OUTPUT_FOLDER, log_cb)
            results[technique] = result
        elif technique == "bogus":
            job_store.update_job(job_id, stage="Processing bogus code injection...", progress=progress)
            result = process_bogus_obfuscation(job_id, file_path, parameters, OUTPUT_FOLDER, log_cb)
            results[technique] = result
        elif technique == "keyFunctionVirtualization":
            job_store.update_job(job_id, stage="Processing key function virtualization...", progress=progress)
            result = process_key_function_virtualization(job_id, file_path, parameters, OUTPUT_FOLDER, log_cb)
            results[technique] = result
        elif technique == "opaque":
            job_store.update_job(job_id, stage="Processing opaque predicates...", progress=progress)
            result = process_opaque_predicates_obfuscation(job_id, file_path, parameters, OUTPUT_FOLDER, log_cb)
            results[technique] = result
        elif technique == "preprocessorTrickery":
            job_store.update_job(job_id, stage="Processing preprocessor trickery...", progress=progress)
            result = process_preprocessor_trickery_obfuscation(job_id, file_path, parameters, OUTPUT_FOLDER, log_cb)
            results[technique] = result
        elif technique == "addressObfuscation":
            job_store.update_job(job_id, stage="Processing address obfuscation...", progress=progress)
            result = address_ob.process_address_obfuscation(job_id, file_path, parameters, OUTPUT_FOLDER, log_cb)
            results[technique] = result
        else:
            continue

        if results.get(technique, {}).get("status") == "error":
            error_msg = results[technique].get("error", "Unknown error")
            log_cb(job_id, f"ERROR in {technique}: {error_msg}")
            if "llvm-as" in error_msg and "expected instruction opcode" in error_msg:
                log_cb(job_id, f"LLVM IR syntax error in {technique} - continuing")
            elif "llvm-dis" in error_msg:
                log_cb(job_id, f"LLVM disassembly error in {technique} - continuing")

    successful = [name for name, data in results.items() if data.get("status") == "completed"]
    failed = [name for name, data in results.items() if data.get("status") == "error"]

    if successful:
        primary_result = results[successful[-1]]
        output_path = primary_result.get("output_file")
        resolved_output = Path(output_path).expanduser() if output_path else None
        requested_output = job.get("requested_output")
        if requested_output and resolved_output:
            target = Path(requested_output).expanduser()
            try:
                target_parent = target.parent
                target_parent.mkdir(parents=True, exist_ok=True)
            except Exception as mkdir_error:  # pylint: disable=broad-except
                log_cb(job_id, f"Failed to create output directory {target_parent}: {mkdir_error}")
            else:
                try:
                    shutil.move(str(resolved_output), str(target))
                    resolved_output = target
                    primary_result["output_file"] = str(target)
                    log_cb(job_id, f"Output moved to {target}")
                except Exception as move_error:  # pylint: disable=broad-except
                    log_cb(job_id, f"Failed to move output to requested path: {move_error}")

        output_str = str(resolved_output) if resolved_output else None
        job_store.update_job(
            job_id,
            status="completed",
            stage="Completed!",
            progress=100,
            result={
                "primary": primary_result.get("result"),
                "all_results": results,
                "successful_techniques": successful,
                "failed_techniques": failed,
            },
            output_file=output_str,
        )
        log_cb(job_id, f"Obfuscation completed! Successful: {len(successful)}, Failed: {len(failed)}")
    else:
        error_details = "; ".join(
            f"{name}: {data.get('error', 'unknown error')}" for name, data in results.items()
        ) or "No techniques succeeded"
        job_store.update_job(job_id, status="error", stage="Failed", progress=100, error=error_details)
        log_cb(job_id, f"All selected techniques failed: {error_details}")

    return job_store.load_job(job_id)


def _resolve_output_path(output: Optional[str]) -> Optional[Path]:
    if not output:
        return None
    path = Path(output).expanduser()
    if not path.is_absolute():
        try:
            path = path.resolve()
        except FileNotFoundError:
            path = path.absolute()
    return path


def command_obfuscate(args: argparse.Namespace) -> int:
    job_store = JobStore(JOB_ROOT)

    config = None
    if args.config:
        config_path = Path(args.config).expanduser()
        if not config_path.exists():
            print(f"Config file not found: {config_path}", file=sys.stderr)
            return 1
        with config_path.open("r", encoding="utf-8") as handle:
            config = json.load(handle)

    input_path = Path(args.input).expanduser()
    if not input_path.exists():
        print(f"Input file not found: {input_path}", file=sys.stderr)
        return 1
    if input_path.suffix.lower() != ".c":
        print("Only .c files are supported", file=sys.stderr)
        return 1

    output_name = args.output if args.output else None

    parameters = _build_parameters(args, config)
    if not any(parameters.values()):
        print("At least one obfuscation technique must be selected", file=sys.stderr)
        return 1

    tool_issues = _collect_tool_issues(parameters)
    if tool_issues:
        print("Required tools not available for selected techniques:", file=sys.stderr)
        for issue in tool_issues:
            print(f"  - {issue}", file=sys.stderr)
        return 1

    try:
        upload_path = _copy_to_uploads(input_path)
    except Exception as error:  # pylint: disable=broad-except
        print(f"Failed to copy input: {error}", file=sys.stderr)
        return 1

    run_mode = "service" if args.background else "inline"
    obf_level = getattr(args, 'obf_level', 'medium')
    upx_level = getattr(args, 'upx_level', 'high')
    job_id = job_store.create_job(input_path, upload_path, parameters, run_mode, output_name, obf_level, upx_level)
    print(f"Job {job_id} created")

    if run_mode == "service":
        print("Job queued for background service. Run 'python backend/app.py serve' to process queued jobs.")
        return 0

    job_result = process_obfuscation(job_store, job_id)

    if job_result.get("status") == "completed":
        output_path = job_result.get("output_file")
        if output_path and output_name:
            # Rename to custom output name
            final_path = OUTPUT_FOLDER / output_name
            try:
                Path(output_path).rename(final_path)
                output_path = str(final_path)
                print(f"Obfuscation completed. Output file: {output_path}")
            except Exception as error:
                print(f"Warning: could not rename output to {output_name}: {error}")
                print(f"Obfuscation completed. Output file: {output_path}")
        elif output_path:
            print(f"Obfuscation completed. Output file: {output_path}")
        else:
            print("Obfuscation completed, but output path was not reported.")
        if args.report:
            with Path(args.report).expanduser().open("w", encoding="utf-8") as handle:
                json.dump(job_result.get("result", {}), handle, indent=2)
            print(f"Detailed report written to {args.report}")
        return 0

    print(job_result.get("error", "Job failed"), file=sys.stderr)
    return 1
    return 1


def command_status(args: argparse.Namespace) -> int:
    job_store = JobStore(JOB_ROOT)

    if args.job_id:
        try:
            job = job_store.load_job(args.job_id)
        except FileNotFoundError:
            print(f"Job {args.job_id} not found", file=sys.stderr)
            return 1
        print(json.dumps(job, indent=2))
        return 0

    jobs = job_store.list_jobs()
    if not jobs:
        print("No jobs recorded.")
        return 0

    for job in jobs:
        print(
            f"{job['job_id']}: status={job.get('status')}, progress={job.get('progress')}%, "
            f"stage={job.get('stage', '')}"
        )
    return 0


def command_logs(args: argparse.Namespace) -> int:
    job_store = JobStore(JOB_ROOT)
    logs = job_store.get_logs(args.job_id)
    if not logs:
        print(f"No logs found for job {args.job_id}")
        return 1
    for line in logs:
        print(line)
    return 0


def command_check_tools(_: argparse.Namespace) -> int:
    payload = {
        "overall_available": False,
        "string_encryption": check_tools_availability(),
        "control_flow": check_control_flow_requirements(),
        "bogus": check_bogus_requirements(),
        "key_function_vm": check_vm_requirements(),
        "opaque_predicates": check_opaque_requirements(),
        "preprocessor_trickery": check_preprocessor_requirements(),
    }
    payload["overall_available"] = any(item.get("all_available", False) for item in payload.values())
    print(json.dumps(payload, indent=2))
    return 0


def command_serve(args: argparse.Namespace) -> int:
    job_store = JobStore(JOB_ROOT)
    print("Obfuscation service started. Press Ctrl+C to stop.")

    try:
        while True:
            job_id = job_store.reserve_next_job()
            if not job_id:
                if args.once:
                    return 0
                time.sleep(args.poll_interval)
                continue
            try:
                process_obfuscation(job_store, job_id)
            except Exception as error:  # pylint: disable=broad-except
                job_store.update_job(job_id, status="error", stage="Failed", progress=100, error=str(error))
                job_store.append_log(job_id, f"Service error: {error}")
            finally:
                job_store.release_job(job_id)
            if args.once:
                return 0
    except KeyboardInterrupt:
        print("Service stopping...")
        return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="LLVM Obfuscation CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    obfuscate_parser = subparsers.add_parser("obfuscate", help="Run or queue an obfuscation job")
    obfuscate_parser.add_argument("--input", "-i", required=True, help="Path to the input .c file")
    obfuscate_parser.add_argument(
        "--technique",
        "-t",
        action="append",
        choices=sorted(TECHNIQUE_KEYS.keys()),
        help="Obfuscation technique to apply (can be repeated)",
    )
    obfuscate_parser.add_argument("--all", action="store_true", help="Enable all techniques")
    obfuscate_parser.add_argument(
        "--obf-level",
        choices=["low", "medium", "high"],
        default="medium",
        help="Obfuscation intensity: low (basic), medium (balanced), high (maximum)"
    )
    obfuscate_parser.add_argument(
        "--upx-level",
        choices=["off", "low", "medium", "high"],
        default="high",
        help="UPX compression: off (none), low (fast), medium (balanced), high (ultra-brute)"
    )
    obfuscate_parser.add_argument("--config", help="Path to JSON overrides file")
    obfuscate_parser.add_argument(
        "--background",
        action="store_true",
        help="Queue the job for the long-running service instead of running immediately",
    )
    obfuscate_parser.add_argument("--report", help="Write result JSON to the given path on success")
    obfuscate_parser.add_argument("--output", "-o", help="Move final binary to this path after completion")
    obfuscate_parser.set_defaults(func=command_obfuscate)

    status_parser = subparsers.add_parser("status", help="Show job status")
    status_parser.add_argument("job_id", nargs="?", help="Optional job ID for detailed output")
    status_parser.set_defaults(func=command_status)

    logs_parser = subparsers.add_parser("logs", help="Print job logs")
    logs_parser.add_argument("job_id", help="Job identifier")
    logs_parser.set_defaults(func=command_logs)

    tools_parser = subparsers.add_parser("check-tools", help="Check required tooling availability")
    tools_parser.set_defaults(func=command_check_tools)

    serve_parser = subparsers.add_parser("serve", help="Run the background job processor")
    serve_parser.add_argument(
        "--poll-interval",
        type=float,
        default=2.0,
        help="Seconds between queue polls when idle",
    )
    serve_parser.add_argument(
        "--once",
        action="store_true",
        help="Process at most one queued job and then exit",
    )
    serve_parser.set_defaults(func=command_serve)

    return parser


def main(argv: Optional[List[str]] = None) -> int:
    parser_args = argv if argv is not None else sys.argv[1:]

    if any(arg in {"-ob", "--obfuscate"} for arg in parser_args):
        return run_compact_cli(parser_args)

    parser = build_parser()
    args = parser.parse_args(parser_args)
    return args.func(args)


def run_compact_cli(argv: List[str]) -> int:
    parser = argparse.ArgumentParser(description="LLVM Obfuscation compact CLI")
    parser.add_argument("-ob", "--obfuscate", action="store_true", help="Run an obfuscation job")
    parser.add_argument("-i", "--input", required=True, help="Path to the input .c file")
    parser.add_argument("-s", "--string", action="store_true", help="Enable string encryption")
    parser.add_argument("-b", "--bogus", action="store_true", help="Enable bogus code injection")
    parser.add_argument("-c", "--control", action="store_true", help="Enable control flow obfuscation")
    parser.add_argument("-k", "--key", action="store_true", help="Enable key function virtualization")
    parser.add_argument("-p", "--opaque", action="store_true", help="Enable opaque predicates")
    parser.add_argument("-t", "--trickery", action="store_true", help="Enable preprocessor trickery")
    parser.add_argument("-ad", "--address", action="store_true", help="Enable address obfuscation")
    parser.add_argument("-a", "--all", action="store_true", help="Enable all techniques")
    parser.add_argument(
        "--obf-level",
        choices=["low", "medium", "high"],
        default="medium",
        help="Obfuscation intensity: low (basic), medium (balanced), high (maximum)"
    )
    parser.add_argument(
        "--upx-level",
        choices=["off", "low", "medium", "high"],
        default="high",
        help="UPX compression: off (none), low (fast), medium (balanced), high (ultra-brute)"
    )
    parser.add_argument("-o", "--output", help="Move final binary to this path after completion")
    parser.add_argument("-r", "--report", help="Write detailed JSON report to the given path")
    parser.add_argument("--config", help="Path to JSON overrides file")
    parser.add_argument("-bg", "--background", action="store_true", help="Queue the job instead of running inline")

    args = parser.parse_args(argv)

    if not args.obfuscate:
        parser.error("Use -ob/--obfuscate to start a job")

    technique_flags: List[str] = []
    if args.string:
        technique_flags.append("string-encryption")
    if args.bogus:
        technique_flags.append("bogus")
    if args.control:
        technique_flags.append("control-flow")
    if args.key:
        technique_flags.append("key-function-virtualization")
    if args.opaque:
        technique_flags.append("opaque")
    if args.trickery:
        technique_flags.append("preprocessor-trickery")
    if args.address:
        technique_flags.append("address-obfuscation")

    namespace = SimpleNamespace(
        input=args.input,
        technique=technique_flags if technique_flags else None,
        all=args.all,
        obf_level=args.obf_level,
        upx_level=args.upx_level,
        config=args.config,
        background=args.background,
        report=args.report,
        output=args.output,
    )
    return command_obfuscate(namespace)


if __name__ == "__main__":
    sys.exit(main())