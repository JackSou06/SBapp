#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 /path/to/Subtitle\\ Combine.app 1.2.3"
  exit 64
fi

APP_PATH="$1"
VERSION="$2"

if [ ! -d "$APP_PATH" ]; then
  echo "Error: app bundle not found: $APP_PATH" >&2
  exit 66
fi

if [[ "$APP_PATH" != *.app ]]; then
  echo "Error: first argument must be a .app bundle." >&2
  exit 64
fi

if [[ ! "$VERSION" =~ ^[0-9]+(\.[0-9]+){1,2}([-+][A-Za-z0-9.-]+)?$ ]]; then
  echo "Error: version should look like 1.2.3." >&2
  exit 64
fi

APP_DIR="$(cd "$(dirname "$APP_PATH")" && pwd)"
APP_NAME="$(basename "$APP_PATH" .app)"
ZIP_PATH="$APP_DIR/$APP_NAME-$VERSION.zip"

echo "Creating update archive:"
echo "  $ZIP_PATH"

ditto -c -k --sequesterRsrc --keepParent "$APP_PATH" "$ZIP_PATH"

echo
echo "Done."
echo "Next steps:"
echo "1. Upload $ZIP_PATH to a GitHub Release for version $VERSION."
echo "2. Run Sparkle's generate_appcast against the folder containing your release zip."
echo "3. Commit or publish the generated appcast.xml to GitHub Pages."
echo
echo "Do not store or commit your Sparkle private key in this repo."
