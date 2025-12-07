#!/usr/bin/env bash
set -euo pipefail

# Directory to store outputs
OUT_DIR="runs"
mkdir -p "$OUT_DIR"

# Helper to run an algo and extract trailing JSON block (the summary)
# Usage: run_algo fcfs        -> saves runs/fcfs.json
#        run_algo rr 2       -> saves runs/rr_q2.json
run_algo() {
  algo="$1"
  shift
  suffix="$algo"
  if [ $# -gt 0 ]; then
    # join args with underscores for filename
    suffix="${algo}_$(printf '%s_' "$@" | sed 's/_$//; s/ /_/g; s/ /_/g')"
  fi

  out="$OUT_DIR/${suffix}.raw"
  json_out="$OUT_DIR/${suffix}.json"

  echo "Running: ./scheduler $algo $*  -> $json_out"
  # run and capture stdout
  # timeout could be used if you want safety; not used here
  ./scheduler "$algo" "$@" > "$out" 2>&1 || {
    echo "Run failed for $algo $* -- see $out"
    return 1
  }

  # extract last JSON object in the file (assumes summary JSON is the last { ... } block)
  # This uses awk: print from the last line that starts with "{" to the end
  # More robust: find the last '{' and print from there to the last '}'.
  # We'll do a safe grep/awk sequence:
  tac "$out" | awk 'BEGIN{found=0} /\{/ && !found {found=1} found{print} /\}/ && found && /{/ {exit}' | tac > "$json_out" || {
    echo "Failed to extract JSON summary for $algo $*"
    return 1
  }

  echo "Saved summary -> $json_out"
}

# Algorithms to run: edit this list if you want different quanta or variants
run_algo fcfs
run_algo sjf
run_algo srtf
run_algo priority
run_algo priority_p
run_algo rr 2
run_algo rr 4
run_algo mlfq

echo "All runs complete. Summaries in $OUT_DIR/"
