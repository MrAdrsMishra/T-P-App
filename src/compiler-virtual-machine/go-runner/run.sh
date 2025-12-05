#!/bin/sh
set -e

# echo "===== go-runner: start ====="

# Prefer files under /app/work when host mounts a directory there
if [ -f /app/work/code.go ]; then
  CODE_PATH="/app/work/code.go"
  INPUT_PATH="/app/work/input.txt"
#   echo "Using /app/work files"
elif [ -f /app/code.go ]; then
  CODE_PATH="/app/code.go"
  INPUT_PATH="/app/input.txt"
#   echo "Using /app files"
else
  echo "ERROR: code.go not found in /app/work or /app"
  exit 1
fi

# echo "Running $CODE_PATH"
go run "$CODE_PATH" < "$INPUT_PATH"

# echo "===== go-runner: end ====="
