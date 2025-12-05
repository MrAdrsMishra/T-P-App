#!/bin/sh
set -e

# echo "===== javascript-runner: start ====="

# Prefer files under /app/work when host mounts a directory there
if [ -f /app/work/code.js ]; then
  CODE_PATH="/app/work/code.js"
  INPUT_PATH="/app/work/input.txt"
#   echo "Using /app/work files"
elif [ -f /app/code.js ]; then
  CODE_PATH="/app/code.js"
  INPUT_PATH="/app/input.txt"
#   echo "Using /app files"
else
  echo "ERROR: code.js not found in /app/work or /app"
  exit 1
fi

# echo "Running $CODE_PATH"
node "$CODE_PATH" < "$INPUT_PATH"

# echo "===== javascript-runner: end ====="