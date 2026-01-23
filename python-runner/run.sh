#!/bin/sh
set -e

# echo "===== python-runner: start ====="

if [ -f /app/work/code.py ]; then
  CODE_PATH="/app/work/code.py"
  INPUT_PATH="/app/work/input.txt"
#   echo "Using /app/work files"
else
  echo "atleast started\n"
  echo "ERROR: code.py not found in /app/work or /app"
  exit 1
fi

# echo "Running $CODE_PATH"
python3 "$CODE_PATH" < "$INPUT_PATH"

