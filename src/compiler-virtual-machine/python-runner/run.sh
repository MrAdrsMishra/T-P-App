#!/bin/sh
set -e

# echo "===== python-runner: start ====="

# Prefer files under /app/work when host mounts a directory there
if [ -f /app/work/code.py ]; then
  CODE_PATH="/app/work/code.py"
  INPUT_PATH="/app/work/input.txt"
#   echo "Using /app/work files"
elif [ -f /app/code.py ]; then
  CODE_PATH="/app/code.py"
  INPUT_PATH="/app/input.txt"
#   echo "Using /app files"
else
  echo "ERROR: code.py not found in /app/work or /app"
  exit 1
fi

# echo "Running $CODE_PATH"
python3 "$CODE_PATH" < "$INPUT_PATH"

# echo "===== python-runner: end ====="
