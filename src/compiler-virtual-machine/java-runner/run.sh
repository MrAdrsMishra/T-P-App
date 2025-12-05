#!/bin/sh
set -e

# echo "===== java-runner: start ====="

# Prefer files under /app/work when host mounts a directory there
if [ -f /app/work/code.java ]; then
  CODE_PATH="/app/work/code.java"
  INPUT_PATH="/app/work/input.txt"
  WORK_DIR="/app/work"
  # echo "Using /app/work files"
elif [ -f /app/code.java ]; then
  CODE_PATH="/app/code.java"
  INPUT_PATH="/app/input.txt"
  WORK_DIR="/app"
  # echo "Using /app files"
else
  echo "ERROR: code.java not found in /app/work or /app"
  exit 1
fi

# echo "Compiling $CODE_PATH"
# Extract class name from filename (code.java -> code)
CLASS_NAME=$(basename "$CODE_PATH" .java)

# Compile in the work directory
javac -d "$WORK_DIR" "$CODE_PATH" 2> /app/error.txt || true

if [ -s /app/error.txt ]; then
  # echo "===== COMPILATION ERROR ====="
  cat /app/error.txt
  exit 1
fi

# echo "Running program (input from $INPUT_PATH)"
# Run the compiled class from the work directory
cd "$WORK_DIR"
java "$CLASS_NAME" < "$INPUT_PATH"

# echo "===== java-runner: end ====="
