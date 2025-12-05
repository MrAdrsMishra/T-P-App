#!/bin/sh
set -e

# echo "===== cpp-runner: start ====="

# Prefer files under /app/work when host mounts a directory there (doesn't hide image /app)
if [ -f /app/work/code.cpp ]; then
    CODE_PATH="/app/work/code.cpp"
    INPUT_PATH="/app/work/input.txt"
    # echo "Using /app/work files"
elif [ -f /app/code.cpp ]; then
    CODE_PATH="/app/code.cpp"
    INPUT_PATH="/app/input.txt"
    # echo "Using /app files"
else
    echo "ERROR: code file not found in /app/work or /app"
    exit 1
fi

# echo "Compiling $CODE_PATH"
g++ "$CODE_PATH" -o /app/out 2> /app/error.txt || true

if [ -s /app/error.txt ]; then
    # echo "===== COMPILATION ERROR ====="
    cat /app/error.txt
    exit 1
fi

# echo "Running program (input from $INPUT_PATH)"
/app/out < "$INPUT_PATH"

# echo "===== cpp-runner: end ====="