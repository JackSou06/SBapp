#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 /path/to/Sparkle.framework"
  exit 64
fi

SPARKLE_FRAMEWORK="$1"

if [ ! -d "$SPARKLE_FRAMEWORK" ]; then
  echo "Error: Sparkle.framework not found: $SPARKLE_FRAMEWORK" >&2
  exit 66
fi

FRAMEWORK_DIR="$(cd "$(dirname "$SPARKLE_FRAMEWORK")" && pwd)"
OUTPUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/build/native"
SOURCE_FILE="$(cd "$(dirname "$0")/.." && pwd)/native/SparkleUpdateHelper/SparkleUpdateHelper.swift"
OUTPUT_FILE="$OUTPUT_DIR/SparkleUpdateHelper"
MODULE_CACHE_DIR="$OUTPUT_DIR/module-cache"

mkdir -p "$OUTPUT_DIR" "$MODULE_CACHE_DIR"

swiftc \
  -O \
  -parse-as-library \
  -module-cache-path "$MODULE_CACHE_DIR" \
  -framework Sparkle \
  -F "$FRAMEWORK_DIR" \
  -Xlinker -rpath \
  -Xlinker "@executable_path/../Frameworks" \
  "$SOURCE_FILE" \
  -o "$OUTPUT_FILE"

echo "Built $OUTPUT_FILE"
echo "Bundle Sparkle.framework in Contents/Frameworks and SparkleUpdateHelper in Contents/Resources for release builds."
