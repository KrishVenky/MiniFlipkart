"""
Lightweight CI runner that mimics a pipeline locally.
Installs backend dependencies when needed and executes the Jest suite.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.resolve()
BACKEND_DIR = PROJECT_ROOT / "backend"
IS_WINDOWS = os.name == "nt"


def run_command(command: list[str], cwd: Path, check: bool = True) -> subprocess.CompletedProcess:
  """Execute a shell command and stream its output."""
  print(f"\n>> Running {' '.join(command)} (cwd={cwd})")
  
  # On Windows, use shell=True and join command as string for better PATH resolution
  if IS_WINDOWS:
    # Join command parts into a single string for Windows shell
    cmd_str = " ".join(f'"{arg}"' if " " in arg else arg for arg in command)
    result = subprocess.run(
      cmd_str,
      cwd=cwd,
      check=check,
      capture_output=False,
      shell=True,
    )
  else:
    result = subprocess.run(
      command,
      cwd=cwd,
      check=check,
      capture_output=False,
    )
  return result


def ensure_dependencies(force: bool = False) -> None:
  """Install backend dependencies if missing or when forced."""
  node_modules = BACKEND_DIR / "node_modules"
  if force or not node_modules.exists():
    print("Installing backend dependencies...")
    run_command(["npm", "install"], BACKEND_DIR)
    print("✓ Dependencies installed")
  else:
    print("✓ Dependencies already installed. Skipping npm install.")


def run_tests() -> bool:
  """Execute the backend Jest suite (unit + integration)."""
  print("\n" + "=" * 60)
  print("Running Test Suite")
  print("=" * 60)
  try:
    result = run_command(["npm", "test"], BACKEND_DIR, check=False)
    if result.returncode != 0:
      print("\n❌ Tests failed with exit code", result.returncode)
      return False
    print("\n✓ All tests passed")
    return True
  except Exception as e:
    print(f"\n❌ Error running tests: {e}")
    return False


def main() -> None:
  parser = argparse.ArgumentParser(description="MiniFlipkart CI helper")
  parser.add_argument(
    "--force-install",
    action="store_true",
    help="Force npm install even if node_modules exists",
  )
  parser.add_argument(
    "--skip-install",
    action="store_true",
    help="Skip dependency installation",
  )
  args = parser.parse_args()

  print("=" * 60)
  print("MiniFlipkart CI/CD Pipeline")
  print("=" * 60)

  if not args.skip_install:
    ensure_dependencies(force=args.force_install)
  else:
    print("Skipping dependency installation")

  success = run_tests()

  print("\n" + "=" * 60)
  if success:
    print("✓ CI/CD Pipeline: PASSED")
    print("=" * 60)
    sys.exit(0)
  else:
    print("❌ CI/CD Pipeline: FAILED")
    print("=" * 60)
    sys.exit(1)


if __name__ == "__main__":
  main()

