# SBapp

A desktop file tools app. The first tool combines multiple `.srt` files in a user-defined order and exports the SRT text as a `.txt` file.

## Current Tools

- SRT to TXT: drag or select `.srt` files, reorder them, preview combined text, and export `.txt`.
- PDF Merge: placeholder in the main menu for a future tool.

## Tech Stack

- Electron
- React
- TypeScript
- Vite

## Development

```bash
npm install
npm run dev
```

If Electron's binary download is blocked, install dependencies temporarily with:

```bash
npm install --ignore-scripts
```

That allows typechecking and renderer builds, but the desktop app needs Electron's postinstall step to complete before it can launch.

If `npm rebuild electron` hangs while downloading the Electron binary, download and install the macOS arm64 artifact manually:

```bash
curl -L --fail -o /private/tmp/electron-v37.10.3-darwin-arm64.zip https://github.com/electron/electron/releases/download/v37.10.3/electron-v37.10.3-darwin-arm64.zip
mkdir -p node_modules/electron/dist
unzip -q -o /private/tmp/electron-v37.10.3-darwin-arm64.zip -d node_modules/electron/dist
printf 'Electron.app/Contents/MacOS/Electron' > node_modules/electron/path.txt
npm rebuild electron
```

## Verification

```bash
npm run typecheck
npm run build
```
