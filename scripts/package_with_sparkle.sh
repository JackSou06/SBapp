#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEFAULT_FRAMEWORK="$REPO_ROOT/native/vendor/Sparkle.framework"

if [ "$#" -gt 1 ]; then
  echo "Usage: $0 [/path/to/Sparkle.framework]"
  exit 64
fi

SPARKLE_FRAMEWORK="${1:-${SPARKLE_FRAMEWORK_PATH:-$DEFAULT_FRAMEWORK}}"

if [ ! -d "$SPARKLE_FRAMEWORK" ]; then
  echo "Error: Sparkle.framework not found." >&2
  echo "Pass it as an argument, set SPARKLE_FRAMEWORK_PATH, or place it at native/vendor/Sparkle.framework." >&2
  exit 66
fi

"$REPO_ROOT/scripts/build_sparkle_helper.sh" "$SPARKLE_FRAMEWORK"

(
  cd "$REPO_ROOT"
  SPARKLE_FRAMEWORK_PATH="$SPARKLE_FRAMEWORK" npm run dist
)

echo
echo "Packaged app:"
echo "  $REPO_ROOT/release/mac-arm64/Subtitle Combine.app"
