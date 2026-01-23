#!/bin/sh
set -e

# echo "===== cpp-runner: start ====="

# Prefer files under /app/work when host mounts a directory there
WORK_DIR="/app/work"
CODE_PATH="$WORK_DIR/code.cpp"
INPUT_PATH="$WORK_DIR/input.txt"
ERROR_PATH="$WORK_DIR/error.txt"

BUILD_DIR="/tmp/build"
EXEC_DIR="/tmp/exec"
BIN_BUILD="$BUILD_DIR/a.out"
BIN_EXEC="$EXEC_DIR/a.out"

mkdir -p "$BUILD_DIR" "$EXEC_DIR" "$WORK_DIR"

if [ ! -f "$CODE_PATH" ]; then
  echo "ERROR: code.cpp not found"
  exit 1
fi

# Compile
g++ "$CODE_PATH" -O2 -std=gnu++17 -o "$BIN_BUILD" 2> "$ERROR_PATH" || true

if [ -s "$ERROR_PATH" ]; then
  cat "$ERROR_PATH"
  exit 1
fi

# Move to exec-allowed fs
cp "$BIN_BUILD" "$BIN_EXEC"
chmod +x "$BIN_EXEC"

# Run
if [ -f "$INPUT_PATH" ]; then
  "$BIN_EXEC" < "$INPUT_PATH"
else
  "$BIN_EXEC"
fi

# echo "===== cpp-runner: end ====="
