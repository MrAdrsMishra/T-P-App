#!/bin/sh
set -e

CODE_PATH="/app/work/code.rs"
INPUT_PATH="/app/work/input.txt"
WORK_DIR="/app/work"

EXEC_DIR="/tmp"
BIN_WORK="$WORK_DIR/app"
BIN_EXEC="$EXEC_DIR/app"

if [ ! -f "$CODE_PATH" ]; then
  echo "ERROR: code.rs not found"
  exit 1
fi

# Compile (allowed)
rustc "$CODE_PATH" -O -o "$BIN_WORK" 2> "$WORK_DIR/error.txt" || true

if [ -s "$WORK_DIR/error.txt" ]; then
  cat "$WORK_DIR/error.txt"
  exit 1
fi

# Move to exec-enabled FS
cp "$BIN_WORK" "$BIN_EXEC"
chmod +x "$BIN_EXEC"

# Run
if [ -f "$INPUT_PATH" ]; then
  "$BIN_EXEC" < "$INPUT_PATH"
else
  "$BIN_EXEC"
fi
