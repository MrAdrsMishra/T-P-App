# #!/bin/sh
# set -e

# # echo "===== java-runner: start ====="

# # Prefer files under /app/work when host mounts a directory there
# if [ -f /app/work/code.java ]; then
#   CODE_PATH="/app/work/code.java"
#   INPUT_PATH="/app/work/input.txt"
#   WORK_DIR="/app/work"
#   # echo "Using /app/work files"
# else
#   echo "ERROR: code.java not found in /app/work or /app"
#   exit 1
# fi

# # echo "Compiling $CODE_PATH"
# # Extract class name from filename (code.java -> code)
# CLASS_NAME=$(basename "$CODE_PATH" .java)

# # Compile in the work directory
# javac -d "$WORK_DIR" "$CODE_PATH" 2> /app/error.txt || true

# if [ -s /app/error.txt ]; then
#   # echo "===== COMPILATION ERROR ====="
#   cat /app/error.txt
#   exit 1
# fi

# # echo "Running program (input from $INPUT_PATH)"
# # Run the compiled class from the work directory
# cd "$WORK_DIR"
# java "$CLASS_NAME" < "$INPUT_PATH"

# # echo "===== java-runner: end ====="


#!/bin/sh
set -e

# Use /app/work for mounted code
CODE_PATH="/app/work/code.java"
INPUT_PATH="/app/work/input.txt"
WORK_DIR="/app/work"

if [ ! -f "$CODE_PATH" ]; then
  echo "ERROR: code.java not fodoceund"
  exit 1
fi

CLASS_NAME=$(basename "$CODE_PATH" .java)

# Compile in work directory and redirect errors to writable location
javac -d "$WORK_DIR" "$CODE_PATH" 2> "$WORK_DIR/error.txt" || true

if [ -s "$WORK_DIR/error.txt" ]; then
  cat "$WORK_DIR/error.txt"
  exit 1
fi

# Run the compiled class
cd "$WORK_DIR"
java "$CLASS_NAME" < "$INPUT_PATH"
