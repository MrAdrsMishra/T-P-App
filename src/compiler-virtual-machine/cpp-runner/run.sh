# #!/bin/sh
# set -e

# # echo "===== cpp-runner: start ====="

# # Prefer files under /app/work when host mounts a directory there (doesn't hide image /app)
# if [ -f /app/work/code.cpp ]; then
#     CODE_PATH="/app/work/code.cpp"
#     INPUT_PATH="/app/work/input.txt"
#     # echo "Using /app/work files"
# else
#     echo "ERROR: code.cpp file not found in /app/work or /app"
#     exit 1
# fi

# # echo "Compiling $CODE_PATH"
# g++ "$CODE_PATH" -o /app/out 2> /app/error.txt || true

# if [ -s /app/error.txt ]; then
#     # echo "===== COMPILATION ERROR ====="
#     cat /app/error.txt
#     exit 1
# fi

# # echo "Running program (input from $INPUT_PATH)"
# /app/out < "$INPUT_PATH"

# # echo "===== cpp-runner: end ====="

#!/bin/sh
set -e

echo "===== cpp-runner: start ====="
echo "[DEBUG] Starting C++ runner..."

echo "[DEBUG] Checking for host-mounted files:"
echo "[DEBUG] Looking for: /app/work/code.cpp"
echo "[DEBUG] Looking for: /app/work/input.txt"

# Prefer files under /app/work when host mounts a directory there
if [ -f /app/work/code.cpp ]; then
    CODE_PATH="/app/work/code.cpp"
    INPUT_PATH="/app/work/input.txt"

    echo "[DEBUG] code.cpp FOUND at: $CODE_PATH"
    echo "[DEBUG] input.txt FOUND at: $INPUT_PATH"

elif [ -f /app/code.cpp ]; then
    CODE_PATH="/app/code.cpp"
    INPUT_PATH="/app/input.txt"

    echo "[DEBUG] code.cpp FOUND at: $CODE_PATH"
    echo "[DEBUG] input.txt FOUND at: $INPUT_PATH"

else
    echo "[ERROR] code.cpp not found in /app/work or /app"
    echo "[DEBUG] Directory listing for /app:"
    ls -al /app 2>/dev/null || echo "[DEBUG] Could not list /app"
    echo "[DEBUG] Directory listing for /app/work:"
    ls -al /app/work 2>/dev/null || echo "[DEBUG] Could not list /app/work"
    exit 1
fi

echo "[DEBUG] Compiling $CODE_PATH using g++..."
g++ "$CODE_PATH" -o /app/out 2> /app/error.txt || true

echo "[DEBUG] Finished compilation. Checking for errors..."

if [ -s /app/error.txt ]; then
    echo "===== COMPILATION ERROR ====="
    cat /app/error.txt
    echo "[DEBUG] Compilation failed with errors above."
    exit 1
fi

echo "[DEBUG] Compilation successful. Running program..."
echo "[DEBUG] Executing: /app/out < $INPUT_PATH"

/app/out < "$INPUT_PATH"

echo "[DEBUG] Program finished executing."
echo "===== cpp-runner: end ====="
