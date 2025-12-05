#!/bin/sh
set -e

# echo "===== rust-runner: start ====="

# Prefer files under /app/work when host mounts a directory there
if [ -f /app/work/code.rs ]; then
  CODE_PATH="/app/work/code.rs"
  INPUT_PATH="/app/work/input.txt"
  WORK_DIR="/app/work"
  # echo "Using /app/work files"
elif [ -f /app/code.rs ]; then
  CODE_PATH="/app/code.rs"
  INPUT_PATH="/app/input.txt"
  WORK_DIR="/app"
  # echo "Using /app files"
else
  echo "ERROR: code.rs not found in /app/work or /app"
  exit 1
fi

# echo "Compiling $CODE_PATH"
rustc "$CODE_PATH" -o "$WORK_DIR/output" 2> /app/error.txt || true

if [ -s /app/error.txt ]; then
  # echo "===== COMPILATION ERROR ====="
  cat /app/error.txt
  exit 1
fi

# echo "Running program (input from $INPUT_PATH)"
"$WORK_DIR/output" < "$INPUT_PATH"

# echo "===== rust-runner: end ====="
